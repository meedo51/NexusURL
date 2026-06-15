import { Router } from 'express';
import { generateQRCode } from '../controllers/qr.controller';

const router = Router();

router.get('/:shortCode', generateQRCode);

export default router;
