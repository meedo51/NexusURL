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
    const margin = Math.min(4, Math.max(0, parseInt(req.query.margin as string) || 2));
    const errorCorrection = (req.query.errorCorrection as string) || 'H';
    const format = (req.query.format as string) || 'png';
    const darkColor = (req.query.dark as string) || '#6C3CE1';
    const lightColor = (req.query.light as string) || '#FFFFFF';

    const validLevels = ['L', 'M', 'Q', 'H'];
    const ecLevel = validLevels.includes(errorCorrection) ? errorCorrection : 'H';

    const cacheKey = `qr:${shortCode}:${size}:${ecLevel}:${format}`;
    const cached = await redisService.get(cacheKey);
    if (cached) {
      if (format === 'svg') {
        res.setHeader('Content-Type', 'image/svg+xml');
        res.setHeader('Cache-Control', 'public, max-age=2592000');
        res.send(cached);
        return;
      }
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

    const shortUrl = `${generateShortUrl(shortCode)}?qr=1`;

    if (format === 'svg') {
      const svg = await QRCode.toString(shortUrl, {
        width: size,
        margin,
        errorCorrectionLevel: ecLevel,
        type: 'svg',
        color: { dark: darkColor, light: lightColor },
      });
      await redisService.set(cacheKey, svg, 30 * 24 * 60 * 60);
      res.setHeader('Content-Type', 'image/svg+xml');
      res.setHeader('Cache-Control', 'public, max-age=2592000');
      res.send(svg);
      return;
    }

    const qrBuffer = await QRCode.toBuffer(shortUrl, {
      width: size,
      margin,
      errorCorrectionLevel: ecLevel,
      color: { dark: darkColor, light: lightColor },
      rendererOpts: { quality: 0.95 },
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

export async function getQRData(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { shortCode } = req.params;

    const link = await db.findLinkByShortCode(shortCode);
    if (!link || !link.isActive) {
      res.status(404).json({ success: false, error: { code: 'LINK_NOT_FOUND', message: 'Link not found' } });
      return;
    }

    const shortUrl = `${generateShortUrl(shortCode)}?qr=1`;
    const qrBuffer = await QRCode.toBuffer(shortUrl, {
      width: 300,
      margin: 2,
      errorCorrectionLevel: 'H',
      color: { dark: '#6C3CE1', light: '#FFFFFF' },
    });

    const qrDataURL = `data:image/png;base64,${qrBuffer.toString('base64')}`;

    res.json({
      success: true,
      data: {
        shortCode: link.shortCode,
        shortUrl,
        longUrl: link.longUrl,
        qrDataURL,
        qrScans: link.qrScans || 0,
        createdAt: link.createdAt,
      },
    });
  } catch (error) {
    logger.error('QR data error:', error);
    next(error);
  }
}

export async function trackQRScan(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { shortCode } = req.params;

    const link = await db.findLinkByShortCode(shortCode);
    if (!link || !link.isActive) {
      res.status(404).json({ success: false, error: { code: 'LINK_NOT_FOUND', message: 'Link not found' } });
      return;
    }

    const ip = req.ip || req.socket.remoteAddress || '0.0.0.0';
    const ua = req.headers['user-agent'] || '';
    const referer = req.headers['referer'] || '';

    await db.createQRScanLog({
      linkId: link.id,
      ipAddress: ip,
      userAgent: ua,
      referer: referer as string,
    });

    await db.incrementQRScans(link.id);

    res.json({ success: true, data: { message: 'QR scan tracked' } });
  } catch (error) {
    logger.error('QR scan tracking error:', error);
    next(error);
  }
}

export async function bulkQRData(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { shortCodes } = req.body;

    if (!Array.isArray(shortCodes) || shortCodes.length === 0) {
      res.status(400).json({ success: false, error: { code: 'INVALID_REQUEST', message: 'shortCodes array is required' } });
      return;
    }

    const results = await Promise.all(
      shortCodes.map(async (shortCode: string) => {
        try {
          const shortUrl = `${generateShortUrl(shortCode)}?qr=1`;
          const qrBuffer = await QRCode.toBuffer(shortUrl, {
            width: 300,
            margin: 2,
            errorCorrectionLevel: 'H',
            color: { dark: '#6C3CE1', light: '#FFFFFF' },
          });
          return {
            shortCode,
            shortUrl,
            qrDataURL: `data:image/png;base64,${qrBuffer.toString('base64')}`,
          };
        } catch {
          return { shortCode, shortUrl: `${generateShortUrl(shortCode)}?qr=1`, qrDataURL: null };
        }
      })
    );

    res.json({ success: true, data: { qrCodes: results } });
  } catch (error) {
    logger.error('Bulk QR data error:', error);
    next(error);
  }
}
