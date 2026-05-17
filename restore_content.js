const fs = require('fs');
const content = fs.readFileSync('c:/Users/hp/Desktop/SENSEI-hackathon/sensei-frontend/src/app/page.tsx', 'utf-8');
const lines = content.split('\n');

// Find the line with "const roleCards = ["
let targetIdx = -1;
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('const roleCards = [')) {
    targetIdx = i;
    break;
  }
}

if (targetIdx !== -1) {
  const contentToInsert = `    { icon: GraduationCap, color: PURPLE,    bg: '#F0E8FF', title: 'For Students', desc: 'An AI that adapts to how you think and grows with you.', features: ['Adaptive AI Assessments', 'Focus Guardian', 'Career Simulator', 'Vision Summarizer', '24/7 AI Study Tutor', 'Progress Analytics'] },
    { icon: BookOpen,      color: '#0097A7', bg: '#E0F7FA', title: 'For Faculty',  desc: 'Intelligent tools that save time so you focus on students.', features: ['AI-Powered Grading', 'Class Analytics', 'Intervention Alerts', 'Smart Assignment Builder', 'Resource Planner', 'Poll & Quiz Creator'] },
    { icon: Shield,        color: '#2E7D32', bg: '#E8F5E9', title: 'For Admins',   desc: 'System-wide analytics and AI-powered risk insights.', features: ['University Dashboard', 'Dropout Risk Prediction', 'Performance Analytics', 'Intervention Management', 'Department Reports'] },
  ];

  return (
    <div style={{ background: CREAM, color: NAVY, overflowX: 'hidden', fontFamily: "'Raleway', sans-serif" }}>
      {/* scroll progress bar */}
      <motion.div style={{ scaleX: progressScaleX, transformOrigin: '0%', position: 'fixed', top: 0, left: 0, right: 0, height: 3, background: \`linear-gradient(90deg,\${PURPLE},#EC407A,#4CAF50)\`, zIndex: 2000 }} />`;

  // Insert after targetIdx
  lines.splice(targetIdx + 1, 0, contentToInsert);
  fs.writeFileSync('c:/Users/hp/Desktop/SENSEI-hackathon/sensei-frontend/src/app/page.tsx', lines.join('\n'));
  console.log('Restored content');
} else {
  console.log('Target not found');
}
