import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

async function test() {
  try {
    const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: 'Say hello!',
      config: {
        systemInstruction: 'You are a test bot.',
        temperature: 0.1
      }
    });
    console.log('Success:', response.text);
  } catch (e) {
    console.error('Error:', e.message);
  }
}
test();
