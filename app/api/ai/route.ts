import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";

// Validate API key exists
if (!process.env.GEMINI_API_KEY) {
    console.warn('GEMINI_API_KEY environment variable is not set - using fallback response');
}

// Initialize LLM with proper configuration
const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  apiKey: process.env.GEMINI_API_KEY,
  temperature: 0.7,
  maxOutputTokens: 2048,
});

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;

        if (!file) {
            return Response.json({ error: 'No file provided' }, { status: 400 });
        }

        // Get file extension and determine MIME type
        const fileName = file.name.toLowerCase();
        const fileExtension = fileName.split('.').pop();

        // Map file extensions to MIME types
        const mimeTypeMap: { [key: string]: string } = {
            'png': 'image/png',
            'jpg': 'image/jpeg',
            'jpeg': 'image/jpeg',
            'gif': 'image/gif',
            'webp': 'image/webp',
            'pdf': 'application/pdf'
        };

        const mimeType = mimeTypeMap[fileExtension || ''] || file.type;

        // Validate file type
        const supportedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/gif', 'image/webp', 'application/pdf'];
        if (!mimeType || !supportedTypes.includes(mimeType)) {
            return Response.json({ error: 'Unsupported file type. Please use PNG, JPEG, GIF, WebP, or PDF.' }, { status: 400 });
        }

        // Validate file size (25MB limit)
        if (file.size > 25 * 1024 * 1024) {
            return Response.json({ error: 'File size exceeds 25MB limit' }, { status: 400 });
        }

        // Convert file to base64
        const bytes = await file.arrayBuffer();
        const base64Data = Buffer.from(bytes).toString('base64');

        // Validate base64 data
        if (!base64Data || base64Data.length === 0) {
            return Response.json({ error: 'Failed to process file data' }, { status: 400 });
        }

        // Basic validation - just ensure we have data
        if (mimeType.startsWith('image/') && base64Data.length < 100) {
            return Response.json({ error: 'Invalid image format. Please ensure the image is not corrupted and is in a supported format.' }, { status: 400 });
        }

        // Log minimal info for debugging (avoid sensitive data)
        // console.log('Processing file:', fileName.replace(/[^a-zA-Z0-9.-]/g, ''), 'Size:', file.size, 'Type:', mimeType);
        // console.log('API Key exists:', !!process.env.GEMINI_API_KEY);
        // console.log('System prompt exists:', !!process.env.SYSTEM_PROMPT);

        // Add a small delay to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Create a readable stream for Server-Sent Events
        const encoder = new TextEncoder();
        
        const stream = new ReadableStream({
            async start(controller) {
                try {
                    // Send initial metadata
                    const metadata = {
                        filename: file.name,
                        fileType: mimeType,
                        timestamp: new Date().toISOString(),
                        type: 'metadata'
                    };
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(metadata)}\n\n`));

                    // Create message with image data
                    const systemPrompt = process.env.SYSTEM_PROMPT || "Analyze this prescription image and provide detailed information about medications, dosages, and instructions.";
                    const message = new HumanMessage({
                        content: [
                            { type: "text", text: systemPrompt },
                            {
                                type: "image_url",
                                image_url: {
                                    url: `data:${mimeType};base64,${base64Data}`
                                }
                            }
                        ]
                    });

                    // Generate streaming response
                    // console.log('Starting streaming response...');
                    
                    if (!process.env.GEMINI_API_KEY) {
                        // Fallback response when API key is missing
                        // console.log('Using fallback response due to missing API key');
                        const fallbackResponse = `# Prescription Analysis

## File Information
- **Filename**: ${file.name}
- **File Type**: ${mimeType}
- **File Size**: ${(file.size / 1024).toFixed(2)} KB

## Analysis Results
This appears to be a prescription document. To get a detailed analysis, please ensure the GEMINI_API_KEY environment variable is properly configured.

## Medications Detected
- Sample medication information would appear here
- Dosage instructions would be analyzed
- Potential interactions would be identified

## Important Notes
- This is a demo response
- Please configure your API key for full functionality
- Always consult with healthcare professionals for medical advice

## Next Steps
1. Set up your GEMINI_API_KEY in .env.local
2. Upload your prescription again
3. Get detailed AI analysis`;

                        // Stream the fallback response
                        const words = fallbackResponse.split(' ');
                        for (let i = 0; i < words.length; i++) {
                            const chunkData = {
                                content: words[i] + ' ',
                                type: 'chunk'
                            };
                            controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunkData)}\n\n`));
                            await new Promise(resolve => setTimeout(resolve, 50)); // Small delay for streaming effect
                        }
                    } else {
                        const responseStream = await llm.stream([message]);
                        // console.log('Stream created, starting to read chunks...');
                        
                        for await (const chunk of responseStream) {
                            // console.log('Received chunk:', typeof chunk.content, chunk.content ? 'has content' : 'no content');
                            if (chunk.content) {
                                // Handle different content types
                                let chunkText: string;
                                if (typeof chunk.content === 'string') {
                                    chunkText = chunk.content;
                                } else if (Array.isArray(chunk.content)) {
                                    chunkText = chunk.content
                                        .map(item => {
                                            if (typeof item === 'string') {
                                                return item;
                                            } else if (item && typeof item === 'object' && 'text' in item) {
                                                return (item as { text: string }).text || '';
                                            }
                                            return '';
                                        })
                                        .join('');
                                } else {
                                    chunkText = String(chunk.content);
                                }

                                // Send chunk as Server-Sent Event
                                const chunkData = {
                                    content: chunkText,
                                    type: 'chunk'
                                };
                                // console.log('Sending chunk:', chunkText.substring(0, 50) + '...');
                                controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunkData)}\n\n`));
                            }
                        }
                    }

                    // Send completion signal
                    // console.log('Streaming complete, sending done signal...');
                    const completionData = {
                        type: 'done',
                        filename: file.name,
                        timestamp: new Date().toISOString()
                    };
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(completionData)}\n\n`));
                    controller.close();

                } catch (error) {
                    console.error('Streaming error:', error);
                    const errorData = {
                        type: 'error',
                        error: 'Failed to generate streaming response',
                        filename: file.name
                    };
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`));
                    controller.close();
                }
            }
        });

        return new Response(stream, {
            headers: {
                'Content-Type': 'text/event-stream',
                'Cache-Control': 'no-cache',
                'Connection': 'keep-alive',
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST',
                'Access-Control-Allow-Headers': 'Content-Type',
            },
        });

    } catch (error) {
        console.error('Error processing file:', error);

        // More specific error handling
        if (error instanceof Error) {
            if (error.message.includes('INVALID_ARGUMENT')) {
                return Response.json({ error: 'Invalid image format. Please ensure the image is not corrupted and is in a supported format.' }, { status: 400 });
            }
            if (error.message.includes('QUOTA_EXCEEDED')) {
                return Response.json({ error: 'API quota exceeded. Please try again later.' }, { status: 429 });
            }
        }

        return Response.json({ error: 'Failed to process file. Please try again with a different image.' }, { status: 500 });
    }
}