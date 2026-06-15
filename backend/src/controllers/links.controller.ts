import { Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { config } from '../config';
import { AuthenticatedRequest, CreateLinkInput } from '../types';
import db from '../services/database.service';
import redisService from '../services/redis.service';
import logger from '../utils/logger';
import { generateShortCode, generateShortUrl, getPaginationParams, parseUserAgent } from '../utils/helpers';

export async function createLink(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { longUrl, customAlias, expirationDate, password, oneTimeAccess }: CreateLinkInput = req.body;
    const userId = req.user?.userId;

    let shortCode: string;
    let isCustom = false;

    if (customAlias) {
      const existing = await db.findLinkByShortCode(customAlias);
      if (existing) {
        res.status(409).json({ success: false, error: { code: 'CUSTOM_ALIAS_TAKEN', message: `The custom alias '${customAlias}' is already taken` } });
        return;
      }
      shortCode = customAlias;
      isCustom = true;
    } else {
      const user = userId ? await db.findUserById(userId) : null;
      const length = user?.shortCodeLength || 6;
      const options = {
        includeUppercase: user?.includeUppercase ?? true,
        includeLowercase: user?.includeLowercase ?? true,
        includeNumbers: user?.includeNumbers ?? true,
      };

      let attempts = 0;
      do {
        shortCode = generateShortCode(length, options);
        const existing = await db.findLinkByShortCode(shortCode);
        if (!existing) break;
        attempts++;
      } while (attempts < 5);

      if (attempts >= 5) {
        shortCode = generateShortCode(length, options) + Date.now().toString(36).substring(0, 4);
      }
    }

    let passwordHash: string | undefined;
    if (password) {
      passwordHash = await bcrypt.hash(password, config.bcryptSaltRounds);
    }

    const link = await db.createLink({
      userId,
      longUrl,
      shortCode,
      customAlias: customAlias || undefined,
      isCustom,
      passwordHash,
      expirationDate: expirationDate ? new Date(expirationDate) : undefined,
      oneTimeAccess: oneTimeAccess || false,
    });

    const shortUrl = generateShortUrl(shortCode);

    res.status(201).json({
      success: true,
      data: {
        id: link.id,
        shortUrl,
        shortCode: link.shortCode,
        longUrl: link.longUrl,
        isCustom: link.isCustom,
        hasPassword: !!link.passwordHash,
        expirationDate: link.expirationDate,
        oneTimeAccess: link.oneTimeAccess,
        qrCodeUrl: `${config.urls.backend}/api/qr/${shortCode}`,
        createdAt: link.createdAt,
      },
    });
  } catch (error) {
    logger.error('Create link error:', error);
    next(error);
  }
}

export async function getUserLinks(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) { res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }); return; }

    const params = getPaginationParams(req.query);
    const orderBy: any = {};
    orderBy[params.sortBy === 'clicks' ? 'accessCount' : 'createdAt'] = params.order;

    const { links, total } = await db.getUserLinks(req.user.userId, {
      skip: params.skip,
      take: params.limit,
      orderBy,
      search: params.search,
      status: req.query.status as string,
    });

    const data = links.map(link => ({
      id: link.id,
      shortUrl: generateShortUrl(link.shortCode),
      shortCode: link.shortCode,
      longUrl: link.longUrl,
      clicks: link.accessCount,
      uniqueVisitors: link.uniqueVisitors,
      hasPassword: !!link.passwordHash,
      expirationDate: link.expirationDate,
      oneTimeAccess: link.oneTimeAccess,
      isActive: link.isActive,
      isCustom: link.isCustom,
      createdAt: link.createdAt,
      updatedAt: link.updatedAt,
    }));

    res.json({
      success: true,
      data: {
        links: data,
        pagination: {
          page: params.page,
          limit: params.limit,
          total,
          totalPages: Math.ceil(total / params.limit),
        },
      },
    });
  } catch (error) {
    logger.error('Get user links error:', error);
    next(error);
  }
}

export async function deleteLink(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) { res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }); return; }

    const link = await db.findUserLinkById(req.params.id, req.user.userId);
    if (!link) {
      res.status(404).json({ success: false, error: { code: 'LINK_NOT_FOUND', message: 'Link not found' } });
      return;
    }

    await db.softDeleteLink(link.id);
    await redisService.del(`link:${link.shortCode}`);

    res.json({ success: true, data: { message: 'Link deleted successfully' } });
  } catch (error) {
    logger.error('Delete link error:', error);
    next(error);
  }
}

export async function updateLinkPassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) { res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }); return; }

    const link = await db.findUserLinkById(req.params.id, req.user.userId);
    if (!link) {
      res.status(404).json({ success: false, error: { code: 'LINK_NOT_FOUND', message: 'Link not found' } });
      return;
    }

    const { password } = req.body;
    const passwordHash = password ? await bcrypt.hash(password, config.bcryptSaltRounds) : null;
    await db.updateLink(link.id, { passwordHash });
    await redisService.del(`link:${link.shortCode}`);

    res.json({ success: true, data: { message: password ? 'Password set' : 'Password removed' } });
  } catch (error) {
    logger.error('Update link password error:', error);
    next(error);
  }
}

export async function updateLinkExpiration(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) { res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }); return; }

    const link = await db.findUserLinkById(req.params.id, req.user.userId);
    if (!link) {
      res.status(404).json({ success: false, error: { code: 'LINK_NOT_FOUND', message: 'Link not found' } });
      return;
    }

    const { expirationDate } = req.body;
    await db.updateLink(link.id, { expirationDate: expirationDate ? new Date(expirationDate) : null });
    await redisService.del(`link:${link.shortCode}`);

    res.json({ success: true, data: { message: expirationDate ? 'Expiration date set' : 'Expiration date removed' } });
  } catch (error) {
    logger.error('Update link expiration error:', error);
    next(error);
  }
}

export async function getLinkStats(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) { res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }); return; }

    const link = await db.findUserLinkById(req.params.id, req.user.userId);
    if (!link) {
      res.status(404).json({ success: false, error: { code: 'LINK_NOT_FOUND', message: 'Link not found' } });
      return;
    }

    const stats = await db.getLinkStats(link.id);
    res.json({ success: true, data: stats });
  } catch (error) {
    logger.error('Get link stats error:', error);
    next(error);
  }
}

export async function redirectHandler(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { shortCode } = req.params;

    const cached = await redisService.getJSON<{ longUrl: string; passwordHash: string | null; expirationDate: string | null; oneTimeAccess: boolean; isActive: boolean }>(`link:${shortCode}`);
    let link: any;

    if (cached) {
      link = cached;
    } else {
      link = await db.findLinkByShortCode(shortCode);
      if (link) {
        await redisService.setJSON(`link:${shortCode}`, {
          id: link.id,
          longUrl: link.longUrl,
          passwordHash: link.passwordHash,
          expirationDate: link.expirationDate,
          oneTimeAccess: link.oneTimeAccess,
          isActive: link.isActive,
          userId: link.userId,
        }, 300);
      }
    }

    if (!link || !link.isActive) {
      res.status(404).render('error', { message: 'Link not found' });
      return;
    }

    if (link.expirationDate && new Date(link.expirationDate) < new Date()) {
      res.status(410).render('error', { message: 'Link has expired' });
      return;
    }

    if (link.passwordHash) {
      const password = req.query.pwd as string;
      if (!password) {
        res.status(401).json({ success: false, error: { code: 'PASSWORD_REQUIRED', message: 'This link is password protected', shortCode } });
        return;
      }
      const isValid = await bcrypt.compare(password, link.passwordHash);
      if (!isValid) {
        res.status(401).json({ success: false, error: { code: 'INVALID_PASSWORD', message: 'Invalid password' } });
        return;
      }
    }

    if (link.oneTimeAccess) {
      const tokenHash = req.query.token as string;
      if (!tokenHash) {
        res.status(401).json({ success: false, error: { code: 'TOKEN_REQUIRED', message: 'One-time access token required' } });
        return;
      }
      const token = await db.findOneTimeToken(tokenHash);
      if (!token || token.isUsed || token.expiresAt < new Date()) {
        res.status(401).json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' } });
        return;
      }
      await db.markTokenAsUsed(token.id);
      await db.updateLink(link.id || link.id, { isActive: false });
    }

    const ip = req.ip || req.socket.remoteAddress || '0.0.0.0';
    const ua = req.headers['user-agent'] || '';
    const referer = req.headers['referer'] || '';
    const parsed = parseUserAgent(ua);

    const countryCode = '';
    const city = '';

    try {
      await db.createLinkLog({
        linkId: link.id || link._id,
        ipAddress: ip,
        userAgent: ua,
        referer: referer as string,
        countryCode,
        city,
        deviceType: parsed.device,
        browserName: parsed.browser,
        osName: parsed.os,
      });

      await db.incrementLinkAccess(link.id || link._id, false);

      const user = link.user;
      if (user && user.notificationEnabled && config.features.enableEmailNotifications) {
        // Queue notification asynchronously
      }
    } catch (logError) {
      logger.error('Log link access error:', logError);
    }

    res.redirect(302, link.longUrl);
  } catch (error) {
    logger.error('Redirect error:', error);
    next(error);
  }
}

export async function checkAlias(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { alias } = req.params;
    if (!alias) {
      res.status(400).json({ success: false, error: { code: 'INVALID_REQUEST', message: 'Alias parameter required' } });
      return;
    }

    const existing = await db.findLinkByShortCode(alias);
    res.json({ success: true, data: { available: !existing } });
  } catch (error) {
    logger.error('Check alias error:', error);
    next(error);
  }
}
