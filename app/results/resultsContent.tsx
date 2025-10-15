'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, MessageCircle } from 'lucide-react';
import ChatInterface from '@/components/ChatInterface';

// Enhanced prescription text formatting function
const formatPrescriptionText = (text: string): string => {
    // First escape HTML entities to prevent XSS
    const escapeHtml = (unsafe: string) => {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };
    
    const escaped = escapeHtml(text);
    
    return escaped
        // Headers
        .replace(/### (.*?)\n/g, '<h3 class="text-lg font-semibold text-gray-900 mt-6 mb-3 border-b border-gray-200 pb-2">$1</h3>')
        .replace(/## (.*?)\n/g, '<h2 class="text-xl font-bold text-gray-900 mt-8 mb-4">$1</h2>')
        .replace(/# (.*?)\n/g, '<h1 class="text-2xl font-bold text-gray-900 mt-8 mb-4">$1</h1>')
        
        // Bold and italic text
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em class="italic text-gray-700">$1</em>')
        
        // Handle nested bullet points with proper indentation
        .replace(/^(\s*)\*\s+(.+)$/gm, (match, spaces, content) => {
            const indentLevel = spaces.length / 2; // Assuming 2 spaces per indent level
            const marginLeft = indentLevel * 16; // 16px per indent level
            return `<div class="flex items-start mb-2" style="margin-left: ${marginLeft}px">
                <span class="text-gray-600 mr-3 mt-1.5 text-xs">•</span>
                <div class="flex-1">${content}</div>
            </div>`;
        })
        
        // Handle numbered lists
        .replace(/^(\s*)(\d+\.)\s+(.+)$/gm, (match, spaces, number, content) => {
            const indentLevel = spaces.length / 2;
            const marginLeft = indentLevel * 16;
            return `<div class="flex items-start mb-3" style="margin-left: ${marginLeft}px">
                <span class="font-semibold text-gray-700 mr-3 mt-0.5">${number}</span>
                <div class="flex-1">${content}</div>
            </div>`;
        })
        
        // Handle horizontal rules
        .replace(/^---$/gm, '<hr class="my-6 border-gray-300">')
        
        // Handle paragraphs - split by double newlines
        .split(/\n\n+/)
        .map(paragraph => {
            // Skip if it's already formatted as HTML elements
            if (paragraph.includes('<h') || paragraph.includes('<div') || paragraph.includes('<hr')) {
                return paragraph;
            }
            // Wrap regular paragraphs
            return `<p class="mb-4">${paragraph.trim()}</p>`;
        })
        .join('')
        
        // Handle single line breaks within paragraphs
        .replace(/\n/g, '<br class="mb-1">');
};

// Types for better type safety
interface PrescriptionData {
    filename: string;
    analysis: string;
    uploadDate: Date;
    fileType: string;
}

// Removed unused ChatContext interface

export default function ResultsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [analysis, setAnalysis] = useState<string>('');
    const [filename, setFilename] = useState<string>('');
    const [showChat, setShowChat] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Enhanced file processing with better error handling and prescription data extraction
    const processUploadedFile = useCallback(async () => {
        try {
            setError(null);
            
            if (typeof window === 'undefined') {
                throw new Error('Session storage not available');
            }
            
            const fileDataStr = sessionStorage.getItem('uploadFileData');
            const fileInfoStr = sessionStorage.getItem('uploadFile');
            
            if (!fileDataStr || !fileInfoStr) {
                throw new Error('No file data found in session storage');
            }
            
            const fileInfo = JSON.parse(fileInfoStr);
            setFilename(fileInfo.name); // Set filename immediately
            const response = await fetch(fileDataStr);
            
            if (!response.ok) {
                throw new Error('Failed to retrieve file data from session storage');
            }
            
            const blob = await response.blob();
            const file = new File([blob], fileInfo.name, { type: fileInfo.type });
            
            const formData = new FormData();
            formData.append('file', file);
            
            const apiResponse = await fetch('/api/ai/v2', {
                method: 'POST',
                body: formData,
            });
            
            if (!apiResponse.ok) {
                throw new Error('Analysis failed');
            }

            // Handle streaming response
            const reader = apiResponse.body?.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let analysis = '';

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    
                    if (done) break;
                    
                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || ''; // Keep incomplete line in buffer
                    
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            try {
                                const data = JSON.parse(line.slice(6));
                                
                                if (data.type === 'chunk') {
                                    analysis += data.content;
                                    setAnalysis(analysis); // Update analysis in real-time
                                } else if (data.type === 'done') {
                                    // Streaming complete
                                    setFilename(fileInfo.name);
                                    setError(null);
                                    
                                    // Store prescription data for chat context
                                    const prescriptionData: PrescriptionData = {
                                        filename: fileInfo.name,
                                        analysis: analysis,
                                        uploadDate: new Date(),
                                        fileType: fileInfo.type
                                    };
                                    
                                    if (typeof window !== 'undefined') {
                                        sessionStorage.setItem('prescriptionData', JSON.stringify(prescriptionData));
                                        // Clean up sessionStorage
                                        sessionStorage.removeItem('uploadFileData');
                                        sessionStorage.removeItem('uploadFile');
                                    }
                                    return;
                                } else if (data.type === 'error') {
                                    throw new Error(data.error || 'Streaming error');
                                }
                            } catch (parseError) {
                                console.error('Error parsing SSE data:', parseError);
                            }
                        }
                    }
                }
            }
            
        } catch (error) {
            console.error('Error processing uploaded file:', error);
            setError(error instanceof Error ? error.message : 'Failed to process uploaded file');
            if (typeof window !== 'undefined') {
                sessionStorage.removeItem('uploadFileData');
                sessionStorage.removeItem('uploadFile');
            }
        }
    }, []);

    const processSamplePrescription = useCallback(async () => {
        try {
            setError(null);
            setFilename('Sample Prescription'); // Set filename immediately
            
            const response = await fetch('/prescription.png');
            if (!response.ok) {
                throw new Error(`Failed to fetch sample file: ${response.status}`);
            }
            
            const blob = await response.blob();
            const file = new File([blob], 'sample-prescription.png', { type: 'image/png' });
            
            const formData = new FormData();
            formData.append('file', file);
            
            const apiResponse = await fetch('/api/ai/v2', {
                method: 'POST',
                body: formData,
            });
            
            if (!apiResponse.ok) {
                throw new Error('Analysis failed');
            }

            // Handle streaming response
            const reader = apiResponse.body?.getReader();
            const decoder = new TextDecoder();
            let buffer = '';
            let analysis = '';

            if (reader) {
                while (true) {
                    const { done, value } = await reader.read();
                    
                    if (done) break;
                    
                    buffer += decoder.decode(value, { stream: true });
                    const lines = buffer.split('\n');
                    buffer = lines.pop() || ''; // Keep incomplete line in buffer
                    
                    for (const line of lines) {
                        if (line.startsWith('data: ')) {
                            try {
                                const data = JSON.parse(line.slice(6));
                                
                                if (data.type === 'chunk') {
                                    analysis += data.content;
                                    setAnalysis(analysis); // Update analysis in real-time
                                } else if (data.type === 'done') {
                                    // Streaming complete
                                    setFilename('Sample Prescription');
                                    setError(null);
                                    
                                    // Store prescription data for chat context
                                    const prescriptionData: PrescriptionData = {
                                        filename: 'Sample Prescription',
                                        analysis: analysis,
                                        uploadDate: new Date(),
                                        fileType: 'image/png'
                                    };
                                    
                                    if (typeof window !== 'undefined') {
                                        sessionStorage.setItem('prescriptionData', JSON.stringify(prescriptionData));
                                    }
                                    return;
                                } else if (data.type === 'error') {
                                    throw new Error(data.error || 'Streaming error');
                                }
                            } catch (parseError) {
                                console.error('Error parsing SSE data:', parseError);
                            }
                        }
                    }
                }
            }
            
        } catch (error) {
            console.error('Error processing sample prescription:', error);
            setError(error instanceof Error ? error.message : 'Failed to process sample prescription');
        }
    }, []);

    // Enhanced useEffect with immediate streaming - no skeleton loading
    useEffect(() => {
        const analysisParam = searchParams.get('analysis');
        const filenameParam = searchParams.get('filename');
        const loadingParam = searchParams.get('loading');
        
        // Set filename immediately if available
        if (filenameParam) {
            setFilename(decodeURIComponent(filenameParam));
        }
        
        if (loadingParam === 'true') {
            // Start streaming immediately - no loading state
            const uploadFileData = sessionStorage.getItem('uploadFileData');
            if (uploadFileData) {
                // Process uploaded file
                processUploadedFile();
            } else {
                // Process sample prescription
                processSamplePrescription();
            }
        } else if (analysisParam) {
            const decodedAnalysis = decodeURIComponent(analysisParam);
            setAnalysis(decodedAnalysis);
            
            // Store prescription data for chat context if not already stored
            if (typeof window !== 'undefined') {
                const existingData = sessionStorage.getItem('prescriptionData');
                if (!existingData && filenameParam) {
                    const prescriptionData: PrescriptionData = {
                        filename: decodeURIComponent(filenameParam),
                        analysis: decodedAnalysis,
                        uploadDate: new Date(),
                        fileType: 'unknown'
                    };
                    sessionStorage.setItem('prescriptionData', JSON.stringify(prescriptionData));
                }
            }
        }
    }, [searchParams, processSamplePrescription, processUploadedFile]);

    // Memoized prescription context for chat
    const prescriptionContext = useMemo(() => {
        // Check if we're on the client side before accessing sessionStorage
        if (typeof window === 'undefined') return null;
        
        const prescriptionDataStr = sessionStorage.getItem('prescriptionData');
        if (!prescriptionDataStr) return null;
        
        try {
            const parsedData = JSON.parse(prescriptionDataStr);
            // Convert uploadDate string back to Date object
            const prescriptionData: PrescriptionData = {
                ...parsedData,
                uploadDate: new Date(parsedData.uploadDate)
            };
            return {
                prescriptionData,
                conversationHistory: [] // Will be managed by ChatInterface
            };
        } catch (error) {
            console.error('Error parsing prescription data:', error);
            return null;
        }
    }, []);

    const handleBackToUpload = () => {
        // Clear prescription data when navigating back
        if (typeof window !== 'undefined') {
            sessionStorage.removeItem('prescriptionData');
        }
        router.push('/');
    };

    const handleRetry = () => {
        setError(null);
        setAnalysis(''); // Clear previous analysis
        if (typeof window !== 'undefined') {
            const uploadFileData = sessionStorage.getItem('uploadFileData');
            if (uploadFileData) {
                processUploadedFile();
            } else {
                processSamplePrescription();
            }
        } else {
            processSamplePrescription();
        }
    };

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="mb-6">
                        <Button 
                            onClick={handleBackToUpload}
                            variant="ghost" 
                            className="text-gray-600 hover:text-gray-900 p-2"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Upload
                        </Button>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                        <div className="text-red-500 mb-4">
                            <FileText className="h-12 w-12 mx-auto mb-2" />
                            <h2 className="text-xl font-semibold">Analysis Failed</h2>
                        </div>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <div className="flex gap-3 justify-center">
                            <Button onClick={handleRetry} className="bg-[#90119B] hover:bg-purple-700">
                                Try Again
                            </Button>
                            <Button onClick={handleBackToUpload} variant="outline">
                                Upload New File
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }


    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                {/* Back Button */}
                <div className="mb-6">
                    <Button 
                        onClick={handleBackToUpload}
                        variant="ghost" 
                        className="text-gray-600 hover:text-gray-900 p-2"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Upload
                    </Button>
                </div>

                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <FileText className="h-8 w-8 text-[#90119B]" />
                            <h1 className="text-2xl font-bold text-gray-900">Medical Analysis Results</h1>
                        </div>
                        <Button 
                            onClick={handleBackToUpload}
                            variant="outline" 
                            className="text-sm"
                        >
                            Upload New File
                        </Button>
                    </div>
                    {filename && (
                        <div className="bg-gray-50 rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <FileText className="h-4 w-4 text-gray-500" />
                                <span className="text-sm font-medium text-gray-700">Prescription Details</span>
                            </div>
                            <p className="text-gray-600 text-sm">File: {filename}</p>
                            {prescriptionContext && (
                                <p className="text-gray-500 text-xs mt-1">
                                    Analyzed on: {prescriptionContext.prescriptionData.uploadDate instanceof Date 
                                        ? prescriptionContext.prescriptionData.uploadDate.toLocaleDateString() 
                                        : new Date(prescriptionContext.prescriptionData.uploadDate).toLocaleDateString()
                                    } at {prescriptionContext.prescriptionData.uploadDate instanceof Date 
                                        ? prescriptionContext.prescriptionData.uploadDate.toLocaleTimeString() 
                                        : new Date(prescriptionContext.prescriptionData.uploadDate).toLocaleTimeString()
                                    }
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Analysis Results */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-semibold text-gray-900">AI Analysis</h2>
                        <div className="flex items-center gap-2 text-sm text-blue-600">
                            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            <span className="font-medium">Streaming...</span>
                        </div>
                    </div>
                    <div className="prose max-w-none">
                        <div className="bg-gray-50 border-l-4 border-gray-300 p-6 rounded-lg min-h-[200px]">
                            <div 
                                className="text-gray-800 leading-relaxed space-y-4"
                                dangerouslySetInnerHTML={{ 
                                    __html: analysis ? formatPrescriptionText(analysis) : '<div class="flex items-center gap-4 text-gray-600"><div class="flex space-x-1"><div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div><div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.1s"></div><div class="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div></div><span class="italic">Starting analysis...</span></div>'
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Chat Toggle */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <MessageCircle className="h-6 w-6 text-[#90119B]" />
                            <h2 className="text-xl font-semibold text-gray-900">Have Questions About Your Prescription?</h2>
                        </div>
                        <Button 
                            onClick={() => setShowChat(!showChat)}
                            className="bg-[#90119B] hover:bg-purple-700"
                        >
                            {showChat ? 'Hide Chat' : 'Start Conversation'}
                        </Button>
                    </div>
                    
                    {!showChat && (
                        <div className="text-center py-4">
                            <p className="text-gray-600 mb-2">Ask me anything about your prescription analysis!</p>
                            <p className="text-sm text-gray-500">
                                Try: &quot;What does this medication do?&quot; or &quot;Are there any side effects I should know about?&quot;
                            </p>
                        </div>
                    )}
                    
                    {showChat && prescriptionContext && (
                        <div className="mt-4">
                            <ChatInterface 
                                initialContext={analysis}
                                prescriptionData={prescriptionContext.prescriptionData}
                            />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}