import { Router } from 'express';
import { verifyAccessToken } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import * as ctrl from '../controllers/admin.controller.js';
import multer from 'multer';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });
const router = Router();

router.use(verifyAccessToken, requireRole('admin'));

router.get('/dashboard', ctrl.getDashboard);
router.get('/analytics/overview', ctrl.getAnalyticsOverview);
router.get('/analytics/department/:dept', ctrl.getDepartmentAnalytics);
router.get('/analytics/trends', ctrl.getTrends);
router.get('/users/export', ctrl.exportUsers);
router.get('/users/:id', ctrl.getUser);
router.get('/users', ctrl.getUsers);
router.post('/users', ctrl.createUser);
router.patch('/users/:id', ctrl.updateUser);
router.delete('/users/:id', ctrl.deleteUser);
router.post('/bulk/import', upload.single('csv'), ctrl.bulkImport);
router.get('/users/export', ctrl.exportUsers);
router.get('/cohorts', ctrl.getCohorts);
router.get('/curriculum', ctrl.getCurriculum);
router.post('/curriculum/analyse', ctrl.analyseCurriculum);
router.get('/interventions', ctrl.getAllInterventions);
router.get('/faculty-effectiveness', ctrl.getFacultyEffectiveness);
router.get('/risk/top-atrisk', ctrl.getTopAtRisk);
router.post('/ask', ctrl.askSensei);
router.get('/reports/executive', ctrl.getExecutiveReport);
router.get('/system', ctrl.getSystemStatus);
router.get('/logs', ctrl.getLogs);

export default router;
