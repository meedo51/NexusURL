import { Router } from 'express';
import { generateQRCode, getQRData, trackQRScan, bulkQRData } from '../controllers/qr.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.get('/:shortCode', generateQRCode);
router.get('/:shortCode/data', getQRData);
router.post('/:shortCode/track', trackQRScan);
router.post('/bulk', authenticate, bulkQRData);

export default router;
