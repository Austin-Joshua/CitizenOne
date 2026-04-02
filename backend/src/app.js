const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const { createApiRouter } = require('./interfaces/http/apiRouter');
const { requestContext } = require('./middlewares/requestContext');
const { apiLimiter } = require('./middlewares/rateLimits');
const { logger } = require('./infrastructure/logging/structuredLogger');
const { assertProductionConfig } = require('./lib/productionCheck');
const { stripeWebhook } = require('./routes/stripeWebhook');
const { dbHealthCheck } = require('./lib/db/pool');
const { isDatabaseEnabled, isPostgresEnabled, isMongoEnabled } = require('./lib/db/config');
const { mongoHealthCheck } = require('./lib/db/mongoClient');

const app = express();
const isProd = process.env.NODE_ENV === 'production';
const corsOrigin = process.env.CORS_ORIGIN;

app.set('trust proxy', 1);

const helmetBase = {
  crossOriginResourcePolicy: { policy: 'cross-origin' },
};

if (isProd && String(process.env.ENABLE_HELMET_CSP || '').toLowerCase() === 'true') {
  const connectSrc = ["'self'"];
  if (corsOrigin) {
    corsOrigin.split(',').forEach((s) => {
      const o = s.trim();
      if (o) connectSrc.push(o);
    });
  }
  helmetBase.contentSecurityPolicy = {
    useDefaults: true,
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'blob:'],
      connectSrc,
      frameAncestors: ["'none'"],
      baseUri: ["'self'"],
      formAction: ["'self'"],
    },
  };
}

app.use(helmet(helmetBase));

if (corsOrigin) {
  app.use(
    cors({
      origin: corsOrigin.split(',').map((s) => s.trim()),
      credentials: true,
    })
  );
} else {
  app.use(cors());
}

if (process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET) {
  app.post('/api/webhooks/stripe', express.raw({ type: 'application/json', limit: '1mb' }), stripeWebhook);
  app.post('/api/v1/webhooks/stripe', express.raw({ type: 'application/json', limit: '1mb' }), stripeWebhook);
}

app.use(express.json({ limit: '256kb' }));
app.use(requestContext);
morgan.token('request-id', (req) => req.requestId || '-');
app.use(morgan(isProd ? ':remote-addr :method :url :status :res[content-length] :request-id' : 'dev'));

const apiRouter = createApiRouter();
const apiStack = express.Router();
apiStack.use(apiLimiter);
apiStack.use(apiRouter);
app.use('/api', apiStack);
app.use('/api/v1', apiStack);

const cluster = require('cluster');
const os = require('os');

/**
 * Handle uncaught exceptions and unhandled rejections globally 
 * to prevent the entire process from crashing silently.
 */
process.on('uncaughtException', (err) => {
  logger.error('💥 [CRITICAL ERROR] UNCAUGHT EXCEPTION', { message: err.message, stack: err.stack });
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  logger.error('🔥 [CRITICAL ERROR] UNHANDLED REJECTION', { message: err.message, stack: err.stack });
  // Only exit the worker, primary will restart it
  process.exit(1);
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'citizen-one-api',
    worker: process.pid,
    version: process.env.npm_package_version || '1.0.0',
  });
});

app.get('/ready', async (req, res) => {
  /** @type {{ name: string, ok: boolean, latencyMs?: number }[]} */
  const checks = [];

  if (isPostgresEnabled()) {
    const t0 = Date.now();
    try {
      const ok = await dbHealthCheck();
      checks.push({ name: 'postgres', ok, latencyMs: Date.now() - t0 });
    } catch {
      checks.push({ name: 'postgres', ok: false, latencyMs: Date.now() - Date.now() });
    }
  } else {
    checks.push({ name: 'postgres', ok: true, detail: 'disabled' });
  }

  if (isMongoEnabled()) {
    const t0 = Date.now();
    try {
      const ok = await mongoHealthCheck();
      checks.push({ name: 'mongodb', ok, latencyMs: Date.now() - t0 });
    } catch {
      checks.push({ name: 'mongodb', ok: false, latencyMs: Date.now() - Date.now() });
    }
  } else {
    checks.push({ name: 'mongodb', ok: true, detail: 'disabled' });
  }
  const redisUrl = String(process.env.REDIS_URL || '').trim();
  if (redisUrl) {
    const t0 = Date.now();
    try {
      const { getCacheAdapter } = require('./integration/cache/getCacheAdapter');
      const cache = getCacheAdapter();
      if (typeof cache.ping === 'function') {
        const ok = await cache.ping();
        checks.push({ name: 'redis', ok, latencyMs: Date.now() - t0 });
      } else {
        checks.push({ name: 'redis', ok: false, detail: 'adapter_has_no_ping', latencyMs: Date.now() - t0 });
      }
    } catch {
      checks.push({ name: 'redis', ok: false, latencyMs: Date.now() - t0 });
    }
  }

  // AgriFlux Integration Check
  const tAgri = Date.now();
  try {
    const agriRes = await fetch('https://agriflux-backend.onrender.com/health', { signal: AbortSignal.timeout(3000) });
    checks.push({ name: 'agriflux', ok: agriRes.ok, latencyMs: Date.now() - tAgri });
  } catch {
    checks.push({ name: 'agriflux', ok: false, detail: 'timeout_or_offline', latencyMs: Date.now() - tAgri });
  }

  const allOk = checks.every((c) => c.ok);
  const postgresCheck = checks.find((c) => c.name === 'postgres');
  const mongoCheck = checks.find((c) => c.name === 'mongodb');
  
  let database = 'unknown';
  if (!isDatabaseEnabled()) {
    database = 'disabled';
  } else {
    const isPgOk = postgresCheck ? postgresCheck.ok : true;
    const isMongoOk = mongoCheck ? mongoCheck.ok : true;
    if (isPgOk && isMongoOk) database = true;
    else if (!isPgOk || !isMongoOk) database = false;
  }

  if (!allOk) {
    return res.status(503).json({ status: 'not_ready', database, checks });
  }
  return res.status(200).json({ status: 'ready', database, checks });
});

app.use((err, req, res, next) => {
  const requestId = req.requestId;
  logger.error(err.message || 'unhandled_error', {
    requestId,
    stack: isProd ? undefined : err.stack,
    name: err.name,
  });
  if (res.headersSent) {
    return next(err);
  }
  const body = { message: 'Internal Server Error' };
  if (requestId) body.requestId = requestId;
  if (!isProd && err.message) body.detail = err.message;
  res.status(500).json(body);
});

const PORT = process.env.PORT || 5000;

/**
 * Cluster Deployment:
 * Spawns a worker for every CPU core to handle high traffic and provide 
 * automatic zero-downtime restarts.
 */
if (cluster.isPrimary && isProd) {
    const numCPUs = os.cpus().length;
    logger.info('cluster_primary_active', { pid: process.pid, workers: numCPUs });

    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }

    cluster.on('exit', (worker, code, signal) => {
        logger.warn('cluster_worker_died', { pid: worker.process.pid, code, signal });
        cluster.fork();
    });
} else {
    if (require.main === module || !cluster.isPrimary) {
        try {
            assertProductionConfig();
        } catch (e) {
            console.error(e.message);
            process.exit(1);
        }
        app.listen(PORT, () => {
            logger.info('server_listening', { port: PORT, worker: process.pid });
        });
    }
}

module.exports = app;
