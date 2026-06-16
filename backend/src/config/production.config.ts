export const productionConfig = {
  appName: 'NexusURL',
  server: {
    ip: '187.77.183.14',
    domain: 'xus.me',
    apiPort: 7658,
    publicApiPort: 1156,
    frontendPort: 1590,
  },
  urls: {
    frontend: 'https://xus.me',
    backend: 'https://xus.me/api',
    publicApi: 'https://xus.me/api',
    shortDomain: 'https://xus.me',
  },
  email: {
    from: 'notifications@xus.me',
    replyTo: 'notifications@xus.me',
    support: 'notifications@xus.me',
  },
  database: {
    host: 'postgres',
    port: 5432,
    name: 'nexusurl',
    externalPort: 7002,
  },
  cors: {
    origins: [
      'https://xus.me',
      'http://xus.me',
      'http://187.77.183.14:1590',
    ],
    credentials: true,
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    max: 100,
    publicApiMax: 50,
  },
};

export default productionConfig;
