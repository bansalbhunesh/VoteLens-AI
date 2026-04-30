/**
 * VoteLens AI — API Routes
 * All backend endpoints for Gemini interactions.
 */

import { Router } from 'express';
import multer from 'multer';
import {
  chatWithMentor,
  analyzeImage,
  verifyInformation,
  getElectionInfo,
  getSimulationNarration,
  generateQuiz,
} from './gemini.js';

const router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    cb(null, allowed.includes(file.mimetype));
  },
});

/**
 * POST /api/chat
 * Streaming chat with the AI election mentor.
 * Body: { messages: [{role, content}], mode: 'normal'|'nervous' }
 */
router.post('/chat', async (req, res) => {
  try {
    const { messages, mode = 'normal', lang = 'en' } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    // Set up Server-Sent Events for streaming
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    const stream = chatWithMentor(messages, mode, lang);
    for await (const chunk of stream) {
      res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Chat error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate response.' });
    } else {
      res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
      res.end();
    }
  }
});

/**
 * POST /api/analyze
 * Multimodal image analysis.
 * Body: FormData with 'image' file and optional 'prompt' text field.
 */
router.post('/analyze', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Image file is required.' });
    }

    const userPrompt = req.body.prompt || '';
    const result = await analyzeImage(req.file.buffer, req.file.mimetype, userPrompt);

    res.json({ analysis: result });
  } catch (error) {
    console.error('Analyze error:', error);
    res.status(500).json({ error: 'Failed to analyze image.' });
  }
});

/**
 * POST /api/verify
 * Fact-check a claim using Google Search grounding.
 * Body: { claim: string }
 */
router.post('/verify', async (req, res) => {
  try {
    const { claim } = req.body;

    if (!claim || typeof claim !== 'string' || claim.trim().length === 0) {
      return res.status(400).json({ error: 'Claim text is required.' });
    }

    const result = await verifyInformation(claim.trim());
    res.json(result);
  } catch (error) {
    console.error('Verify error:', error);
    res.status(500).json({ error: 'Failed to verify claim.' });
  }
});

/**
 * POST /api/election-info
 * Get grounded election information.
 * Body: { query: string }
 */
router.post('/election-info', async (req, res) => {
  try {
    const { query } = req.body;

    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({ error: 'Query text is required.' });
    }

    const result = await getElectionInfo(query.trim());
    res.json(result);
  } catch (error) {
    console.error('Election info error:', error);
    res.status(500).json({ error: 'Failed to get election information.' });
  }
});

/**
 * POST /api/simulate
 * Get narration for a simulation step. Streams via SSE.
 * Body: { step: number, stepName: string, facts: string[] }
 */
router.post('/simulate', async (req, res) => {
  try {
    const { step, stepName, facts = [] } = req.body;

    if (!step || !stepName) {
      return res.status(400).json({ error: 'Step number and name are required.' });
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    });

    const stream = getSimulationNarration(step, stepName, facts);
    for await (const chunk of stream) {
      res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (error) {
    console.error('Simulate error:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Failed to generate narration.' });
    } else {
      res.end();
    }
  }
});

/**
 * POST /api/quiz
 * Generate 5 MCQ quiz questions using Gemini JSON structured output.
 * Body: { topic: string }
 */
router.post('/quiz', async (req, res) => {
  try {
    const { topic } = req.body;
    if (!topic || typeof topic !== 'string' || topic.trim().length === 0) {
      return res.status(400).json({ error: 'Topic is required.' });
    }
    const questions = await generateQuiz(topic.trim());
    res.json({ questions });
  } catch (error) {
    console.error('Quiz error:', error);
    res.status(500).json({ error: 'Failed to generate quiz.' });
  }
});

/**
 * GET /api/health
 * Health check endpoint for Cloud Run.
 */
router.get('/health', (_req, res) => {
  res.json({
    status: 'healthy',
    service: 'VoteLens AI',
    timestamp: new Date().toISOString(),
  });
});

export default router;
