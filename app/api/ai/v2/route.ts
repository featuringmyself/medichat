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
console.log(MEDICAL_SYSTEM_PROMPT);


// Simplified approach without LangGraph memory to avoid message ordering issues
const generateResponse = async (messages: (HumanMessage | SystemMessage | AIMessage)[]) => {
  try {
    const response = await llm.invoke(messages);
    return response;
  } catch (error) {
    console.error("Error generating response:", error);
    throw new Error("Failed to generate response from AI model");
  }
};

// Helper function to generate or validate thread ID
const getOrCreateThreadId = (providedThreadId?: string): string => {
  if (providedThreadId && providedThreadId.length > 0) {
    return providedThreadId;
  }
  return uuidv4();
};


export async function POST(request: Request): Promise<Response> {
  try {
    // Parse and validate request
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

    console.log(`Processing chat request for thread: ${threadId}`);

    // Generate response using simplified approach
    const response = await generateResponse(messages);

    // Extract response content
    const responseContent = response.content;
    
    if (!responseContent) {
      throw new Error('No response content received from AI model');
    }

    // Handle different content types
    let responseText: string;
    if (typeof responseContent === 'string') {
      responseText = responseContent;
    } else if (Array.isArray(responseContent)) {
      // Handle complex content arrays
      responseText = responseContent
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
      responseText = String(responseContent);
    }

    // Prepare response
    const chatResponse: ChatResponse = {
      response: responseText,
      threadId: threadId,
      timestamp: new Date().toISOString(),
    };

    return Response.json(chatResponse);

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
