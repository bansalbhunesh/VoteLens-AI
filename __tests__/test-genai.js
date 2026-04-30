import { GoogleGenAI } from '@google/genai';
console.log(typeof GoogleGenAI);
try {
  const ai = new GoogleGenAI({apiKey: 'dummy'});
  console.log('Success:', !!ai.models);
} catch (e) {
  console.log('Error:', e.message);
}
