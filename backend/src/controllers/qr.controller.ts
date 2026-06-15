import { Request, Response, NextFunction } from 'express';
import QRCode from 'qrcode';
import { config } from '../config';
import db from '../services/database.service';
import redisService from '../services/redis.service';
import logger from '../utils/logger';
import { generateShortUrl } from '../utils/helpers';

export async function generateQRCode(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { shortCode } = req.params;
    const size = Math.min(1000, Math.max(100, parseInt(req.query.size as string) || 300));

    const cacheKey = `qr:${shortCode}:${size}`;
    const cached = await redisService.get(cacheKey);
    if (cached) {
      const imgBuffer = Buffer.from(cached, 'base64');
      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': imgBuffer.length,
        'Cache-Control': 'public, max-age=2592000',
      });
      res.end(imgBuffer);
      return;
    }

    const link = await db.findLinkByShortCode(shortCode);
    if (!link || !link.isActive) {
      res.status(404).json({ success: false, error: { code: 'LINK_NOT_FOUND', message: 'Link not found' } });
      return;
    }

    const shortUrl = generateShortUrl(shortCode);
    const qrBuffer = await QRCode.toBuffer(shortUrl, {
      width: size,
      margin: 2,
      color: { dark: '#000000', light: '#ffffff' },
    });

    await redisService.set(cacheKey, qrBuffer.toString('base64'), 30 * 24 * 60 * 60);

    res.writeHead(200, {
      'Content-Type': 'image/png',
      'Content-Length': qrBuffer.length,
      'Cache-Control': 'public, max-age=2592000',
    });
    res.end(qrBuffer);
  } catch (error) {
    logger.error('QR code generation error:', error);
    next(error);
  }
}
