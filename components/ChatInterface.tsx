'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';

// Enhanced markdown parser for prescription formatting with XSS protection
const parseMarkdown = (text: string) => {
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
        .replace(/### (.*?)\n/g, '<h3 class="text-lg font-semibold text-gray-900 mt-4 mb-2 border-b border-gray-200 pb-1">$1</h3>')
        .replace(/## (.*?)\n/g, '<h2 class="text-xl font-bold text-gray-900 mt-4 mb-2">$1</h2>')
        .replace(/# (.*?)\n/g, '<h1 class="text-2xl font-bold text-gray-900 mt-4 mb-2">$1</h1>')
        
        // Bold and italic text
        .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
        .replace(/\*(.*?)\*/g, '<em class="italic text-gray-700">$1</em>')
        
        // Handle nested bullet points with proper indentation
        .replace(/^(\s*)\*\s+(.+)$/gm, (match, spaces, content) => {
            const indentLevel = spaces.length / 2; // Assuming 2 spaces per indent level
            const marginLeft = indentLevel * 12; // 12px per indent level for chat
            return `<div class="flex items-start mb-1" style="margin-left: ${marginLeft}px">
                <span class="text-gray-600 mr-2 mt-1 text-xs">•</span>
                <div class="flex-1 text-sm">${content}</div>
            </div>`;
        })
        
        // Handle numbered lists
        .replace(/^(\s*)(\d+\.)\s+(.+)$/gm, (match, spaces, number, content) => {
            const indentLevel = spaces.length / 2;
            const marginLeft = indentLevel * 12;
            return `<div class="flex items-start mb-2" style="margin-left: ${marginLeft}px">
                <span class="font-semibold text-gray-700 mr-2 mt-0.5 text-sm">${number}</span>
                <div class="flex-1 text-sm">${content}</div>
            </div>`;
        })
        
        // Handle horizontal rules
        .replace(/^---$/gm, '<hr class="my-3 border-gray-300">')
        
        // Handle paragraphs - split by double newlines
        .split(/\n\n+/)
        .map(paragraph => {
            // Skip if it's already formatted as HTML elements
            if (paragraph.includes('<h') || paragraph.includes('<div') || paragraph.includes('<hr')) {
                return paragraph;
            }
            // Wrap regular paragraphs
            return `<p class="mb-2 text-sm">${paragraph.trim()}</p>`;
        })
        .join('')
        
        // Handle single line breaks within paragraphs
        .replace(/\n/g, '<br class="mb-1">');
};

interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
}

interface PrescriptionData {
    filename: string;
    analysis: string;
    uploadDate: Date;
    fileType: string;
}

interface ChatInterfaceProps {
    initialContext: string;
    prescriptionData?: PrescriptionData;
}

export default function ChatInterface({ prescriptionData }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const sendMessage = async () => {
        if (!inputText.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputText,
            isUser: true,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        const currentInput = inputText;
        setInputText('');
        setIsLoading(true);

        // Create a placeholder AI message that will be updated with streaming content
        const aiMessageId = (Date.now() + 1).toString();
        const aiMessage: Message = {
            id: aiMessageId,
            text: '',
            isUser: false,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, aiMessage]);

        try {
            // Prepare request payload with proper structure
            const requestPayload = {
                message: currentInput,
                threadId: typeof window !== 'undefined' ? sessionStorage.getItem('chatThreadId') || undefined : undefined,
                prescriptionContext: prescriptionData ? {
                    filename: prescriptionData.filename,
                    analysis: prescriptionData.analysis,
                    uploadDate: prescriptionData.uploadDate.toISOString(),
                    fileType: prescriptionData.fileType
                } : undefined,
                conversationHistory: messages.map(msg => ({
                    id: msg.id,
                    text: msg.text,
                    isUser: msg.isUser,
                    timestamp: msg.timestamp.toISOString()
                }))
            };

            // Use fetch with streaming
            const response = await fetch('/api/ai/v2', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestPayload)
            });

            if (!response.ok) {
                throw new Error('Failed to get response');
            }

            // Handle streaming response
            const reader = response.body?.getReader();
            const decoder = new TextDecoder();
            let buffer = '';

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
                                
                                if (data.type === 'metadata') {
                                    // Store thread ID for future requests
                                    if (data.threadId && typeof window !== 'undefined') {
                                        sessionStorage.setItem('chatThreadId', data.threadId);
                                    }
                                } else if (data.type === 'chunk') {
                                    // Update the AI message with streaming content
                                    setMessages(prev => prev.map(msg => 
                                        msg.id === aiMessageId 
                                            ? { ...msg, text: msg.text + data.content }
                                            : msg
                                    ));
                                } else if (data.type === 'done') {
                                    // Streaming complete
                                    setIsLoading(false);
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
            console.error('Chat error:', error);
            const errorMessage: Message = {
                id: aiMessageId,
                text: 'Sorry, I encountered an error. Please try again.',
                isUser: false,
                timestamp: new Date()
            };
            setMessages(prev => prev.map(msg => 
                msg.id === aiMessageId ? errorMessage : msg
            ));
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    return (
        <div className={`border rounded-lg bg-gray-50 flex flex-col transition-all duration-300 ${messages.length > 0 ? 'h-[600px]' : 'h-96'
            }`}>
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="text-center text-gray-500 py-8">
                        <p className="text-lg font-medium mb-2">Hi! I&apos;m here to help you understand your prescription.</p>
                        <p className="mb-4">Ask me anything about your medical analysis!</p>
                        <div className="text-sm space-y-1">
                            <p>💊 &quot;What does this medication do?&quot;</p>
                            <p>⚠️ &quot;Are there any side effects I should know about?&quot;</p>
                            <p>📋 &quot;How should I take this medication?&quot;</p>
                            <p>🤔 &quot;Can you explain this part of the analysis?&quot;</p>
                        </div>
                    </div>
                )}

                {messages.map((message) => (
                    <div
                        key={message.id}
                        className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.isUser
                                ? 'bg-[#90119B] text-white'
                                : 'bg-white text-gray-800 border'
                                }`}
                        >
                            {message.isUser ? (
                                <p className="whitespace-pre-wrap">{message.text}</p>
                            ) : (
                                <div
                                    className="whitespace-pre-wrap"
                                    dangerouslySetInnerHTML={{ __html: parseMarkdown(message.text) }}
                                />
                            )}
                            <p className={`text-xs mt-1 ${message.isUser ? 'text-purple-200' : 'text-gray-500'
                                }`}>
                                {message.timestamp.toLocaleTimeString()}
                            </p>
                        </div>
                    </div>
                ))}

                {isLoading && (
                    <div className="flex justify-start">
                        <div className="bg-white text-gray-800 border px-4 py-2 rounded-lg">
                            <div className="flex items-center space-x-2">
                                <div className="flex space-x-1">
                                    <div className="w-1 h-1 bg-gray-400 rounded-full bounce-delayed"></div>
                                    <div className="w-1 h-1 bg-gray-400 rounded-full bounce-delayed"></div>
                                    <div className="w-1 h-1 bg-gray-400 rounded-full bounce-delayed"></div>
                                </div>
                                <div className="text-sm text-gray-500">Starting response...</div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t bg-white p-4">
                <div className="flex space-x-2">
                    <textarea
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Ask me about your prescription..."
                        className="flex-1 resize-none border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        rows={2}
                        disabled={isLoading}
                    />
                    <Button
                        onClick={sendMessage}
                        disabled={!inputText.trim() || isLoading}
                        className="bg-[#90119B] hover:bg-purple-700 px-6"
                    >
                        Send
                    </Button>
                </div>

                {/* Disclaimer */}
                <div className="text-center mt-3">
                    <p className="text-xs text-gray-500">
                        MediChat can make mistakes. Always consult with healthcare professionals for medical advice.
                    </p>
                </div>
            </div>
        </div>
    );
}