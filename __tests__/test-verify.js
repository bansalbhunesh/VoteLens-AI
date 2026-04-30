import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

async function test() {
  try {
    const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: 'Who won the 2024 Indian election?',
      config: {
        tools: [{ googleSearch: {} }]
      }
    });
    console.log('Text:', response.text);
    console.log('Candidates:', JSON.stringify(response.candidates[0]?.groundingMetadata, null, 2));
  } catch (e) {
    console.error('Error:', e.message);
  }
}
test();
