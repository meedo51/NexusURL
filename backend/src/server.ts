import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import path from 'path';
import { config } from './config';
import { generalLimiter } from './middleware/rateLimiter.middleware';
import { generateRequestId } from './utils/helpers';
import logger from './utils/logger';
import db from './services/database.service';
import redisService from './services/redis.service';

import authRoutes from './routes/auth.routes';
import linkRoutes from './routes/links.routes';
import userRoutes from './routes/user.routes';
import qrRoutes from './routes/qr.routes';
import redirectRoutes from './routes/redirect.routes';

const app = express();

app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false,
}));
app.use(cors({
  origin: config.cors.origins,
  credentials: config.cors.credentials,
}));
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(generalLimiter);

app.use((req: any, res, next) => {
  req.requestId = generateRequestId();
  res.setHeader('X-Request-ID', req.requestId);
  res.setHeader('X-Powered-By', config.appName);
  next();
});

const morganStream = { write: (message: string) => logger.info(message.trim()) };
app.use(morgan(':method :url :status :response-time ms - :req[x-request-id]', { stream: morganStream }));

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    app: config.appName,
    version: '1.0.0',
    server: config.serverIp,
    ports: {
      frontend: config.ports.frontend,
      api: config.ports.backend,
      publicApi: config.ports.publicApi,
      database: config.ports.database,
    },
    services: {
      database: db.client ? 'connected' : 'disconnected',
      redis: redisService.isReady() ? 'connected' : 'disconnected',
      email: 'configured',
    },
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/links', linkRoutes);
app.use('/api/user', userRoutes);
app.use('/api/qr', qrRoutes);
app.use('/', redirectRoutes);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: config.env === 'production' ? 'An unexpected error occurred' : err.message,
    },
  });
});

const PORT = config.ports.backend;

async function start(): Promise<void> {
  try {
    await db.connect();
    await redisService.connect();
    logger.info('Database and Redis connected');

    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`${config.appName} backend running on http://0.0.0.0:${PORT}`);
      logger.info(`Health check: http://0.0.0.0:${PORT}/health`);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

start();

process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  await redisService.disconnect();
  await db.disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  await redisService.disconnect();
  await db.disconnect();
  process.exit(0);
});

export default app;
