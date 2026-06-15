import { Router } from 'express';
import { publicApiLimiter } from '../middleware/rateLimiter.middleware';
import { publicApiValidation } from '../middleware/validation.middleware';
import { publicCreateLink } from '../controllers/publicApi.controller';

const router = Router();

router.get('/create', publicApiLimiter, publicApiValidation, publicCreateLink);

export default router;
