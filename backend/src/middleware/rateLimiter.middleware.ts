import rateLimit from 'express-rate-limit';
import { config } from '../config';

export const generalLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  message: { success: false, error: { code: 'RATE_LIMITED', message: 'Too many requests, please try again later' } },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authLimiter = rateLimit({
  windowMs: config.rateLimit.authWindowMs,
  max: config.rateLimit.authMax,
  message: { success: false, error: { code: 'AUTH_RATE_LIMITED', message: 'Too many login attempts, please try again later' } },
  standardHeaders: true,
  legacyHeaders: false,
});

export const publicApiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: config.rateLimit.publicApiMax,
  message: { success: false, error: { code: 'PUBLIC_API_RATE_LIMITED', message: 'Public API rate limit exceeded' } },
  standardHeaders: true,
  legacyHeaders: false,
});
