'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import ChatInterface from '@/components/ChatInterface';

export default function ResultsPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [analysis, setAnalysis] = useState<string>('');
    const [filename, setFilename] = useState<string>('');
    const [showChat, setShowChat] = useState(false);

    useEffect(() => {
        const analysisParam = searchParams.get('analysis');
        const filenameParam = searchParams.get('filename');
        
        if (analysisParam) {
            setAnalysis(decodeURIComponent(analysisParam));
        }
        if (filenameParam) {
            setFilename(decodeURIComponent(filenameParam));
        }
    }, [searchParams]);

    const handleBackToUpload = () => {
        router.push('/');
    };

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
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h1 className="text-2xl font-bold text-gray-900">Medical Analysis Results</h1>
                        <Button 
                            variant="outline" 
                            onClick={handleBackToUpload}
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
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                            <div 
                                className="whitespace-pre-wrap text-gray-800 leading-relaxed"
                                dangerouslySetInnerHTML={{ 
                                    __html: analysis
                                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                        .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                        .replace(/\n/g, '<br>')
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