import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { v4 as uuidv4 } from "uuid";
import { HumanMessage, SystemMessage, AIMessage } from "@langchain/core/messages";

// Types for better type safety
interface ChatRequest {
  message: string;
  threadId?: string;
  prescriptionContext?: {
    filename: string;
    analysis: string;
    uploadDate: string;
    fileType: string;
  };
  conversationHistory?: Array<{
    id: string;
    text: string;
    isUser: boolean;
    timestamp: string;
  }>;
}

interface ChatResponse {
  response: string;
  threadId: string;
  timestamp: string;
}

// Initialize LLM with proper configuration
const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash-lite",
  apiKey: process.env.GEMINI_API_KEY,
  temperature: 0.7,
  maxOutputTokens: 2048,
});

// System prompt for medical assistant
const MEDICAL_SYSTEM_PROMPT = process.env.SYSTEM_PROMPT as string;


// Streaming response generation using LangChain
const generateStreamingResponse = async function* (messages: (HumanMessage | SystemMessage | AIMessage)[]) {
  try {
    const stream = await llm.stream(messages);
    
    for await (const chunk of stream) {
      if (chunk.content) {
        yield chunk.content;
      }
    }
  } catch (error) {
    console.error("Error generating streaming response:", error);
    throw new Error("Failed to generate streaming response from AI model");
  }
};

// Helper function to generate or validate thread ID
const getOrCreateThreadId = (providedThreadId?: string): string => {
  if (providedThreadId && providedThreadId.length > 0) {
    return providedThreadId;
  }
  return uuidv4();
};

// Handle file upload and analysis
async function handleFileUpload(request: Request): Promise<Response> {
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
    console.log('Processing file:', fileName.replace(/[^a-zA-Z0-9.-]/g, ''), 'Size:', file.size, 'Type:', mimeType);
    console.log('API Key exists:', !!process.env.GEMINI_API_KEY);
    console.log('System prompt exists:', !!process.env.SYSTEM_PROMPT);

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
          console.log('Starting streaming response...');
          
          if (!process.env.GEMINI_API_KEY) {
            // Fallback response when API key is missing
            console.log('Using fallback response due to missing API key');
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
            console.log('Stream created, starting to read chunks...');
            
            for await (const chunk of responseStream) {
              console.log('Received chunk:', typeof chunk.content, chunk.content ? 'has content' : 'no content');
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
                console.log('Sending chunk:', chunkText.substring(0, 50) + '...');
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunkData)}\n\n`));
              }
            }
          }

          // Send completion signal
          console.log('Streaming complete, sending done signal...');
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


export async function POST(request: Request): Promise<Response> {
  try {
    const contentType = request.headers.get('content-type');
    
    // Handle file upload (FormData)
    if (contentType?.includes('multipart/form-data')) {
      return handleFileUpload(request);
    }
    
    // Handle chat message (JSON)
    const body: ChatRequest = await request.json();
    
    if (!body.message || typeof body.message !== 'string' || body.message.trim().length === 0) {
      return Response.json(
        { error: 'Message is required and must be a non-empty string' },
        { status: 400 }
      );
    }

    // Generate or use provided thread ID
    const threadId = getOrCreateThreadId(body.threadId);
    
    // Create messages array with proper structure
    // System message must be first, then conversation history, then current message
    const messages = [
      new SystemMessage(MEDICAL_SYSTEM_PROMPT),
    ];

    // Add prescription context if present
    if (body.prescriptionContext) {
      const contextMessage = `Prescription Analysis Context:
File: ${body.prescriptionContext.filename}
Upload Date: ${body.prescriptionContext.uploadDate}
File Type: ${body.prescriptionContext.fileType}

Analysis Results:
${body.prescriptionContext.analysis}`;
      messages.push(new HumanMessage(contextMessage));
    }

    // Add conversation history if present
    if (body.conversationHistory && body.conversationHistory.length > 0) {
      body.conversationHistory.forEach((msg) => {
        if (msg.isUser) {
          messages.push(new HumanMessage(msg.text));
        } else {
          messages.push(new AIMessage(msg.text)); // Assistant messages as AI messages
        }
      });
    }

    // Add current message
    messages.push(new HumanMessage(body.message));

    console.log(`Processing streaming chat request for thread: ${threadId}`);

    // Create a readable stream for Server-Sent Events
    const encoder = new TextEncoder();
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send initial metadata
          const metadata = {
            threadId: threadId,
            timestamp: new Date().toISOString(),
            type: 'metadata'
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(metadata)}\n\n`));

          // Generate streaming response
          const responseGenerator = generateStreamingResponse(messages);
          
          for await (const chunk of responseGenerator) {
            // Handle different content types
            let chunkText: string;
            if (typeof chunk === 'string') {
              chunkText = chunk;
            } else if (Array.isArray(chunk)) {
              chunkText = chunk
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
              chunkText = String(chunk);
            }

            // Send chunk as Server-Sent Event
            const chunkData = {
              content: chunkText,
              type: 'chunk'
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(chunkData)}\n\n`));
          }

          // Send completion signal
          const completionData = {
            type: 'done',
            threadId: threadId,
            timestamp: new Date().toISOString()
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(completionData)}\n\n`));
          controller.close();

        } catch (error) {
          console.error('Streaming error:', error);
          const errorData = {
            type: 'error',
            error: 'Failed to generate streaming response',
            threadId: threadId
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
    console.error('Error in chat API:', error);
    
    // Handle specific error types
    if (error instanceof SyntaxError) {
      return Response.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }
    
    if (error instanceof Error && error.message.includes('API')) {
      return Response.json(
        { error: 'AI service temporarily unavailable. Please try again later.' },
        { status: 503 }
      );
    }
    
    return Response.json(
      { error: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}
