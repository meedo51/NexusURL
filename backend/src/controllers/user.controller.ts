import { Response, NextFunction } from 'express';
import bcrypt from 'bcrypt';
import { config } from '../config';
import { AuthenticatedRequest } from '../types';
import db from '../services/database.service';
import redisService from '../services/redis.service';
import logger from '../utils/logger';
import { generateApiKey } from '../utils/helpers';
import { getAccountDeletedHtml, getTextContent } from '../utils/emailTemplates';

export async function getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) { res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }); return; }

    const user = await db.findUserById(req.user.userId);
    if (!user) {
      res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' } });
      return;
    }

    res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        emailVerified: user.emailVerified,
        twoFactorEnabled: user.twoFactorEnabled,
        notificationEnabled: user.notificationEnabled,
        shortCodeLength: user.shortCodeLength,
        includeUppercase: user.includeUppercase,
        includeLowercase: user.includeLowercase,
        includeNumbers: user.includeNumbers,
        apiKey: user.apiKey,
        lastLoginAt: user.lastLoginAt,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    logger.error('Get profile error:', error);
    next(error);
  }
}

export async function updateProfile(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) { res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }); return; }

    const { username, bio, email } = req.body;
    const updateData: any = {};

    if (username !== undefined) {
      const existing = await db.findUserByUsername(username);
      if (existing && existing.id !== req.user.userId) {
        res.status(409).json({ success: false, error: { code: 'USERNAME_EXISTS', message: 'Username already taken' } });
        return;
      }
      updateData.username = username;
    }

    if (bio !== undefined) updateData.bio = bio;

    if (email !== undefined) {
      const existing = await db.findUserByEmail(email);
      if (existing && existing.id !== req.user.userId) {
        res.status(409).json({ success: false, error: { code: 'EMAIL_EXISTS', message: 'Email already registered' } });
        return;
      }
      updateData.email = email;
      updateData.emailVerified = false;
    }

    const user = await db.updateUser(req.user.userId, updateData);
    res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        avatarUrl: user.avatarUrl,
        emailVerified: user.emailVerified,
      },
    });
  } catch (error) {
    logger.error('Update profile error:', error);
    next(error);
  }
}

export async function changePassword(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) { res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }); return; }

    const { currentPassword, newPassword } = req.body;
    const user = await db.findUserById(req.user.userId);
    if (!user) { res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' } }); return; }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      res.status(400).json({ success: false, error: { code: 'INVALID_PASSWORD', message: 'Current password is incorrect' } });
      return;
    }

    const passwordHash = await bcrypt.hash(newPassword, config.bcryptSaltRounds);
    await db.updateUser(req.user.userId, { passwordHash });
    await db.deleteUserSessions(req.user.userId);

    res.json({ success: true, data: { message: 'Password changed successfully' } });
  } catch (error) {
    logger.error('Change password error:', error);
    next(error);
  }
}

export async function changeUsername(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) { res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }); return; }

    const { username } = req.body;
    const existing = await db.findUserByUsername(username);
    if (existing && existing.id !== req.user.userId) {
      res.status(409).json({ success: false, error: { code: 'USERNAME_EXISTS', message: 'Username already taken' } });
      return;
    }

    await db.updateUser(req.user.userId, { username });
    res.json({ success: true, data: { message: 'Username updated successfully' } });
  } catch (error) {
    logger.error('Change username error:', error);
    next(error);
  }
}

export async function updatePreferences(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) { res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }); return; }

    const prefs = req.body;
    await db.updateUser(req.user.userId, prefs);

    res.json({ success: true, data: { message: 'Preferences updated' } });
  } catch (error) {
    logger.error('Update preferences error:', error);
    next(error);
  }
}

export async function getApiKey(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) { res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }); return; }

    const user = await db.findUserById(req.user.userId);
    res.json({ success: true, data: { apiKey: user?.apiKey || null } });
  } catch (error) {
    logger.error('Get API key error:', error);
    next(error);
  }
}

export async function regenerateApiKey(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) { res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }); return; }

    const apiKey = generateApiKey();
    await db.updateUser(req.user.userId, { apiKey });

    res.json({ success: true, data: { apiKey } });
  } catch (error) {
    logger.error('Regenerate API key error:', error);
    next(error);
  }
}

export async function getSessions(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) { res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }); return; }

    const sessions = await db.getUserSessions(req.user.userId);
    const data = sessions.map(s => ({
      id: s.id,
      ipAddress: s.ipAddress,
      userAgent: s.userAgent,
      createdAt: s.createdAt,
      expiresAt: s.expiresAt,
      isCurrent: false,
    }));

    res.json({ success: true, data: { sessions: data } });
  } catch (error) {
    logger.error('Get sessions error:', error);
    next(error);
  }
}

export async function deleteSession(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) { res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }); return; }

    await db.deleteSession(req.params.id);
    res.json({ success: true, data: { message: 'Session deleted' } });
  } catch (error) {
    logger.error('Delete session error:', error);
    next(error);
  }
}

export async function deleteAccount(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  try {
    if (!req.user) { res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } }); return; }

    const { password } = req.body;
    const user = await db.findUserById(req.user.userId);
    if (!user) { res.status(404).json({ success: false, error: { code: 'USER_NOT_FOUND', message: 'User not found' } }); return; }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
      res.status(400).json({ success: false, error: { code: 'INVALID_PASSWORD', message: 'Password is incorrect' } });
      return;
    }

    await db.softDeleteUser(req.user.userId);

    await db.addToEmailQueue({
      toEmail: user.email,
      subject: 'Account Deleted - NexusURL',
      htmlContent: getAccountDeletedHtml(user.username),
      textContent: getTextContent(getAccountDeletedHtml(user.username)),
    });

    res.json({ success: true, data: { message: 'Account deleted successfully' } });
  } catch (error) {
    logger.error('Delete account error:', error);
    next(error);
  }
}
