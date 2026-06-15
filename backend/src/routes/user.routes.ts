import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { passwordChangeValidation, updateProfileValidation, preferencesValidation } from '../middleware/validation.middleware';
import {
  getProfile,
  updateProfile,
  changePassword,
  changeUsername,
  updatePreferences,
  getApiKey,
  regenerateApiKey,
  getSessions,
  deleteSession,
  deleteAccount,
} from '../controllers/user.controller';

const router = Router();

router.get('/profile', authenticate, getProfile);
router.put('/profile', authenticate, updateProfileValidation, updateProfile);
router.put('/security/password', authenticate, passwordChangeValidation, changePassword);
router.put('/security/username', authenticate, changeUsername);
router.put('/preferences', authenticate, preferencesValidation, updatePreferences);
router.get('/api-key', authenticate, getApiKey);
router.post('/api-key/regenerate', authenticate, regenerateApiKey);
router.get('/sessions', authenticate, getSessions);
router.delete('/sessions/:id', authenticate, deleteSession);
router.delete('/account', authenticate, deleteAccount);

export default router;
