import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

export async function POST(request: Request) {
    try {
        const { message, context, history } = await request.json();

        if (!message) {
            return Response.json({ error: 'No message provided' }, { status: 400 });
        }

        // Build conversation history for context
        let conversationContext = `Original medical analysis: ${context}\n\n`;
        
        if (history && history.length > 0) {
            conversationContext += "Previous conversation:\n";
            history.forEach((msg: any) => {
                conversationContext += `${msg.isUser ? 'User' : 'Assistant'}: ${msg.text}\n`;
            });
            conversationContext += "\n";
        }

        conversationContext += `Current question: ${message}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [conversationContext],
            config: {
                systemInstruction: `You are a helpful medical AI assistant. You are helping a user understand their medical analysis results. 
                
                Guidelines:
                - Be empathetic and supportive
                - Provide clear, easy-to-understand explanations
                - Always remind users that this is for informational purposes only
                - Encourage users to consult with healthcare professionals for medical advice
                - If asked about specific treatments or medications, suggest consulting a doctor
                - Be honest about limitations and uncertainties
                - Use simple language and avoid complex medical jargon when possible
                - When you need current medical information, use Google Search to find reliable sources
                - Always cite sources when using external information
                
                Remember: You are providing educational information, not medical advice.`,
                tools: [{ googleSearch: {} }]
            }
        });

        return Response.json({ response: response.text });

    } catch (error) {
        console.error('Chat error:', error);
        return Response.json({ error: 'Failed to process chat message' }, { status: 500 });
    }
}