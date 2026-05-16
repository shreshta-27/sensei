import { Router } from 'express';
import { verifyAccessToken } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import Doubt from '../models/Doubt.js';
import { runDoubtSolver } from '../agents/doubtSolver.agent.js';

const router = Router();

router.post('/solve', verifyAccessToken, requireRole('student'), async (req, res) => {
  try {
    const { inputType, transcription, ocrText, originalQuery, imageUrl } = req.body;
    if (!originalQuery && !transcription && !ocrText) {
      return res.status(400).json({ error: 'Provide a query, transcription, or OCR text' });
    }

    const result = await runDoubtSolver({
      inputType: inputType || 'text',
      transcription: transcription || '',
      ocrText: ocrText || '',
      originalQuery: originalQuery || transcription || ocrText || ''
    });

    const doubt = await Doubt.create({
      studentId: req.user.userId,
      inputType: inputType || 'text',
      transcription: transcription || '',
      ocrText: ocrText || '',
      imageUrl: imageUrl || '',
      originalQuery: originalQuery || transcription || ocrText,
      courseContext: result.courseContext || '',
      subject: result.subject || '',
      solution: result.solution || {}
    });

    res.json({ doubtId: doubt._id, solution: result.solution, subject: result.subject });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/history', verifyAccessToken, requireRole('student'), async (req, res) => {
  try {
    const doubts = await Doubt.find({ studentId: req.user.userId }).sort({ createdAt: -1 }).limit(20);
    res.json({ doubts });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
