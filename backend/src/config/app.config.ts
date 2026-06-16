import dotenv from 'dotenv';
dotenv.config();

export const config = {
  appName: 'NexusURL',
  env: process.env.APP_ENV || 'production',
  serverIp: '187.77.183.14',
  domain: 'xus.me',
  ports: {
    frontend: 1590,
    backend: 7658,
    publicApi: 1156,
    database: 7002,
  },
  urls: {
    frontend: 'https://xus.me',
    backend: 'https://xus.me/api',
    publicApi: 'https://xus.me/api',
    shortDomain: 'https://xus.me',
    qrBase: 'https://xus.me',
  },
  email: {
    from: 'notifications@xus.me',
    replyTo: 'notifications@xus.me',
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    user: process.env.EMAIL_USER || 'notifications@xus.me',
    pass: process.env.EMAIL_PASS || '',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'CHANGE_THIS_32_CHARACTER_SECRET_KEY_EXAMPLE',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'CHANGE_THIS_ANOTHER_32_CHAR_SECRET_KEY',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  database: {
    url: process.env.DATABASE_URL || 'postgresql://nexususer:nexuspass123@postgres:5432/nexusurl',
  },
  redis: {
    url: process.env.REDIS_URL || 'redis://redis:6379',
  },
  cors: {
    origins: process.env.CORS_ORIGINS
      ? process.env.CORS_ORIGINS.split(',').map(s => s.trim())
      : [
          'https://xus.me',
          'http://xus.me',
          'http://187.77.183.14:1590',
          'http://localhost:1590',
        ],
    credentials: true,
  },
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    publicApiMax: parseInt(process.env.PUBLIC_API_RATE_LIMIT || '50'),
    authMax: 5,
    authWindowMs: 15 * 60 * 1000,
  },
  twoFactor: {
    secret: process.env.TWO_FACTOR_SECRET || 'nexusurl_2fa_secret_2024',
  },
  features: {
    enable2FA: process.env.ENABLE_2FA === 'true',
    enableEmailNotifications: process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true',
    enableQRCode: process.env.ENABLE_QR_CODE === 'true',
    enablePublicApi: process.env.PUBLIC_API_ENABLED === 'true',
    enableExportData: process.env.ENABLE_EXPORT_DATA === 'true',
  },
  bcryptSaltRounds: 12,
  logLevel: process.env.LOG_LEVEL || 'info',
};

export default config;
