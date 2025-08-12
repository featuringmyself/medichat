'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';

// Simple markdown parser for basic formatting with XSS protection
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
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
        .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
        .replace(/\n/g, '<br>'); // Line breaks
};

interface Message {
    id: string;
    text: string;
    isUser: boolean;
    timestamp: Date;
}

interface ChatInterfaceProps {
    initialContext: string;
}

export default function ChatInterface({ initialContext }: ChatInterfaceProps) {
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
        setInputText('');
        setIsLoading(true);

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: inputText,
                    context: initialContext,
                    history: messages
                })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to get response');
            }

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: data.response,
                isUser: false,
                timestamp: new Date()
            };

            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('Chat error:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: 'Sorry, I encountered an error. Please try again.',
                isUser: false,
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
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
                        <p>Ask me anything about your medical analysis!</p>
                        <p className="text-sm mt-2">Try: &quot;What does this mean?&quot; or &quot;Should I be concerned?&quot;</p>
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
                                <div className="animate-pulse">Thinking...</div>
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
                        placeholder="Ask a question about your analysis..."
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