import { Router } from 'express';
import { verifyAccessToken } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import * as ctrl from '../controllers/helpTicket.controller.js';

const router = Router();
router.use(verifyAccessToken);


router.post('/', requireRole('student'), ctrl.createTicket);


router.get('/', ctrl.getTickets);


router.patch('/:id/respond', requireRole('teacher', 'faculty', 'admin'), ctrl.respondToTicket);
router.patch('/:id/resolve', requireRole('teacher', 'faculty', 'admin'), ctrl.resolveTicket);

export default router;
