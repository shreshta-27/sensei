import { Router } from 'express';
import { verifyAccessToken } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import ResourcePlan from '../models/ResourcePlan.js';
import Class from '../models/Class.js';
import Teacher from '../models/Teacher.js';
import User from '../models/User.js';
import { runResourceOptimizer } from '../agents/resourceOptimizer.agent.js';

const router = Router();

router.post('/optimize', verifyAccessToken, requireRole('admin'), async (req, res) => {
  try {
    const classes = await Class.find();
    const teachers = await User.find({ role: 'teacher' });
    
    const result = await runResourceOptimizer({
      classes: classes.map(c => ({ name: c.name, studentCount: c.studentIds.length })),
      teachers: teachers.map(t => ({ name: t.name, subjects: [] })),
    });

    const plan = await ResourcePlan.create({
      adminId: req.user.userId,
      demandForecast: result.demandForecast,
      workloadAnalysis: result.workloadAnalysis,
      budgetForecast: result.budgetForecast,
      heatmapData: result.heatmapData,
      summary: result.summary
    });

    res.json({ plan });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/heatmap', verifyAccessToken, requireRole('admin'), async (req, res) => {
  try {
    const latest = await ResourcePlan.findOne({ adminId: req.user.userId }).sort({ createdAt: -1 });
    res.json({ heatmap: latest?.heatmapData || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/recommendations', verifyAccessToken, requireRole('admin'), async (req, res) => {
  try {
    const latest = await ResourcePlan.findOne({ adminId: req.user.userId }).sort({ createdAt: -1 });
    res.json({ 
        recommendations: latest?.budgetForecast?.recommendations || [], 
        savings: latest?.budgetForecast?.totalPotentialSavings || 0,
        alerts: latest?.workloadAnalysis?.alerts || []
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
