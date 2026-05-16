import { Router } from 'express';
import { verifyAccessToken } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import DropoutPrediction from '../models/DropoutPrediction.js';
import User from '../models/User.js';
import HelpTicket from '../models/HelpTicket.js';
import { runDropoutPrediction } from '../agents/dropoutPrediction.agent.js';

const router = Router();

router.post('/predict', verifyAccessToken, requireRole('admin'), async (req, res) => {
  try {

    const students = await User.find({ role: 'student' }).limit(50);
    
    const studentData = [];
    for (const student of students) {
        const helpTickets = await HelpTicket.find({ studentId: student._id });
        
        studentData.push({
            studentId: student._id,
            name: student.name,
            helpTickets: helpTickets.map(t => ({ message: t.message })),
            wellnessNotes: "Studying hard but feels stressed about exams.",
            attendanceVelocity: 85,
            submissionDelays: 2,
            cgpa: 7.5,
            helpFrequency: helpTickets.length
        });
    }

    const result = await runDropoutPrediction({
      students: studentData,
    });


    const savedPredictions = [];
    for (const pred of result.predictions) {
        const saved = await DropoutPrediction.create({
            studentId: pred.studentId,
            riskScore: pred.riskScore,
            confidence: pred.confidence,
            riskTier: pred.riskTier,
            riskDrivers: pred.riskDrivers,
            intervention: pred.intervention
        });
        savedPredictions.push(saved);
    }

    res.json({ predictions: savedPredictions });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/queue', verifyAccessToken, requireRole('admin'), async (req, res) => {
  try {
    const queue = await DropoutPrediction.find({ riskTier: { $in: ['high', 'critical'] } })
        .populate('studentId', 'name studentId department')
        .sort({ riskScore: -1 });
    res.json({ queue });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/intervene/:id', verifyAccessToken, requireRole('admin'), async (req, res) => {
  try {
    const prediction = await DropoutPrediction.findById(req.params.id);
    if (!prediction) return res.status(404).json({ error: 'Prediction not found' });
    
    prediction.intervention.sent = true;
    prediction.intervention.sentAt = new Date();
    prediction.intervention.sentBy = req.user.userId;
    await prediction.save();
    
    res.json({ message: 'Intervention sent successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
