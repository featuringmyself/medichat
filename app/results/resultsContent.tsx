'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import ChatInterface from '@/components/ChatInterface';

export default function ResultsContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [analysis, setAnalysis] = useState<string>('');
    const [filename, setFilename] = useState<string>('');
    const [showChat, setShowChat] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const processUploadedFile = useCallback(async () => {
        try {
            const fileDataStr = sessionStorage.getItem('uploadFileData');
            const fileInfoStr = sessionStorage.getItem('uploadFile');
            
            if (!fileDataStr || !fileInfoStr) {
                throw new Error('No file data found');
            }
            
            const fileInfo = JSON.parse(fileInfoStr);
            const response = await fetch(fileDataStr);
            const blob = await response.blob();
            const file = new File([blob], fileInfo.name, { type: fileInfo.type });
            
            const formData = new FormData();
            formData.append('file', file);
            
            const apiResponse = await fetch('/api/ai', {
                method: 'POST',
                body: formData,
            });
            
            const data = await apiResponse.json();
            
            if (apiResponse.ok) {
                setAnalysis(data.result);
                setIsLoading(false);
                // Clean up sessionStorage
                sessionStorage.removeItem('uploadFileData');
                sessionStorage.removeItem('uploadFile');
            } else {
                throw new Error(data.error || 'Analysis failed');
            }
        } catch (error) {
            setIsLoading(false);
            sessionStorage.removeItem('uploadFileData');
            sessionStorage.removeItem('uploadFile');
            router.push('/?error=upload-failed');
        }
    }, [router]);

    const processSamplePrescription = useCallback(async () => {
        try {
            const response = await fetch('/prescription.png');
            if (!response.ok) {
                throw new Error(`Failed to fetch sample file: ${response.status}`);
            }
            
            const blob = await response.blob();
            const file = new File([blob], 'sample.png', { type: 'image/png' });
            
            const formData = new FormData();
            formData.append('file', file);
            
            const apiResponse = await fetch('/api/ai', {
                method: 'POST',
                body: formData,
            });
            
            const data = await apiResponse.json();
            
            if (apiResponse.ok) {
                setAnalysis(data.result);
                setIsLoading(false);
            } else {
                throw new Error(data.error || 'Analysis failed');
            }
        } catch (error) {
            setIsLoading(false);
            router.push('/?error=sample-failed');
        }
    }, [router]);

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
            setAnalysis(decodeURIComponent(analysisParam));
        }
        
        if (filenameParam) {
            setFilename(decodeURIComponent(filenameParam));
        }
    }, [searchParams, processSamplePrescription, processUploadedFile]);

    const handleBackToUpload = () => {
        router.push('/');
    };

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
                        <h1 className="text-2xl font-bold text-gray-900">Medical Analysis Results</h1>
                        <Button 
                            onClick={handleBackToUpload}
                            variant="outline" 
                            className="text-sm"
                        >
                            Upload New File
                        </Button>
                    </div>
                    {filename && (
                        <p className="text-gray-600 text-sm">File: {filename}</p>
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
                        <h2 className="text-xl font-semibold text-gray-900">Have Questions?</h2>
                        <Button 
                            onClick={() => setShowChat(!showChat)}
                            className="bg-[#90119B] hover:bg-purple-700"
                        >
                            {showChat ? 'Hide Chat' : 'Start Chat'}
                        </Button>
                    </div>
                    
                    {showChat && (
                        <div className="mt-4">
                            <ChatInterface initialContext={analysis} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}