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
            history.forEach((msg: Record<string, unknown>) => {
                const message = msg as { isUser: boolean; text: string };
                conversationContext += `${message.isUser ? 'User' : 'Assistant'}: ${message.text}\n`;
            });
            conversationContext += "\n";
        }

        conversationContext += `Current question: ${message}`;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: [conversationContext],
            config: {
                systemInstruction: process.env.SYSTEM_PROMPT,
                tools: [{ googleSearch: {} }]
            }
        });

        return Response.json({ response: response.text });

    } catch (error) {
        console.error('Chat error:', error);
        return Response.json({ error: 'Failed to process chat message' }, { status: 500 });
    }
}