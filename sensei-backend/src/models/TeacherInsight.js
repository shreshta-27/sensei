import mongoose from 'mongoose';

const teacherInsightSchema = new mongoose.Schema({
  teacherId:          { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  classId:            { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  effectivenessScore: { type: Number, default: 0 },
  classPassRate:      { type: Number, default: 0 },
  summary:            { type: String },
  recommendations:    [{ type: String }],
  metrics: {
    avgStudentCgpa:   { type: Number },
    atRiskCount:      { type: Number },
    interventionRate: { type: Number },
    studentSatisfaction: { type: Number }
  },
}, { timestamps: true });

teacherInsightSchema.index({ teacherId: 1 });

const TeacherInsight = mongoose.model('TeacherInsight', teacherInsightSchema);
export default TeacherInsight;
