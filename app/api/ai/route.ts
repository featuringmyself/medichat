import { createPartFromUri, createUserContent, GoogleGenAI } from "@google/genai";
import fs from 'fs';
import path from 'path';

const ai = new GoogleGenAI({ 
    apiKey: process.env.GEMINI_API_KEY || '' 
});

export async function GET(request: Request): Promise<Response> {
    try {
        const imagePath = path.join(process.cwd(), 'public', 'prescription.png');
        
        if (!fs.existsSync(imagePath)) {
            return new Response(
                JSON.stringify({ error: 'Prescription image not found' }), 
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }
        
        // More efficient: upload file directly
        const prescription = await ai.files.upload({
            file: fs.createReadStream(imagePath),
            mimeType: 'image/png',
            config: {
                mimeType: 'image/png',
            }
        }
    );

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash", 
            contents: [
                createUserContent([
                    "Can I take Azithromycin with milk?",
                    createPartFromUri(prescription.uri, prescription.mimeType)
                ])
            ],
            config: {
                systemInstruction: process.env.SYSTEM_PROMPT || "Analyze the prescription image and answer the question.",
                responseMimeType: "application/json",
            }
        });

        return new Response(response.text, {
            headers: { 'Content-Type': 'application/json' },
        });
        
    } catch (error: unknown) {
        console.error('Error processing request:', error);
        
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        return new Response(
            JSON.stringify({ error: 'Failed to process request', details: errorMessage }), 
            { 
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        );
    }
}