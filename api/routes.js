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
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowed.includes(file.mimetype)) {
      return cb(new Error('Only JPEG, PNG, WebP, and GIF images are accepted.'));
    }
    cb(null, true);
  },
});

// ── Helpers ──

function sseHeaders(res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
}

function sseWrite(res, payload) {
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

// ── POST /api/chat ──
// Streams chat responses as SSE. Body: { messages, mode, lang }
router.post('/chat', async (req, res, next) => {
  try {
    const { messages, mode = 'normal', lang = 'en' } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages must be a non-empty array.' });
    }

    // Enforce a hard cap to prevent token abuse
    const capped = messages.slice(-40);

    sseHeaders(res);

    const stream = chatWithMentor(capped, mode, lang);
    for await (const chunk of stream) {
      sseWrite(res, { text: chunk });
    }

    sseWrite(res, '[DONE]');
    res.end();
  } catch (err) {
    if (res.headersSent) {
      sseWrite(res, { error: 'Stream interrupted. Please try again.' });
      res.end();
    } else {
      next(err);
    }
  }
});

// ── POST /api/analyze ──
// Multimodal image analysis. Body: FormData with 'image' + optional 'prompt'.
router.post('/analyze', upload.single('image'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'An image file is required.' });
    }
    const analysis = await analyzeImage(req.file.buffer, req.file.mimetype, req.body.prompt || '');
    res.json({ analysis });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/verify ──
// Fact-check a claim using Google Search grounding. Body: { claim }
router.post('/verify', async (req, res, next) => {
  try {
    const { claim } = req.body;
    if (!claim || typeof claim !== 'string' || !claim.trim()) {
      return res.status(400).json({ error: 'claim must be a non-empty string.' });
    }
    const result = await verifyInformation(claim.trim());
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ── POST /api/election-info ──
// Grounded real-time election information. Body: { query }
router.post('/election-info', async (req, res, next) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({ error: 'query must be a non-empty string.' });
    }
    const result = await getElectionInfo(query.trim());
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ── POST /api/simulate ──
// Streams simulation step narration as SSE. Body: { step, stepName, facts }
router.post('/simulate', async (req, res, next) => {
  try {
    const { step, stepName, facts = [] } = req.body;
    if (!step || !stepName) {
      return res.status(400).json({ error: 'step and stepName are required.' });
    }

    sseHeaders(res);

    const stream = getSimulationNarration(step, stepName, facts);
    for await (const chunk of stream) {
      sseWrite(res, { text: chunk });
    }

    sseWrite(res, '[DONE]');
    res.end();
  } catch (err) {
    if (res.headersSent) {
      res.end();
    } else {
      next(err);
    }
  }
});

// ── POST /api/quiz ──
// Generate 5 MCQ questions using Gemini JSON mode. Body: { topic }
router.post('/quiz', async (req, res, next) => {
  try {
    const { topic } = req.body;
    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return res.status(400).json({ error: 'topic must be a non-empty string.' });
    }
    const questions = await generateQuiz(topic.trim());
    res.json({ questions });
  } catch (err) {
    next(err);
  }
});

// ── GET /api/health ──
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'votelens-ai',
    version: process.env.npm_package_version || '1.0.0',
    uptime: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

export default router;
