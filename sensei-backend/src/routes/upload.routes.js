import { Router } from 'express';
import { verifyAccessToken } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const router = Router();

router.use(verifyAccessToken, requireRole('teacher'));

router.post('/', upload.single('csv'), async (req, res) => {
  try {
    res.json({ message: 'Use /api/teacher/upload instead' });
  } catch (error) {
    res.status(500).json({ error: error.message, code: 500 });
  }
});

export default router;
