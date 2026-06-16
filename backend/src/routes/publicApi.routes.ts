import { Router } from 'express';
import { publicApiLimiter } from '../middleware/rateLimiter.middleware';
import { publicApiValidation } from '../middleware/validation.middleware';
import { publicCreateLink, checkFreeLimit } from '../controllers/publicApi.controller';

const router = Router();

router.get('/free-limit', publicApiLimiter, checkFreeLimit);
router.get('/create', publicApiLimiter, publicApiValidation, publicCreateLink);

export default router;
