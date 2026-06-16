export const API_CONFIG = {
  APP_NAME: 'NexusURL',
  DOMAIN: 'xus.me',
  SERVER_IP: '187.77.183.14',

  PORTS: {
    FRONTEND: 1590,
    BACKEND_API: 7658,
    PUBLIC_API: 1156,
    DATABASE: 7002,
  },

  BASE_URLS: {
    FRONTEND: 'http://187.77.183.14:1590',
    BACKEND_API: 'http://187.77.183.14:1590',
    PUBLIC_API: 'http://187.77.183.14:1156',
    SHORTENER: 'http://xus.me',
    QR_BASE: 'http://xus.me',
  },

  API: {
    AUTH: '/api/auth',
    LINKS: '/api/links',
    USER: '/api/user',
    QR: '/api/qr',
    PUBLIC_CREATE: '/api/public/create',
  },

  EMAIL: {
    FROM: 'notifications@xus.me',
    REPLY_TO: 'notifications@xus.me',
    SUPPORT: 'notifications@xus.me',
  },

  FEATURES: {
    ENABLE_2FA: true,
    ENABLE_QR_CODE: true,
    ENABLE_PUBLIC_API: true,
    ENABLE_EMAIL_NOTIFICATIONS: true,
  },
};

export default API_CONFIG;
