import { GoogleGenAI } from "@google/genai";

// Validate API key exists
if (!process.env.GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
}

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
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
        console.log('Processing file:', fileName.replace(/[^a-zA-Z0-9.-]/g, ''), 'Size:', file.size, 'Type:', mimeType);

        // Add a small delay to prevent rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));

        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash",
            contents: [
                {
                    parts: [
                        { text: process.env.SYSTEM_PROMPT },
                        {
                            inlineData: {
                                data: base64Data,
                                mimeType: mimeType
                            }
                        }
                    ]
                }
            ]
        });

        console.log('API Response:', response);

        if (!response || !response.text) {
            throw new Error('No response received from AI service');
        }

        const result = response.text;
        if (!result) {
            throw new Error('No text content in AI response');
        }

        console.log('AI Response received, length:', result.length);
        return Response.json({ result });

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