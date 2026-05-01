import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import morgan from 'morgan';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import apiRoutes from './api/routes.js';
import { requestId } from './api/middleware/requestId.js';
import { errorHandler } from './api/middleware/errorHandler.js';
import { validateEnv } from './api/middleware/validateEnv.js';

validateEnv();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;
const isProd = process.env.NODE_ENV === 'production';

const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map((o) => o.trim())
  : ['http://localhost:5173', 'http://localhost:3001'];

// ── Request ID (must be first for tracing) ──
app.use(requestId);

// ── Security ──
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);


app.use(
  cors({
    origin: (origin, cb) => {
      // Allow requests with no origin, or any origin in production, or matched origins
      if (!origin || isProd || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      cb(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
  })
);

// ── Performance ──
app.use(compression());

// ── Body parsing ──
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: false, limit: '5mb' }));

// ── Logging ──
app.use(
  morgan(isProd ? 'combined' : 'dev', {
    skip: (req) => req.path === '/api/health',
  })
);

// ── Rate limiting — tiered per endpoint category ──
const defaultLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  message: { error: 'Too many requests. Please wait a moment and try again.' },
});

const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip,
  message: { error: 'AI request limit reached. Please wait a minute.' },
});

app.use('/api/', defaultLimiter);
app.use('/api/chat', aiLimiter);
app.use('/api/verify', aiLimiter);
app.use('/api/verify-stream', aiLimiter);
app.use('/api/simulate', aiLimiter);
app.use('/api/quiz', aiLimiter);
app.use('/api/analyze', aiLimiter);
app.use('/api/intent', aiLimiter);

// ── API Routes ──
app.use('/api', apiRoutes);

// ── Static Files + SPA Fallback (production) ──
if (isProd) {
  const clientDist = join(__dirname, 'client', 'dist');

  // Hashed assets (JS/CSS bundles from Vite) get long-term immutable caching.
  // index.html must never be cached so users always get the latest shell.
  app.use(
    '/assets',
    express.static(join(clientDist, 'assets'), {
      maxAge: '1y',
      immutable: true,
      etag: false,
    })
  );
  app.use(
    express.static(clientDist, {
      maxAge: 0,
      etag: true,
      setHeaders(res, filePath) {
        if (filePath.endsWith('.html')) {
          res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        }
      },
    })
  );
  app.get('*', (_req, res) => {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.sendFile(join(clientDist, 'index.html'));
  });
}

// ── Error Handler (must be last) ──
app.use(errorHandler);

// ── Server startup ──
const server = app.listen(PORT, () => {
  console.error(
    JSON.stringify({
      level: 'info',
      event: 'server_start',
      port: PORT,
      env: process.env.NODE_ENV || 'development',
    })
  );
  if (!isProd) {
    console.error(`  API  → http://localhost:${PORT}/api/health`);
    console.error(`  App  → http://localhost:5173`);
  }
});

// ── Graceful shutdown ──
function shutdown(signal) {
  console.error(JSON.stringify({ level: 'info', event: 'shutdown', signal }));
  server.close(() => {
    console.error(JSON.stringify({ level: 'info', event: 'shutdown_complete' }));
    process.exit(0);
  });
  // Force exit after 10s if connections don't drain
  setTimeout(() => process.exit(1), 10_000).unref();
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('uncaughtException', (err) => {
  console.error(JSON.stringify({ level: 'fatal', event: 'uncaught_exception', message: err.message, stack: err.stack }));
  process.exit(1);
});
process.on('unhandledRejection', (reason) => {
  console.error(JSON.stringify({ level: 'fatal', event: 'unhandled_rejection', reason: String(reason) }));
  process.exit(1);
});
