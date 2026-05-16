import 'dotenv/config';
import mongoose from 'mongoose';
import User from './src/models/User.js';
import Student from './src/models/Student.js';
import Teacher from './src/models/Teacher.js';
import Admin from './src/models/Admin.js';
import Class from './src/models/Class.js';
import Subject from './src/models/Subject.js';
import Marks from './src/models/Marks.js';
import Attendance from './src/models/Attendance.js';
import Insight from './src/models/Insight.js';
import Leaderboard from './src/models/Leaderboard.js';
import Intervention from './src/models/Intervention.js';
import TeacherInsight from './src/models/TeacherInsight.js';
import StudyPlan from './src/models/StudyPlan.js';

const DEPARTMENTS = ['CSE', 'IT', 'BTECH', 'AI'];

const SUBJECTS_MAP = {
  CSE: ['Data Structures', 'Operating Systems', 'Database Management', 'Computer Networks', 'Software Engineering'],
  IT: ['Web Technologies', 'Cloud Computing', 'Information Security', 'Mobile App Development', 'Data Analytics'],
  BTECH: ['Engineering Mathematics', 'Applied Physics', 'Mechanics', 'Thermodynamics', 'Material Science'],
  AI: ['Machine Learning', 'Deep Learning', 'Natural Language Processing', 'Computer Vision', 'Reinforcement Learning']
};

const FIRST_NAMES = ['Aarav', 'Priya', 'Rohan', 'Ananya', 'Vikram', 'Sneha', 'Arjun', 'Kavya', 'Aditya', 'Ishita'];
const LAST_NAMES = ['Sharma', 'Patel', 'Kumar', 'Reddy', 'Singh', 'Gupta', 'Verma', 'Nair', 'Joshi', 'Rao'];

const TEACHER_NAMES = {
  CSE: 'Dr. Rajesh Mehta',
  IT: 'Dr. Sunita Desai',
  BTECH: 'Dr. Manoj Tiwari',
  AI: 'Dr. Kavitha Rajan'
};

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

async function seed() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    await Promise.all([
      User.deleteMany({}), Student.deleteMany({}), Teacher.deleteMany({}),
      Admin.deleteMany({}), Class.deleteMany({}), Subject.deleteMany({}),
      Marks.deleteMany({}), Attendance.deleteMany({}), Insight.deleteMany({}),
      Leaderboard.deleteMany({}), Intervention.deleteMany({}), 
      TeacherInsight.deleteMany({}), StudyPlan.deleteMany({})
    ]);
    console.log('Cleared all collections');

    const adminUser = await User.create({
      name: 'Shivam Admin', email: 'shivam77@gmail.com',
      password: '9082249120', role: 'admin', department: 'CSE'
    });
    await Admin.create({ userId: adminUser._id });
    console.log('Admin created: shivam77@gmail.com / 9082249120');

    for (const dept of DEPARTMENTS) {
      const teacherUser = await User.create({
        name: TEACHER_NAMES[dept],
        email: `teacher.${dept.toLowerCase()}@sensei.edu`,
        password: 'teacher123', role: 'teacher', department: dept
      });
      await Teacher.create({
        userId: teacherUser._id,
        subjects: SUBJECTS_MAP[dept],
        departments: [dept]
      });
      console.log(`Teacher: ${TEACHER_NAMES[dept]} (${dept})`);

      const subjects = [];
      for (const subName of SUBJECTS_MAP[dept]) {
        const sub = await Subject.create({
          name: subName, code: `${dept}${SUBJECTS_MAP[dept].indexOf(subName) + 101}`,
          department: dept, semester: rand(3, 6),
          credits: rand(3, 4), maxMarks: { ut1: 20, midSem: 30, ut2: 20, endSem: 80 }
        });
        subjects.push(sub);
      }

      const cls = await Class.create({
        name: `${dept}-S5-2025`, department: dept, semester: 5,
        teacherId: teacherUser._id, subjectIds: subjects.map(s => s._id),
        studentIds: []
      });

      // Create Teacher Insight
      await TeacherInsight.create({
        teacherId: teacherUser._id,
        classId: cls._id,
        effectivenessScore: rand(70, 95),
        classPassRate: rand(80, 100),
        summary: `The class ${cls.name} is performing well overall, with some students showing exceptional growth in ${subjects[0].name}.`,
        recommendations: [
          'Introduce more practical labs for better conceptual clarity',
          'Conduct additional remedial sessions for at-risk students'
        ],
        metrics: {
          avgStudentCgpa: (rand(65, 85) / 10).toFixed(2),
          atRiskCount: rand(1, 4),
          interventionRate: rand(10, 30),
          studentSatisfaction: rand(80, 95)
        }
      });

      const studentIds = [];
      for (let i = 0; i < 10; i++) {
        const firstName = FIRST_NAMES[i];
        const lastName = LAST_NAMES[i];
        const rollNum = `${dept}${2025}${String(i + 1).padStart(3, '0')}`;

        const studentUser = await User.create({
          name: `${firstName} ${lastName}`,
          email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}.${dept.toLowerCase()}@sensei.edu`,
          password: 'student123', role: 'student',
          department: dept, studentId: rollNum
        });

        const student = await Student.create({
          userId: studentUser._id, classId: cls._id,
          semester: 5, xp: rand(200, 3000),
          level: rand(1, 10), badges: [],
          streakDays: rand(0, 30), totalStudyTime: rand(10, 500)
        });

        studentIds.push(studentUser._id);

        let totalMarksSum = 0;
        let totalMaxSum = 0;
        const subjectScores = [];
        for (const sub of subjects) {
          // Occasionally force low marks to trigger interventions (e.g., for the first 2 students in each dept)
          const forceLow = i < 2;
          const ut1 = forceLow ? rand(2, 8) : rand(6, 20);
          const midSem = forceLow ? rand(5, 12) : rand(10, 30);
          const ut2 = forceLow ? rand(2, 8) : rand(6, 20);
          const endSem = forceLow ? rand(10, 30) : rand(25, 80);
          const total = ut1 + midSem + ut2 + endSem;
          const max = 20 + 30 + 20 + 80;
          const pct = Math.round((total / max) * 100);

          await Marks.create({
            studentId: studentUser._id, subject: sub.name,
            classId: cls._id, semester: 5,
            ut1, midSem, ut2, endSem, total, percentage: pct
          });

          totalMarksSum += total;
          totalMaxSum += max;
          subjectScores.push({ subject: sub.name, percentage: pct });

          const totalClasses = rand(35, 50);
          const attended = forceLow ? rand(10, 20) : rand(Math.floor(totalClasses * 0.5), totalClasses);
          await Attendance.create({
            studentId: studentUser._id, subject: sub.name,
            classId: cls._id, semester: 5,
            total: totalClasses, attended,
            percentage: Math.round((attended / totalClasses) * 100)
          });
        }

        const avgPct = Math.round(totalMarksSum / totalMaxSum * 100);
        const cgpa = Math.round((avgPct / 10) * 100) / 100;
        const riskLevel = cgpa < 4 ? 'critical' : cgpa < 5.5 ? 'high' : cgpa < 7 ? 'medium' : 'low';
        const dropoutScore = Math.max(0, Math.min(100, Math.round(100 - cgpa * 10)));

        const weakSubjects = subjectScores.filter(s => s.percentage < 50).map(s => s.subject);
        const riskReason = weakSubjects.length > 0
          ? `Low scores in ${weakSubjects.join(', ')}`
          : cgpa < 6 ? 'Below average overall performance' : 'Performing well';

        await Insight.create({
          studentId: studentUser._id, classId: cls._id,
          cgpa, riskLevel, dropoutScore, riskReason,
          recommendations: [
            riskLevel !== 'low' ? `Focus on improving ${weakSubjects[0] || 'core subjects'}` : 'Keep up the excellent work',
            'Complete daily study plan tasks',
            'Practice with AI quizzes regularly'
          ],
          semester: 5
        });

        // Create Intervention for at-risk students
        if (riskLevel === 'critical' || riskLevel === 'high') {
          const intervention = await Intervention.create({
            studentId: studentUser._id,
            teacherId: teacherUser._id,
            triggerType: riskLevel === 'critical' ? 'auto_critical' : 'risk_threshold',
            message: `Hello ${firstName}, I've noticed you're struggling with ${weakSubjects[0] || 'your coursework'}. Let's work together to improve your performance.`,
            tags: ['performance', 'attendance'],
            urgency: riskLevel === 'critical' ? 'critical' : 'high',
            status: rand(0, 1) === 0 ? 'sent' : 'acknowledged',
            outcome: 'pending',
            riskAtSend: dropoutScore
          });

          // Create a related Study Plan for the intervention
          await StudyPlan.create({
            studentId: studentUser._id,
            planType: 'advanced',
            mode: 'intervention',
            topic: weakSubjects[0] || 'Core Concepts',
            interventionId: intervention._id,
            title: `Remedial Plan for ${weakSubjects[0] || 'Core Concepts'}`,
            totalDays: 5,
            dailySessions: [
              { day: 1, date: '2025-05-10', topics: ['Basics'], activities: ['Video Tutorial'], resources: ['Textbook Ch 1'], completed: true },
              { day: 2, date: '2025-05-11', topics: ['Practice'], activities: ['Solving Problems'], resources: ['Practice Set 1'], completed: false }
            ],
            progress: 20
          });

          intervention.studyPlanId = (await StudyPlan.findOne({ interventionId: intervention._id }))._id;
          await intervention.save();
        }
      }

      cls.studentIds = studentIds;
      await cls.save();

      const lbEntries = [];
      for (let i = 0; i < studentIds.length; i++) {
        const stud = await Student.findOne({ userId: studentIds[i] });
        const insight = await Insight.findOne({ studentId: studentIds[i] });
        lbEntries.push({
          studentId: studentIds[i],
          name: (await User.findById(studentIds[i])).name,
          score: Math.round((insight?.cgpa || 5) * 100 + (stud?.xp || 0) / 10),
          xp: stud?.xp || 0,
          badges: stud?.badges || [],
          change: rand(-3, 3)
        });
      }
      lbEntries.sort((a, b) => b.score - a.score);
      lbEntries.forEach((e, i) => { e.rank = i + 1; });

      await Leaderboard.create({
        classId: cls._id, entries: lbEntries,
        updatedAt: new Date()
      });

      console.log(`  → 10 students + marks/attendance/insights/interventions for ${dept}`);
    }

    console.log('\n✅ Seed complete!');
    console.log('Admin: shivam77@gmail.com / 9082249120');
    console.log('Teachers: teacher.cse@sensei.edu / teacher123');
    console.log('Students: aarav.sharma.cse@sensei.edu / student123');
    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();

