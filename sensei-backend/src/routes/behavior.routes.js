import { Router } from 'express';
import { verifyAccessToken } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import BehaviorFingerprint from '../models/BehaviorFingerprint.js';
import User from '../models/User.js';
import Attendance from '../models/Attendance.js';
import Marks from '../models/Marks.js';
import HelpTicket from '../models/HelpTicket.js';
import { runBehaviorFingerprint } from '../agents/behaviorFingerprint.agent.js';

const router = Router();

router.post('/analyze/:classId', verifyAccessToken, requireRole('teacher'), async (req, res) => {
  try {
    const { classId } = req.params;
    

    const students = await User.find({ role: 'student', classId });
    
    const studentData = [];
    for (const student of students) {
        const attendance = await Attendance.findOne({ studentId: student._id });
        const marks = await Marks.findOne({ studentId: student._id });
        const helpTickets = await HelpTicket.countDocuments({ studentId: student._id });
        
        studentData.push({
            studentId: student._id,
            name: student.name,
            signals: {
                attendancePattern: attendance?.percentage || 0,
                quizVelocity: marks?.percentage || 0,
                wellnessScore: 70,
                helpFrequency: helpTickets * 10,
                studyDuration: 60
            }
        });
    }

    const result = await runBehaviorFingerprint({
      classId,
      students: studentData,
    });

    const fingerprint = await BehaviorFingerprint.create({
      teacherId: req.user.userId,
      classId,
      students: studentData,
      correlations: result.correlations || [],
      alerts: result.alerts || []
    });

    res.json({ fingerprint });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/alerts', verifyAccessToken, requireRole('teacher'), async (req, res) => {
  try {
    const latest = await BehaviorFingerprint.findOne({ teacherId: req.user.userId }).sort({ createdAt: -1 });
    res.json({ alerts: latest?.alerts || [], correlations: latest?.correlations || [] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
