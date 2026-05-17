import User from '../models/User.js';
import Class from '../models/Class.js';
import Student from '../models/Student.js';
import Teacher from '../models/Teacher.js';
import Marks from '../models/Marks.js';
import Attendance from '../models/Attendance.js';
import Insight from '../models/Insight.js';
import Intervention from '../models/Intervention.js';
import HelpTicket from '../models/HelpTicket.js';
import TeacherInsight from '../models/TeacherInsight.js';
import Poll from '../models/Poll.js';
import Assignment from '../models/Assignment.js';
import { getStudentPerformance } from '../services/performance.service.js';
import { callGemini } from '../services/gemini.service.js';
import { createNotification } from '../services/notification.service.js';
import getIO from '../config/socket.js';

export const getDashboard = async (req, res) => {
  try {
    const userId = req.user.userId;
    const [teacher, classes] = await Promise.all([
      Teacher.findOne({ userId }),
      Class.find({ teacherId: userId })
    ]);
    const classIds = classes.map((c) => c._id);

    const [
      totalStudents,
      atRiskInsights,
      criticalInsights,
      pendingTickets,
      recentInterventions,
      teacherInsight,
      activePollCount
    ] = await Promise.all([
      User.countDocuments({ role: 'student', _id: { $in: classes.flatMap((c) => c.studentIds || []) } }),
      Insight.find({ classId: { $in: classIds }, riskLevel: { $in: ['high', 'critical'] } }),
      Insight.find({ classId: { $in: classIds }, riskLevel: 'critical' }),
      HelpTicket.countDocuments({ 
        $or: [
          { assignedTo: userId },
          { status: 'pending' }
        ],
        status: { $in: ['pending', 'assigned', 'responded'] } 
      }),
      Intervention.find({ teacherId: userId }).sort({ createdAt: -1 }).limit(5),
      TeacherInsight.findOne({ teacherId: userId }),
      Poll.countDocuments({ teacherId: userId, isOpen: true })
    ]);

    res.json({
      name: req.user.name,
      department: req.user.department,
      subjects: teacher?.subjects || [],
      totalStudents,
      atRiskCount: atRiskInsights.length,
      criticalCount: criticalInsights.length,
      effectivenessScore: teacherInsight?.effectivenessScore || 0,
      classPassRate: teacherInsight?.classPassRate || 0,
      effectivenessSummary: teacherInsight?.summary || '',
      recentUploads: [],
      pendingHelpTickets: pendingTickets,
      recentInterventions,
      pollActivity: { active: activePollCount || 0, totalResponses: 0 },
      teachingRecommendations: teacherInsight?.recommendations || []
    });
  } catch (error) {
    res.status(500).json({ error: error.message, code: 500 });
  }
};

export const getClasses = async (req, res) => {
  try {
    const classes = await Class.find({ teacherId: req.user.userId });
    const result = await Promise.all(classes.map(async (cls) => {
      const riskCount = await Insight.countDocuments({ classId: cls._id, riskLevel: { $in: ['medium', 'high', 'critical'] } });
      return {
        _id: cls._id, classId: cls._id, name: cls.name, semester: cls.semester,
        department: cls.department, studentCount: cls.studentIds.length, studentIds: cls.studentIds,
        academicYear: cls.academicYear, subjects: cls.subjects,
        avgRisk: riskCount
      };
    }));
    res.json({ classes: result });
  } catch (error) {
    res.status(500).json({ error: error.message, code: 500 });
  }
};

export const createClass = async (req, res) => {
  try {
    const { name, semester, department, academicYear, subjects } = req.body;
    const newClass = await Class.create({
      name,
      semester: parseInt(semester, 10),
      department,
      academicYear,
      subjects: subjects || [],
      teacherId: req.user.userId,
      studentIds: []
    });
    res.status(201).json(newClass);
  } catch (error) {
    res.status(500).json({ error: error.message, code: 500 });
  }
};

export const getClassDetail = async (req, res) => {
  try {
    const cls = await Class.findById(req.params.classId);
    if (!cls) return res.status(404).json({ error: 'Class not found' });

    const students = await Promise.all(cls.studentIds.map(async (sid) => {
      const [user, insight, att] = await Promise.all([
        User.findById(sid),
        Insight.findOne({ studentId: sid }),
        Attendance.find({ studentId: sid })
      ]);
      const avgAtt = att.length > 0 ? att.reduce((s, a) => s + a.percentage, 0) / att.length : 0;
      if (user) {
        return {
          _id: user._id, name: user.name, email: user.email, studentId: user.studentId,
          cgpa: insight?.cgpa || 0, riskLevel: insight?.riskLevel || 'low',
          attendance: Math.round(avgAtt)
        };
      }
      return null;
    }));

    res.json({
      class: { name: cls.name, semester: cls.semester, department: cls.department },
      students: students.filter(s => s !== null),
      analytics: { avgCgpa: 0, passRate: 0, riskDistribution: { low: 0, medium: 0, high: 0, critical: 0 } }
    });
  } catch (error) {
    res.status(500).json({ error: error.message, code: 500 });
  }
};

export const getStudents = async (req, res) => {
  try {
    const classes = await Class.find({ teacherId: req.user.userId });
    const studentIds = classes.flatMap((c) => c.studentIds);
    const users = await User.find({ _id: { $in: studentIds }, role: 'student' }).lean();

    const students = await Promise.all(
      users.map(async (user) => {
        const perf = await getStudentPerformance(user._id);
        const insight = await Insight.findOne({ studentId: user._id }).lean();
        return {
          ...user,
          cgpa: perf.cgpa || 0,
          attendance: perf.avgAttendance || 0,
          riskLevel: insight?.riskLevel || perf.risk?.level || 'low',
          riskReason: insight?.riskReason || (perf.risk?.level !== 'low' ? 'Below expected grades or attendance.' : 'Consistent performance.'),
        };
      })
    );

    res.json({ students });
  } catch (error) {
    res.status(500).json({ error: error.message, code: 500 });
  }
};

export const addStudent = async (req, res) => {
  try {
    const { name, email, studentId, department, semester, cgpa, attendance } = req.body;
    if (!name || !email) {
      return res.status(400).json({ error: 'Name and Email are required' });
    }

    const firstClass = await Class.findOne({ teacherId: req.user.userId });
    if (!firstClass) {
      return res.status(400).json({ error: 'Please create a class before adding students.' });
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name,
        email,
        role: 'student',
        department: department || 'CSE',
        studentId: studentId || `ST${Date.now().toString().slice(-6)}`,
        password: 'Password123!',
      });
      await Student.create({ userId: user._id, semester: semester || 1 });
    }

    if (!firstClass.studentIds.includes(user._id)) {
      firstClass.studentIds.push(user._id);
      await firstClass.save();
    }

    if (cgpa !== undefined) {
      const percentage = (Number(cgpa) / 10) * 100;
      const endSem = Math.round((percentage / 100) * 150);
      await Marks.create({
        studentId: user._id,
        classId: firstClass._id,
        subject: 'General Performance',
        endSem,
        semester: Number(semester) || 1,
      });
    }

    if (attendance !== undefined) {
      await Attendance.create({
        studentId: user._id,
        classId: firstClass._id,
        subject: 'General Performance',
        attended: Number(attendance),
        total: 100,
        semester: Number(semester) || 1,
      });
    }

    res.status(201).json({ message: 'Student added successfully', student: user });
  } catch (error) {
    res.status(500).json({ error: error.message, code: 500 });
  }
};

export const getStudentDetail = async (req, res) => {
  try {
    const user = await User.findById(req.params.studentId);
    if (!user) return res.status(404).json({ error: 'Student not found' });
    const perf = await getStudentPerformance(user._id);
    const insight = await Insight.findOne({ studentId: user._id });
    const interventions = await Intervention.find({ studentId: user._id }).sort({ createdAt: -1 });
    res.json({ user: user.toJSON(), ...perf, insight, interventions });
  } catch (error) {
    res.status(500).json({ error: error.message, code: 500 });
  }
};

export const uploadCSV = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'CSV file required' });
    const { classId } = req.body;
    if (!classId) return res.status(400).json({ error: 'Class ID required' });

    const uploadId = Date.now().toString();

    res.json({ uploadId, message: 'Pipeline started' });

    const { runAgent } = await import('../services/langGraph.service.js');
    try {
      await runAgent('pipeline', {
        rawCsv: req.file.buffer,
        classId,
        teacherId: req.user.userId,
        socketId: req.user.userId.toString(),
        normalizedRows: [], studentGroups: {}, performanceMap: {},
        riskMap: {}, insights: [], interventions: [],
        teacherInsight: null, errors: [], stage: 'init'
      });
    } catch (e) {
      console.error('Pipeline agent error:', e.message);
    }
  } catch (error) {
    res.status(500).json({ error: error.message, code: 500 });
  }
};

export const getUploadStatus = async (req, res) => {
  res.json({ stage: 'complete', progress: 100, errors: [], studentCount: 0 });
};

export const getInterventions = async (req, res) => {
  try {
    const interventions = await Intervention.find({ teacherId: req.user.userId })
      .populate('studentId', 'name studentId')
      .sort({ createdAt: -1 });
    res.json({ interventions });
  } catch (error) {
    res.status(500).json({ error: error.message, code: 500 });
  }
};

export const createIntervention = async (req, res) => {
  try {
    const { studentId, message } = req.body;
    const intervention = await Intervention.create({
      studentId, teacherId: req.user.userId, message,
      triggerType: 'manual', status: 'sent'
    });

    await createNotification(studentId, {
      type: 'intervention', title: 'New Intervention',
      message: message.slice(0, 100), link: '/student/interventions'
    });

    try { getIO().of('/student').to(studentId.toString()).emit('dashboard:refresh'); } catch(e){}

    res.status(201).json({ interventionId: intervention._id, tags: [], urgency: 'medium', enhancedMessage: message });
  } catch (error) {
    res.status(500).json({ error: error.message, code: 500 });
  }
};

export const updateOutcome = async (req, res) => {
  try {
    const { outcome } = req.body;
    await Intervention.findByIdAndUpdate(req.params.id, { outcome });
    res.json({ message: 'Outcome updated' });
  } catch (error) {
    res.status(500).json({ error: error.message, code: 500 });
  }
};

export const updateStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const update = { status };
    if (status === 'resolved') {
      Object.assign(update, { resolvedAt: new Date() });
    }
    const intervention = await Intervention.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!intervention) return res.status(404).json({ error: 'Intervention not found' });
    res.json({ message: 'Status updated successfully', intervention });
  } catch (error) {
    res.status(500).json({ error: error.message, code: 500 });
  }
};


export const createPoll = async (req, res) => {
  try {
    let { classId, question, options } = req.body;
    

    if (classId && !/^[0-9a-fA-F]{24}$/.test(classId)) {
      return res.status(400).json({ error: 'Invalid Class ID format. Must be a 24 character hex string.' });
    }
    if (!classId) classId = undefined;

    const code = Math.random().toString(36).substring(2, 8).toUpperCase();
    const poll = await Poll.create({
      teacherId: req.user.userId, classId, question,
      options: options && options.length > 0 ? options : ['A', 'B', 'C', 'D'],
      code
    });

    try {
      const io = getIO();
      if (classId) {
        io.of('/student').to(`class:${classId}`).emit('poll:new', poll);
      } else {
        io.of('/student').emit('poll:new', poll);
      }
      io.of('/teacher').to(req.user.userId.toString()).emit('poll:new', poll);
    } catch (e) {
      console.error('Socket emit error (poll:new):', e.message);
    }

    res.status(201).json(poll);
  } catch (error) {
    console.error('Create Poll Error Details:', {
      message: error.message,
      stack: error.stack,
      body: req.body,
      userId: req.user?.userId
    });
    res.status(500).json({ error: error.message, code: 500 });
  }
};

export const getPolls = async (req, res) => {
  try {
    const polls = await Poll.find({ teacherId: req.user.userId }).sort({ createdAt: -1 });
    res.json(polls);
  } catch (error) {
    res.status(500).json({ error: error.message, code: 500 });
  }
};

export const getPollResults = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.pollId);
    if (!poll) return res.status(404).json({ error: 'Poll not found' });

    const responseCounts = {};
    for (const opt of poll.options) responseCounts[opt] = 0;
    for (const resp of poll.responses) {
      if (responseCounts[resp.option] !== undefined) responseCounts[resp.option]++;
    }

    const total = poll.responses.length;
    const responses = Object.entries(responseCounts).map(([option, count]) => ({
      option, count, percentage: total > 0 ? Math.round((count / total) * 100) : 0
    }));

    res.json({ question: poll.question, responses, liveCount: total });
  } catch (error) {
    res.status(500).json({ error: error.message, code: 500 });
  }
};

export const closePoll = async (req, res) => {
  try {
    const poll = await Poll.findByIdAndUpdate(req.params.pollId, { isOpen: false, closedAt: new Date() }, { new: true });
    
    if (poll) {
      try {
        const io = getIO();
        io.of('/student').to(`class:${poll.classId}`).emit('poll:closed', { pollId: poll._id });
        io.of('/teacher').to(poll.teacherId.toString()).emit('poll:closed', { pollId: poll._id });
      } catch (e) {
        console.error('Socket emit error (poll:closed):', e.message);
      }
    }

    res.json({ message: 'Poll closed' });
  } catch (error) {
    res.status(500).json({ error: error.message, code: 500 });
  }
};

export const draftAlert = async (req, res) => {
  try {
    const { studentId, subject } = req.query;
    const student = await User.findById(studentId);
    const insight = await Insight.findOne({ studentId });

    const prompt = `Draft a professional, empathetic email alert for student ${student?.name || 'Student'} who is at risk in ${subject || 'academics'}. Risk reason: ${insight?.riskReason || 'low performance'}. Include specific, actionable advice. Return JSON: { "subject": "...", "body": "..." }`;
    const result = await callGemini(prompt, { jsonMode: true });
    let parsed;
    try { parsed = JSON.parse(result); } catch { parsed = { subject: 'Student Alert', body: result }; }
    res.json(parsed);
  } catch (error) {
    res.status(500).json({ error: error.message, code: 500 });
  }
};

export const sendAlert = async (req, res) => {
  try {
    const { studentId, subject, body } = req.body;
    await createNotification(studentId, { type: 'warning', title: subject, message: body });
    try { getIO().of('/student').to(studentId.toString()).emit('dashboard:refresh'); } catch(e){}
    res.json({ message: 'Alert sent' });
  } catch (error) {
    res.status(500).json({ error: error.message, code: 500 });
  }
};

export const getEffectiveness = async (req, res) => {
  try {
    const insight = await TeacherInsight.findOne({ teacherId: req.user.userId });
    res.json(insight || { effectivenessScore: 0, recommendations: [] });
  } catch (error) {
    res.status(500).json({ error: error.message, code: 500 });
  }
};

export const generateContent = async (req, res) => {
  try {
    const { type, topic } = req.body;
    let prompt;
    
    switch (type) {
      case 'quiz':
        prompt = `Generate 5 high-quality MCQ questions on the topic "${topic}". 
        Include options A, B, C, D and indicate the correct answer. 
        Format clearly with markdown.`;
        break;
      case 'notes':
        prompt = `Create detailed, structured lecture notes on "${topic}". 
        Include introduction, key concepts, detailed explanations, and a conclusion.
        Use clear headings and bullet points.`;
        break;
      case 'summary':
        prompt = `Provide a concise but comprehensive summary of the topic "${topic}". 
        Focus on the most important takeaways and core definitions.`;
        break;
      case 'assignment':
        prompt = `Design a challenging assignment/homework task for students on "${topic}". 
        Include a problem statement, specific requirements, and a grading rubric.`;
        break;
      default:
        prompt = `Write educational content about "${topic}".`;
    }

    const result = await callGemini(prompt);
    res.json({ content: result });
  } catch (error) {
    res.status(500).json({ error: error.message, code: 500 });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const { name, department, bio } = req.body;
    const userId = req.user.userId;


    if (name) {
      await User.findByIdAndUpdate(userId, { name });
    }


    await Teacher.findOneAndUpdate(
      { userId },
      { department, bio },
      { upsert: true, new: true }
    );

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message, code: 500 });
  }
};

export const getAssessments = async (req, res) => {
  try {
    const assignments = await Assignment.find({ teacherId: req.user.userId }).sort({ createdAt: -1 });
    res.json({ assignments });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createAssessment = async (req, res) => {
  try {
    const { title, subject, dueDate, brief } = req.body;
    const assignment = await Assignment.create({
      teacherId: req.user.userId,
      title, subject, brief: brief || 'No description', dueDate,
      status: 'active'
    });
    res.status(201).json({ assignment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const gradeAssessment = async (req, res) => {
  try {
    const { id } = req.params;
    const assignment = await Assignment.findById(id);
    if (!assignment) return res.status(404).json({ error: 'Not found' });
    
    assignment.status = 'graded';
    await assignment.save();
    
    res.json({ success: true, assignment });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
