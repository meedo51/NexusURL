import { Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { v4 as uuidv4 } from 'uuid';
import { config } from '../config';
import { AuthenticatedRequest, AuthPayload } from '../types';
import db from '../services/database.service';
import redisService from '../services/redis.service';
import logger from '../utils/logger';
import { generateApiKey, generateBackupCodes } from '../utils/helpers';
import { getWelcomeEmailHtml, getPasswordResetEmailHtml, get2faBackupCodesHtml, getAccountDeletedHtml, getTextContent } from '../utils/emailTemplates';

function generateTokens(payload: AuthPayload) {
  const token = jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn as any });
  const refreshToken = jwt.sign(payload, config.jwt.refreshSecret, { expiresIn: '30d' });
  return { token, refreshToken };
}

export async function signup(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { username, email, password } = req.body;

    const existingEmail = await db.findUserByEmail(email);
    if (existingEmail) {
      res.status(409).json({ success: false, error: { code: 'EMAIL_EXISTS', message: 'Email already registered' } });
      return;
    }

    const existingUsername = await db.findUserByUsername(username);
    if (existingUsername) {
      res.status(409).json({ success: false, error: { code: 'USERNAME_EXISTS', message: 'Username already taken' } });
      return;
    }

    const passwordHash = await bcrypt.hash(password, config.bcryptSaltRounds);
    const emailVerificationToken = uuidv4();

    const user = await db.createUser({
      username,
      email,
      passwordHash,
      emailVerificationToken,
    });

    const payload: AuthPayload = { userId: user.id, username: user.username, email: user.email };
    const { token, refreshToken } = generateTokens(payload);

    await db.createSession({
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });

    await db.addToEmailQueue({
      toEmail: email,
      subject: 'Welcome to NexusURL!',
      htmlContent: getWelcomeEmailHtml(username),
      textContent: getTextContent(getWelcomeEmailHtml(username)),
      priority: 2,
    });

    res.status(201).json({
      success: true,
      data: {
        token,
        refreshToken,
        user: { id: user.id, username: user.username, email: user.email, createdAt: user.createdAt },
      },
    });
  } catch (error) {
    logger.error('Signup error:', error);
    next(error);
  }
}

export async function signin(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body;
    const ip = req.ip || req.socket.remoteAddress || '';

    const user = await db.findUserByEmail(email) || await db.findUserByUsername(email);
    if (!user || !user.isActive) {
      res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email/username or password' } });
      return;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      res.status(401).json({ success: false, error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email/username or password' } });
      return;
    }

    await db.updateUser(user.id, { lastLoginAt: new Date(), lastLoginIp: ip });

    const payload: AuthPayload = { userId: user.id, username: user.username, email: user.email };
    const { token, refreshToken } = generateTokens(payload);

    const sessionExpiry = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await db.createSession({
      userId: user.id,
      token: refreshToken,
      ipAddress: ip,
      userAgent: req.headers['user-agent'] || '',
      expiresAt: sessionExpiry,
    });

    res.json({
      success: true,
      data: {
        token,
        refreshToken,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          bio: user.bio,
          avatarUrl: user.avatarUrl,
          twoFactorEnabled: user.twoFactorEnabled,
          notificationEnabled: user.notificationEnabled,
          shortCodeLength: user.shortCodeLength,
          includeUppercase: user.includeUppercase,
          includeLowercase: user.includeLowercase,
          includeNumbers: user.includeNumbers,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
        },
      },
    });
  } catch (error) {
    logger.error('Signin error:', error);
    next(error);
  }
}

export async function logout(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.decode(token) as any;
      if (decoded?.exp) {
        const ttl = decoded.exp - Math.floor(Date.now() / 1000);
        if (ttl > 0) {
          await redisService.blacklistToken(token, ttl);
        }
      }
    }

    if (req.user) {
      await db.deleteUserSessions(req.user.userId);
    }

    res.json({ success: true, data: { message: 'Logged out successfully' } });
  } catch (error) {
    logger.error('Logout error:', error);
    next(error);
  }
}

export async function refresh(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400).json({ success: false, error: { code: 'INVALID_REQUEST', message: 'Refresh token required' } });
      return;
    }

    const decoded = jwt.verify(refreshToken, config.jwt.refreshSecret) as AuthPayload;
    const user = await db.findUserById(decoded.userId);
    if (!user || !user.isActive) {
      res.status(401).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' } });
      return;
    }

    const payload: AuthPayload = { userId: user.id, username: user.username, email: user.email };
    const tokens = generateTokens(payload);

    res.json({ success: true, data: { token: tokens.token, refreshToken: tokens.refreshToken } });
  } catch (error) {
    logger.error('Refresh error:', error);
    res.status(401).json({ success: false, error: { code: 'INVALID_REFRESH_TOKEN', message: 'Invalid refresh token' } });
  }
}

export async function setup2FA(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) { res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }); return; }

    const secret = speakeasy.generateSecret({
      name: `NexusURL (${req.user.email})`,
      issuer: 'NexusURL',
    });

    await db.updateUser(req.user.userId, { twoFactorSecret: secret.base32 });

    const qrDataUrl = await QRCode.toDataURL(secret.otpauth_url || '');

    const backupCodes = generateBackupCodes();
    const hashedCodes = await Promise.all(backupCodes.map(c => bcrypt.hash(c, 8)));
    await db.updateUser(req.user.userId, { twoFactorBackupCodes: hashedCodes });

    if (config.features.enableEmailNotifications) {
      await db.addToEmailQueue({
        toEmail: req.user.email,
        subject: 'Your 2FA Backup Codes',
        htmlContent: get2faBackupCodesHtml(req.user.username, backupCodes),
        textContent: getTextContent(get2faBackupCodesHtml(req.user.username, backupCodes)),
      });
    }

    res.json({
      success: true,
      data: {
        secret: secret.base32,
        qrCode: qrDataUrl,
        backupCodes,
      },
    });
  } catch (error) {
    logger.error('2FA setup error:', error);
    next(error);
  }
}

export async function verify2FA(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) { res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }); return; }

    const { token } = req.body;
    const user = await db.findUserById(req.user.userId);
    if (!user?.twoFactorSecret) {
      res.status(400).json({ success: false, error: { code: '2FA_NOT_SETUP', message: '2FA is not set up' } });
      return;
    }

    const isValid = speakeasy.totp.verify({
      secret: user.twoFactorSecret,
      encoding: 'base32',
      token,
      window: 1,
    });

    if (!isValid) {
      res.status(400).json({ success: false, error: { code: 'INVALID_2FA', message: 'Invalid 2FA code' } });
      return;
    }

    await db.updateUser(req.user.userId, { twoFactorEnabled: true });
    res.json({ success: true, data: { message: '2FA enabled successfully' } });
  } catch (error) {
    logger.error('2FA verify error:', error);
    next(error);
  }
}

export async function disable2FA(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) { res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }); return; }

    const { password } = req.body;
    const user = await db.findUserById(req.user.userId);
    if (!user) { res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' } }); return; }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      res.status(400).json({ success: false, error: { code: 'INVALID_PASSWORD', message: 'Invalid password' } });
      return;
    }

    await db.updateUser(req.user.userId, { twoFactorEnabled: false, twoFactorSecret: null, twoFactorBackupCodes: [] });
    res.json({ success: true, data: { message: '2FA disabled successfully' } });
  } catch (error) {
    logger.error('2FA disable error:', error);
    next(error);
  }
}

export async function forgotPassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email } = req.body;
    const user = await db.findUserByEmail(email);
    if (!user) {
      res.json({ success: true, data: { message: 'If the email exists, a reset link has been sent' } });
      return;
    }

    const resetToken = uuidv4();
    const resetTokenHash = await bcrypt.hash(resetToken, 10);
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000);

    await redisService.set(`reset:${resetTokenHash}`, user.id, 3600);

    const resetLink = `${config.urls.frontend}/reset-password?token=${resetToken}&email=${encodeURIComponent(email)}`;

    await db.addToEmailQueue({
      toEmail: email,
      subject: 'Password Reset - NexusURL',
      htmlContent: getPasswordResetEmailHtml(user.username, resetLink),
      textContent: getTextContent(getPasswordResetEmailHtml(user.username, resetLink)),
      priority: 3,
    });

    res.json({ success: true, data: { message: 'If the email exists, a reset link has been sent' } });
  } catch (error) {
    logger.error('Forgot password error:', error);
    next(error);
  }
}

export async function resetPassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    const { token, password } = req.body;

    const keys = await redisService.getClient().keys('reset:*');
    let userId: string | null = null;

    for (const key of keys) {
      const val = await redisService.get(key);
      if (val) {
        userId = val;
        await redisService.del(key);
        break;
      }
    }

    if (!userId) {
      res.status(400).json({ success: false, error: { code: 'INVALID_TOKEN', message: 'Invalid or expired reset token' } });
      return;
    }

    const passwordHash = await bcrypt.hash(password, config.bcryptSaltRounds);
    await db.updateUser(userId, { passwordHash });
    await db.deleteUserSessions(userId);

    res.json({ success: true, data: { message: 'Password reset successfully' } });
  } catch (error) {
    logger.error('Reset password error:', error);
    next(error);
  }
}
