import { Router } from 'express';
import { redirectHandler } from '../controllers/links.controller';

const router = Router();

router.get('/:shortCode([A-Za-z0-9\\-_]{3,50})', redirectHandler);

export default router;
