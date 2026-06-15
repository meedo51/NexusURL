import { Request, Response, NextFunction } from 'express';
import { validationResult, body, param, query } from 'express-validator';

export function handleValidationErrors(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Validation failed',
        details: errors.array().map(e => ({ field: (e as any).path, message: e.msg })),
      },
    });
    return;
  }
  next();
}

export const signupValidation = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .trim()
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain a number')
    .matches(/[^A-Za-z0-9]/).withMessage('Password must contain a special character'),
  body('confirmPassword')
    .custom((value, { req }) => value === req.body.password).withMessage('Passwords do not match'),
  handleValidationErrors,
];

export const signinValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email or username is required'),
  body('password')
    .notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

export const createLinkValidation = [
  body('longUrl')
    .trim()
    .notEmpty().withMessage('Long URL is required')
    .isURL({ protocols: ['http', 'https'], require_protocol: true }).withMessage('Valid URL with http/https protocol is required'),
  body('customAlias')
    .optional()
    .trim()
    .isLength({ max: 50 }).withMessage('Custom alias must be at most 50 characters')
    .matches(/^[A-Za-z0-9\-_]+$/).withMessage('Custom alias can only contain letters, numbers, hyphens, and underscores'),
  body('expirationDate')
    .optional()
    .isISO8601().withMessage('Expiration date must be a valid ISO date'),
  body('password')
    .optional()
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('oneTimeAccess')
    .optional()
    .isBoolean().withMessage('One-time access must be a boolean'),
  handleValidationErrors,
];

export const passwordChangeValidation = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain a number')
    .matches(/[^A-Za-z0-9]/).withMessage('Password must contain a special character'),
  handleValidationErrors,
];

export const forgotPasswordValidation = [
  body('email').trim().isEmail().withMessage('Valid email is required').normalizeEmail(),
  handleValidationErrors,
];

export const resetPasswordValidation = [
  body('token').notEmpty().withMessage('Reset token is required'),
  body('password')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/[A-Z]/).withMessage('Password must contain an uppercase letter')
    .matches(/[a-z]/).withMessage('Password must contain a lowercase letter')
    .matches(/[0-9]/).withMessage('Password must contain a number')
    .matches(/[^A-Za-z0-9]/).withMessage('Password must contain a special character'),
  handleValidationErrors,
];

export const publicApiValidation = [
  query('act').equals('ct').withMessage('Invalid action'),
  query('l').trim().notEmpty().withMessage('URL parameter (l) is required'),
  query('ca').optional().trim().isLength({ max: 50 }),
  query('pwd').optional(),
  query('exp').optional().isISO8601(),
  query('acp').optional().isIn(['0', '1']),
  handleValidationErrors,
];

export const updateProfileValidation = [
  body('username')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 }).withMessage('Username must be 3-50 characters')
    .matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),
  body('bio')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Bio must be at most 500 characters'),
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Valid email is required')
    .normalizeEmail(),
  handleValidationErrors,
];

export const preferencesValidation = [
  body('shortCodeLength')
    .optional()
    .isInt({ min: 4, max: 12 }).withMessage('Short code length must be between 4 and 12'),
  body('notificationEnabled').optional().isBoolean(),
  body('includeUppercase').optional().isBoolean(),
  body('includeLowercase').optional().isBoolean(),
  body('includeNumbers').optional().isBoolean(),
  handleValidationErrors,
];
