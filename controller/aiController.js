import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';
dotenv.config();

const ai = new GoogleGenAI({ apiKey: `${process.env.GEMINI_API_KEY}` });
export const aiChat = async (req, res) => {
    try {

        const { prompt } = req.body;

        const response = await ai.models.generateContentStream({
            model: "gemini-2.0-flash",
            contents: prompt,
            config: {
                maxOutputTokens: 500,
            },
        });
        res.setHeader('Content-Type', 'text/plain');

        for await (const chunk of response) {
            if (chunk.text) {
                // console.log("-------------", chunk.text);
                res.write(chunk.text);
            }
        }

        res.end();
    } catch (error) {
        console.error("Error listing models:", error);
        res.json({ mesage: "NOT Ok" });

    }
}