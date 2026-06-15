import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { createLinkValidation } from '../middleware/validation.middleware';
import {
  createLink,
  getUserLinks,
  deleteLink,
  updateLinkPassword,
  updateLinkExpiration,
  getLinkStats,
  checkAlias,
} from '../controllers/links.controller';

const router = Router();

router.post('/', authenticate, createLinkValidation, createLink);
router.get('/', authenticate, getUserLinks);
router.get('/check-alias/:alias', checkAlias);
router.delete('/:id', authenticate, deleteLink);
router.put('/:id/password', authenticate, updateLinkPassword);
router.put('/:id/expiration', authenticate, updateLinkExpiration);
router.get('/:id/stats', authenticate, getLinkStats);

export default router;
