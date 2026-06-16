import { Request, Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { config } from '../config';
import db from '../services/database.service';
import redisService from '../services/redis.service';
import logger from '../utils/logger';
import { generateShortCode, generateShortUrl } from '../utils/helpers';

function getWeekKey(): string {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor((now.getTime() - startOfYear.getTime()) / 86400000);
  const week = Math.ceil((days + startOfYear.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${week}`;
}

const FREE_LIMIT = 5;
const FREE_TTL = 7 * 24 * 60 * 60;

export async function checkFreeLimit(req: Request, res: Response): Promise<void> {
  const ip = req.ip || req.socket.remoteAddress || 'unknown';
  const weekKey = getWeekKey();
  const redisKey = `free:limit:${ip}:${weekKey}`;
  const current = await redisService.get(redisKey);
  const count = current ? parseInt(current, 10) : 0;
  const remaining = Math.max(0, FREE_LIMIT - count);

  res.json({ success: true, data: { remaining, limit: FREE_LIMIT, period: 'weekly' } });
}

export async function publicCreateLink(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const weekKey = getWeekKey();
    const freeKey = `free:limit:${ip}:${weekKey}`;
    const current = await redisService.get(freeKey);
    const count = current ? parseInt(current, 10) : 0;
    if (count >= FREE_LIMIT) {
      res.status(429).json({
        success: false,
        error: { code: 'FREE_LIMIT_REACHED', message: 'Free limit reached. Sign up for unlimited access.' },
      });
      return;
    }
    await redisService.incr(freeKey);
    if (!current) await redisService.expire(freeKey, FREE_TTL);

    const { l: longUrl, ca: customAlias, pwd: password, exp: expirationDate, acp: oneTimeAccess } = req.query;

    let shortCode: string;
    let isCustom = false;

    if (customAlias && typeof customAlias === 'string') {
      const existing = await db.findLinkByShortCode(customAlias);
      if (existing) {
        res.status(409).json({
          success: false,
          error: { code: 'CUSTOM_ALIAS_TAKEN', message: `The custom alias '${customAlias}' is already taken` },
        });
        return;
      }
      shortCode = customAlias;
      isCustom = true;
    } else {
      let attempts = 0;
      do {
        shortCode = generateShortCode(6, { includeUppercase: true, includeLowercase: true, includeNumbers: true });
        const existing = await db.findLinkByShortCode(shortCode);
        if (!existing) break;
        attempts++;
      } while (attempts < 5);

      if (attempts >= 5) {
        shortCode = generateShortCode(6, { includeUppercase: true, includeLowercase: true, includeNumbers: true }) +
          Date.now().toString(36).substring(0, 4);
      }
    }

    let passwordHash: string | undefined;
    if (password && typeof password === 'string') {
      passwordHash = await bcrypt.hash(password, config.bcryptSaltRounds);
    }

    const link = await db.createLink({
      longUrl: longUrl as string,
      shortCode,
      customAlias: isCustom ? (customAlias as string) : undefined,
      isCustom,
      passwordHash,
      expirationDate: expirationDate ? new Date(expirationDate as string) : undefined,
      oneTimeAccess: oneTimeAccess === '1',
    });

    const shortUrl = generateShortUrl(shortCode);

    res.status(201).json({
      success: true,
      data: {
        short_url: shortUrl,
        short_code: shortCode,
        long_url: link.longUrl,
        qr_code_url: `${config.urls.backend}/api/qr/${shortCode}`,
        created_at: link.createdAt,
      },
    });
  } catch (error) {
    logger.error('Public API create link error:', error);
    next(error);
  }
}
