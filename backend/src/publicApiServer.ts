import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { config } from './config';
import { generateRequestId } from './utils/helpers';
import logger from './utils/logger';
import db from './services/database.service';
import redisService from './services/redis.service';
import publicApiRoutes from './routes/publicApi.routes';

const app = express();

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: '*', credentials: false }));
app.use(compression());
app.use(express.json());

app.use((req: any, res, next) => {
  req.requestId = generateRequestId();
  res.setHeader('X-Request-ID', req.requestId);
  res.setHeader('X-Powered-By', `${config.appName} Public API`);
  next();
});

const morganStream = { write: (message: string) => logger.info(message.trim()) };
app.use(morgan(':method :url :status :response-time ms', { stream: morganStream }));

app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    app: `${config.appName} Public API`,
    version: '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/public', publicApiRoutes);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Public API error:', err);
  res.status(err.status || 500).json({
    success: false,
    error: { code: 'INTERNAL_ERROR', message: 'An unexpected error occurred' },
  });
});

const PORT = config.ports.publicApi;

async function start(): Promise<void> {
  try {
    await db.connect();
    await redisService.connect();

    app.listen(PORT, '0.0.0.0', () => {
      logger.info(`${config.appName} Public API running on http://0.0.0.0:${PORT}`);
    });
  } catch (error) {
    logger.error('Failed to start public API server:', error);
    process.exit(1);
  }
}

start();

process.on('SIGTERM', async () => {
  await redisService.disconnect();
  await db.disconnect();
  process.exit(0);
});

export default app;
