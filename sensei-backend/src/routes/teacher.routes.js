import { Router } from 'express';
import { verifyAccessToken } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import * as ctrl from '../controllers/teacher.controller.js';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const router = Router();

router.use(verifyAccessToken, requireRole('teacher', 'faculty', 'admin'));

router.get('/dashboard', ctrl.getDashboard);
router.get('/classes', ctrl.getClasses);
router.post('/classes', ctrl.createClass);
router.get('/classes/:classId', ctrl.getClassDetail);
router.get('/students', ctrl.getStudents);
router.get('/students/:studentId', ctrl.getStudentDetail);
router.post('/upload', upload.single('csv'), ctrl.uploadCSV);
router.get('/upload/:uploadId/status', ctrl.getUploadStatus);
router.get('/interventions', ctrl.getInterventions);
router.post('/interventions', ctrl.createIntervention);
router.patch('/interventions/:id/outcome', ctrl.updateOutcome);
router.get('/polls', ctrl.getPolls);
router.post('/polls', ctrl.createPoll);
router.get('/polls/:pollId/results', ctrl.getPollResults);
router.patch('/polls/:pollId/close', ctrl.closePoll);
router.get('/alerts/draft', ctrl.draftAlert);
router.post('/alerts/send', ctrl.sendAlert);
router.get('/effectiveness', ctrl.getEffectiveness);
router.post('/content-ai/generate', ctrl.generateContent);
router.put('/profile', ctrl.updateProfile);

export default router;
