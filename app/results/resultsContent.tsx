'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, MessageCircle } from 'lucide-react';
import ChatInterface from '@/components/ChatInterface';

// Types for better type safety
interface PrescriptionData {
    filename: string;
    analysis: string;
    uploadDate: Date;
    fileType: string;
}

interface ChatContext {
    prescriptionData: PrescriptionData;
    conversationHistory: Array<{
        id: string;
        text: string;
        isUser: boolean;
        timestamp: Date;
    }>;
}

export default function ResultsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [analysis, setAnalysis] = useState<string>('');
    const [filename, setFilename] = useState<string>('');
    const [showChat, setShowChat] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Enhanced file processing with better error handling and prescription data extraction
    const processUploadedFile = useCallback(async () => {
        try {
            if (typeof window === 'undefined') {
                throw new Error('Session storage not available');
            }
            
            const fileDataStr = sessionStorage.getItem('uploadFileData');
            const fileInfoStr = sessionStorage.getItem('uploadFile');
            
            if (!fileDataStr || !fileInfoStr) {
                throw new Error('No file data found in session storage');
            }
            
            const fileInfo = JSON.parse(fileInfoStr);
            const response = await fetch(fileDataStr);
            
            if (!response.ok) {
                throw new Error('Failed to retrieve file data from session storage');
            }
            
            const blob = await response.blob();
            const file = new File([blob], fileInfo.name, { type: fileInfo.type });
            
            const formData = new FormData();
            formData.append('file', file);
            
            const apiResponse = await fetch('/api/ai', {
                method: 'POST',
                body: formData,
            });
            
            if (!apiResponse.ok) {
                const errorData = await apiResponse.json().catch(() => ({ error: 'Unknown error occurred' }));
                throw new Error(errorData.error || 'Analysis failed');
            }
            
            const data = await apiResponse.json();
            
            if (!data.result) {
                throw new Error('No analysis result received from server');
            }
            
            setAnalysis(data.result);
            setFilename(fileInfo.name);
            setError(null);
            
            // Store prescription data for chat context
            const prescriptionData: PrescriptionData = {
                filename: fileInfo.name,
                analysis: data.result,
                uploadDate: new Date(),
                fileType: fileInfo.type
            };
            
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('prescriptionData', JSON.stringify(prescriptionData));
                // Clean up sessionStorage
                sessionStorage.removeItem('uploadFileData');
                sessionStorage.removeItem('uploadFile');
            }
            
        } catch (error) {
            console.error('Error processing uploaded file:', error);
            setError(error instanceof Error ? error.message : 'Failed to process uploaded file');
            if (typeof window !== 'undefined') {
                sessionStorage.removeItem('uploadFileData');
                sessionStorage.removeItem('uploadFile');
            }
        } finally {
            setIsLoading(false);
        }
    }, []);

    const processSamplePrescription = useCallback(async () => {
        try {
            const response = await fetch('/prescription.png');
            if (!response.ok) {
                throw new Error(`Failed to fetch sample file: ${response.status}`);
            }
            
            const blob = await response.blob();
            const file = new File([blob], 'sample-prescription.png', { type: 'image/png' });
            
            const formData = new FormData();
            formData.append('file', file);
            
            const apiResponse = await fetch('/api/ai', {
                method: 'POST',
                body: formData,
            });
            
            if (!apiResponse.ok) {
                const errorData = await apiResponse.json().catch(() => ({ error: 'Unknown error occurred' }));
                throw new Error(errorData.error || 'Analysis failed');
            }
            
            const data = await apiResponse.json();
            
            if (!data.result) {
                throw new Error('No analysis result received from server');
            }
            
            setAnalysis(data.result);
            setFilename('Sample Prescription');
            setError(null);
            
            // Store prescription data for chat context
            const prescriptionData: PrescriptionData = {
                filename: 'Sample Prescription',
                analysis: data.result,
                uploadDate: new Date(),
                fileType: 'image/png'
            };
            
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('prescriptionData', JSON.stringify(prescriptionData));
            }
            
        } catch (error) {
            console.error('Error processing sample prescription:', error);
            setError(error instanceof Error ? error.message : 'Failed to process sample prescription');
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Enhanced useEffect with better prescription data handling
    useEffect(() => {
        const analysisParam = searchParams.get('analysis');
        const filenameParam = searchParams.get('filename');
        const loadingParam = searchParams.get('loading');
        
        if (loadingParam === 'true') {
            setIsLoading(true);
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
        
        if (filenameParam) {
            setFilename(decodeURIComponent(filenameParam));
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
    }, [analysis, filename]);

    const handleBackToUpload = () => {
        // Clear prescription data when navigating back
        if (typeof window !== 'undefined') {
            sessionStorage.removeItem('prescriptionData');
        }
        router.push('/');
    };

    const handleRetry = () => {
        setError(null);
        setIsLoading(true);
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

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-4xl mx-auto px-4">
                    <div className="mb-6">
                        <Button 
                            onClick={handleBackToUpload}
                            variant="ghost" 
                            className="text-gray-600 hover:text-gray-900 p-2 cursor-pointer"
                        >
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Upload
                        </Button>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <div className="animate-pulse">
                            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <div className="animate-pulse">
                            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                            <div className="space-y-3">
                                <div className="h-4 bg-gray-200 rounded"></div>
                                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="bg-white rounded-lg shadow-sm p-6">
                        <div className="animate-pulse">
                            <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                            <div className="h-10 bg-gray-200 rounded w-32"></div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!analysis) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-xl font-medium mb-4">No analysis found</h2>
                    <Button onClick={handleBackToUpload}>Back to Upload</Button>
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
                    <h2 className="text-xl font-semibold mb-4 text-gray-900">AI Analysis</h2>
                    <div className="prose max-w-none">
                        <div className="bg-gray-50 border-l-4 border-gray-300 p-6 rounded-lg">
                            <div 
                                className="text-gray-800 leading-relaxed space-y-4"
                                dangerouslySetInnerHTML={{ 
                                    __html: analysis
                                        // Headers
                                        .replace(/### (.*?)\n/g, '<h3 class="text-lg font-semibold text-gray-900 mt-6 mb-3 border-b border-gray-200 pb-2">$1</h3>')
                                        .replace(/## (.*?)\n/g, '<h2 class="text-xl font-bold text-gray-900 mt-8 mb-4">$1</h2>')
                                        // Bold text
                                        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
                                        // Italic text
                                        .replace(/\*(.*?)\*/g, '<em class="italic text-gray-700">$1</em>')
                                        // Numbered lists
                                        .replace(/(\d+\.)\s+([^\n]+)/g, '<div class="flex items-start mb-3"><span class="font-semibold text-gray-700 mr-3 mt-0.5">$1</span><div class="flex-1">$2</div></div>')
                                        // Bullet points
                                        .replace(/^\s*[*•-]\s+(.+)$/gm, '<div class="flex items-start mb-2 ml-4"><span class="text-gray-600 mr-3 mt-1.5 text-xs">•</span><div class="flex-1">$1</div></div>')
                                        // Paragraphs
                                        .replace(/\n\n/g, '</p><p class="mb-4">')
                                        .replace(/^/, '<p class="mb-4">')
                                        .replace(/$/, '</p>')
                                        // Line breaks
                                        .replace(/\n/g, '<br class="mb-1">')
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
                                Try: "What does this medication do?" or "Are there any side effects I should know about?"
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