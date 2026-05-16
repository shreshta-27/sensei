import { Router } from 'express';
import { verifyAccessToken } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/role.middleware.js';
import Assignment from '../models/Assignment.js';
import { runGradingAgent } from '../agents/grading.agent.js';

const router = Router();

router.post('/create', verifyAccessToken, requireRole('teacher'), async (req, res) => {
  try {
    const { title, brief, subject, classId, dueDate } = req.body;
    const assignment = await Assignment.create({
      teacherId: req.user.userId,
      classId,
      title,
      brief,
      subject,
      dueDate,
      status: 'active'
    });
    res.status(201).json({ assignment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/submit', verifyAccessToken, requireRole('student'), async (req, res) => {
  try {
    const { content } = req.body;
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

    assignment.submissions.push({
      studentId: req.user.userId,
      content,
      status: 'pending'
    });
    await assignment.save();
    res.json({ message: 'Submission successful' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/:id/grade', verifyAccessToken, requireRole('teacher'), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });

    const result = await runGradingAgent({
      brief: assignment.brief,
      subject: assignment.subject,
      submissions: assignment.submissions.filter(s => s.status === 'pending'),
    });


    assignment.rubric = result.rubric;
    

    for (const resItem of result.results) {
        const subIndex = assignment.submissions.findIndex(s => s.studentId.toString() === resItem.studentId.toString());
        if (subIndex !== -1) {
            assignment.submissions[subIndex] = { ...assignment.submissions[subIndex], ...resItem };
        }
    }
    
    assignment.status = 'graded';
    await assignment.save();

    res.json({ message: 'Grading complete', rubric: result.rubric });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/list', verifyAccessToken, requireRole('teacher', 'student'), async (req, res) => {
  try {
    const filter = req.user.role === 'teacher' ? { teacherId: req.user.userId } : { 'submissions.studentId': req.user.userId };
    const assignments = await Assignment.find(filter).sort({ createdAt: -1 });
    res.json({ assignments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/:id/results', verifyAccessToken, requireRole('teacher', 'student'), async (req, res) => {
  try {
    const assignment = await Assignment.findById(req.params.id);
    if (!assignment) return res.status(404).json({ error: 'Assignment not found' });
    
    if (req.user.role === 'student') {
        const mySub = assignment.submissions.find(s => s.studentId.toString() === req.user.userId.toString());
        return res.json({ assignment: { title: assignment.title, brief: assignment.brief }, submission: mySub });
    }

    res.json({ assignment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
