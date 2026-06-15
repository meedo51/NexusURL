import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { authLimiter } from '../middleware/rateLimiter.middleware';
import {
  signupValidation,
  signinValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
} from '../middleware/validation.middleware';
import {
  signup,
  signin,
  logout,
  refresh,
  setup2FA,
  verify2FA,
  disable2FA,
  forgotPassword,
  resetPassword,
} from '../controllers/auth.controller';

const router = Router();

router.post('/signup', signupValidation, signup);
router.post('/signin', authLimiter, signinValidation, signin);
router.post('/logout', authenticate, logout);
router.post('/refresh', refresh);
router.post('/2fa/setup', authenticate, setup2FA);
router.post('/2fa/verify', authenticate, verify2FA);
router.post('/2fa/disable', authenticate, disable2FA);
router.post('/forgot-password', forgotPasswordValidation, forgotPassword);
router.post('/reset-password', resetPasswordValidation, resetPassword);

export default router;
