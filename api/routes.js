import { Router } from 'express';
import { logEvent } from './services/google.js';
import multer from 'multer';
import {
  chatWithMentor,
  analyzeImage,
  verifyInformation,
  getElectionInfo,
  getSimulationNarration,
  generateQuiz,
  determineIntent,
  verifyInformationStream,
} from './gemini.js';

const router = Router();

// Input length limits
const MAX_CLAIM_LENGTH   = 2000;
const MAX_QUERY_LENGTH   = 1000;
const MAX_TOPIC_LENGTH   = 200;
const MAX_MSG_CONTENT    = 4000;
const MAX_INTENT_LENGTH  = 500;

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

// ── SSE helpers ──

function sseOpen(res) {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive',
    'X-Accel-Buffering': 'no',
  });
}

function sseData(res, payload) {
  res.write(`data: ${JSON.stringify(payload)}\n\n`);
}

// Raw SSE done marker — NOT JSON-encoded so client's `=== '[DONE]'` check works correctly.
function sseDone(res) {
  res.write('data: [DONE]\n\n');
  res.end();
}

// ── POST /api/chat ──
router.post('/chat', async (req, res, next) => {
  try {
    const { messages, mode = 'normal', lang = 'en' } = req.body;
    await logEvent('chat_message_received', { mode, lang });

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'messages must be a non-empty array.' });
    }

    // Validate individual message shape and content length
    for (const m of messages) {
      if (!m.role || !m.content || typeof m.content !== 'string') {
        return res.status(400).json({ error: 'Each message must have role and content.' });
      }
      if (m.content.length > MAX_MSG_CONTENT) {
        return res.status(400).json({ error: `Message content exceeds ${MAX_MSG_CONTENT} character limit.` });
      }
    }

    const capped = messages.slice(-40);

    sseOpen(res);

    // Abort the Gemini stream if the client disconnects mid-response.
    const abortController = new AbortController();
    req.on('close', () => abortController.abort());

    const stream = chatWithMentor(capped, mode, lang, abortController.signal);
    for await (const chunk of stream) {
      if (res.writableEnded) break;
      sseData(res, { text: chunk });
    }

    if (!res.writableEnded) sseDone(res);
  } catch (err) {
    if (err.name === 'AbortError') return res.end();
    if (res.headersSent) {
      if (!res.writableEnded) { sseData(res, { error: 'Stream interrupted.' }); res.end(); }
    } else {
      next(err);
    }
  }
});

// ── POST /api/analyze ──
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
router.post('/verify', async (req, res, next) => {
  try {
    const { claim } = req.body;
    if (!claim || typeof claim !== 'string' || !claim.trim()) {
      return res.status(400).json({ error: 'claim must be a non-empty string.' });
    }
    if (claim.length > MAX_CLAIM_LENGTH) {
      return res.status(400).json({ error: `Claim exceeds ${MAX_CLAIM_LENGTH} character limit.` });
    }
    const result = await verifyInformation(claim.trim());
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ── POST /api/election-info ──
router.post('/election-info', async (req, res, next) => {
  try {
    const { query } = req.body;
    if (!query || typeof query !== 'string' || !query.trim()) {
      return res.status(400).json({ error: 'query must be a non-empty string.' });
    }
    if (query.length > MAX_QUERY_LENGTH) {
      return res.status(400).json({ error: `Query exceeds ${MAX_QUERY_LENGTH} character limit.` });
    }
    const result = await getElectionInfo(query.trim());
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ── POST /api/simulate ──
router.post('/simulate', async (req, res, next) => {
  try {
    const { step, stepName, facts = [] } = req.body;
    if (!step || !stepName) {
      return res.status(400).json({ error: 'step and stepName are required.' });
    }

    sseOpen(res);

    const abortController = new AbortController();
    req.on('close', () => abortController.abort());

    const stream = getSimulationNarration(step, stepName, facts, abortController.signal);
    for await (const chunk of stream) {
      if (res.writableEnded) break;
      sseData(res, { text: chunk });
    }

    if (!res.writableEnded) sseDone(res);
  } catch (err) {
    if (err.name === 'AbortError') return res.end();
    if (res.headersSent) {
      if (!res.writableEnded) res.end();
    } else {
      next(err);
    }
  }
});

// ── POST /api/quiz ──
router.post('/quiz', async (req, res, next) => {
  try {
    const { topic } = req.body;
    if (!topic || typeof topic !== 'string' || !topic.trim()) {
      return res.status(400).json({ error: 'topic must be a non-empty string.' });
    }
    if (topic.length > MAX_TOPIC_LENGTH) {
      return res.status(400).json({ error: `Topic exceeds ${MAX_TOPIC_LENGTH} character limit.` });
    }
    const questions = await generateQuiz(topic.trim());
    res.json({ questions });
  } catch (err) {
    next(err);
  }
});

// ── POST /api/intent ── Omni-Intent Router
router.post('/intent', async (req, res, next) => {
  try {
    const { input } = req.body;
    if (!input || typeof input !== 'string' || !input.trim()) {
      return res.status(400).json({ error: 'input must be a non-empty string.' });
    }
    if (input.length > MAX_INTENT_LENGTH) {
      return res.status(400).json({ error: `Input exceeds ${MAX_INTENT_LENGTH} character limit.` });
    }
    const result = await determineIntent(input.trim());
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// ── POST /api/verify-stream ── Streaming verification with chain-of-thought
router.post('/verify-stream', async (req, res, next) => {
  try {
    const { claim } = req.body;
    if (!claim || typeof claim !== 'string' || !claim.trim()) {
      return res.status(400).json({ error: 'claim must be a non-empty string.' });
    }
    if (claim.length > MAX_CLAIM_LENGTH) {
      return res.status(400).json({ error: `Claim exceeds ${MAX_CLAIM_LENGTH} character limit.` });
    }

    sseOpen(res);

    const abortController = new AbortController();
    req.on('close', () => abortController.abort());

    const stream = verifyInformationStream(claim.trim(), abortController.signal);
    for await (const chunk of stream) {
      if (res.writableEnded) break;
      sseData(res, { text: chunk });
    }

    if (!res.writableEnded) sseDone(res);
  } catch (err) {
    if (err.name === 'AbortError') return res.end();
    if (res.headersSent) {
      if (!res.writableEnded) { sseData(res, { error: 'Stream interrupted.' }); res.end(); }
    } else {
      next(err);
    }
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
