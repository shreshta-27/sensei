'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Plus, Upload, UserPlus, MessageCircle, Eye } from 'lucide-react';
import Link from 'next/link';
import api from '@/lib/axios';
import StickyCard from '@/components/faculty/StickyCard';
import KPICard from '@/components/faculty/KPICard';
import RiskBadge from '@/components/faculty/RiskBadge';
import ComicButton from '@/components/faculty/ComicButton';
import TeacherAvatar from '@/components/faculty/TeacherAvatar';

interface Student {
  id: string;
  name: string;
  dept: string;
  sem: number;
  cgpa: number;
  attendance: number;
  riskLevel: 'high' | 'medium' | 'low' | 'improving';
  performanceNote: string;
}

type FilterType = 'all' | 'critical' | 'high' | 'medium' | 'low' | 'improving';

const mockStudents: Student[] = [
  { id: '1', name: 'Arjun Patel', dept: 'Computer Science', sem: 4, cgpa: 7.6, attendance: 82, riskLevel: 'medium', performanceNote: 'Needs improvement in data structures.' },
  { id: '2', name: 'Priya Sharma', dept: 'Electronics', sem: 3, cgpa: 8.2, attendance: 91, riskLevel: 'low', performanceNote: 'Consistent performer, good attendance.' },
  { id: '3', name: 'Rohit Kumar', dept: 'Mechanical', sem: 5, cgpa: 6.8, attendance: 65, riskLevel: 'high', performanceNote: 'At risk - low attendance and declining grades.' },
  { id: '4', name: 'Sneha Reddy', dept: 'Computer Science', sem: 2, cgpa: 9.1, attendance: 95, riskLevel: 'improving', performanceNote: 'Showing great improvement this semester.' },
  { id: '5', name: 'Amit Singh', dept: 'Civil', sem: 6, cgpa: 7.9, attendance: 78, riskLevel: 'medium', performanceNote: 'Average performance, needs motivation.' },
  { id: '6', name: 'Neha Gupta', dept: 'Electronics', sem: 4, cgpa: 8.5, attendance: 88, riskLevel: 'low', performanceNote: 'Excellent in practical sessions.' },
];

const filterTabs: { key: FilterType; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'critical', label: 'Critical' },
  { key: 'high', label: 'High Risk' },
  { key: 'medium', label: 'Medium Risk' },
  { key: 'low', label: 'Low Risk' },
  { key: 'improving', label: 'Improving' },
];

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchStudents();
  }, [filter]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const params: any = {};
      if (filter !== 'all') params.filter = filter;
      const { data } = await api.get('/api/teacher/students', { params });
      setStudents(data.students || data || mockStudents);
    } catch {
      setStudents(mockStudents);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         s.dept.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;
    if (filter === 'all') return true;
    if (filter === 'critical') return s.riskLevel === 'high';
    return s.riskLevel === filter;
  });

  const totalStudents = students.length;
  const atRisk = students.filter(s => s.riskLevel === 'high' || s.riskLevel === 'medium').length;
  const critical = students.filter(s => s.riskLevel === 'high').length;
  const improving = students.filter(s => s.riskLevel === 'improving').length;

  const containerVariants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  const gridVariants = {
    animate: {
      transition: { staggerChildren: 0.06 },
    },
  };

  const cardVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.35 } },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="initial"
      animate="animate"
      className="space-y-6"
    >
      <header className="space-y-2">
        <h1 className="font-display text-4xl" style={{ fontFamily: 'var(--font-display)', fontSize: '40px' }}>
          Students
        </h1>
        <p className="font-body text-lg text-[var(--text-secondary)]">
          Manage student progress and risk tracking
        </p>
      </header>

      <motion.div
        variants={gridVariants}
        initial="initial"
        animate="animate"
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <KPICard label="Total Students" value={totalStudents} color="yellow" />
        <KPICard label="At Risk" value={atRisk} color="pink" />
        <KPICard label="Critical" value={critical} color="orange" />
        <KPICard label="Improving" value={improving} color="green" />
      </motion.div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {filterTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`px-4 py-2 rounded-[var(--btn-radius)] font-ui text-sm font-bold border-2 border-[var(--border-doodle)] transition-all ${
                filter === tab.key
                  ? 'bg-[var(--accent-purple)] text-white'
                  : 'bg-white text-[var(--text-secondary)] hover:bg-[var(--sticky-yellow)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search students..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-[var(--btn-radius)] border-2 border-[var(--border-doodle)] font-ui focus:outline-none focus:border-[var(--accent-purple)]"
            />
          </div>
          <div className="flex gap-2">
            <ComicButton variant="ghost" icon={<Plus size={16} />} onClick={() => {}}>
              Add Student
            </ComicButton>
            <ComicButton variant="secondary" icon={<Upload size={16} />} onClick={() => {}}>
              Upload CSV
            </ComicButton>
          </div>
        </div>
      </div>

      <motion.div
        variants={gridVariants}
        initial="initial"
        animate="animate"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {filteredStudents.map(student => (
          <motion.div key={student.id} variants={cardVariants}>
            <StickyCard color={getStickyColor(student.riskLevel)} rotation={-0.5}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <TeacherAvatar name={student.name} size={42} />
                  <div>
                    <Link href={`/teacher/students/${student.id}`}>
                      <h3 className="font-ui font-bold text-[var(--text-primary)] hover:text-[var(--accent-purple)] transition-colors cursor-pointer">
                        {student.name}
                      </h3>
                    </Link>
                    <p className="font-ui text-xs text-[var(--text-secondary)]">
                      {student.dept} · Sem {student.sem}
                    </p>
                  </div>
                </div>
                <RiskBadge level={student.riskLevel === 'improving' ? 'low' : student.riskLevel as any} label={getRiskLabel(student.riskLevel)} />
              </div>

              <div className="flex items-center justify-between text-sm mb-2">
                <div>
                  <span className="font-ui text-[var(--text-muted)]">CGPA:</span>
                  <span className="font-mono font-bold ml-1">{(student.cgpa || 0).toFixed(1)}</span>
                </div>
                <div>
                  <span className="font-ui text-[var(--text-muted)]">Att:</span>
                  <span className="font-ui font-bold ml-1">{student.attendance || 0}%</span>
                </div>
              </div>

              <hr className="border-t border-[var(--border-card)] mb-2" />

              <p className="font-body text-sm text-[var(--text-secondary)] mb-3 line-clamp-2">
                {student.performanceNote}
              </p>

              <div className="w-full h-2 bg-[#E5E0D8] rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-[var(--accent-purple)] transition-all duration-500"
                  style={{ width: `${student.attendance}%` }}
                />
              </div>

              <div className="flex gap-2">
                <ComicButton variant="ghost" size="sm" onClick={() => {}} className="flex-1">
                  View Profile
                </ComicButton>
                <ComicButton variant="secondary" size="sm" icon={<MessageCircle size={14} />} onClick={() => {}} className="flex-1">
                  Message
                </ComicButton>
              </div>
            </StickyCard>
          </motion.div>
        ))}
      </motion.div>

      {filteredStudents.length === 0 && !loading && (
        <div className="text-center py-12">
          <p className="font-ui text-[var(--text-muted)]">No students found matching your criteria.</p>
        </div>
      )}
    </motion.div>
  );
}

function getStickyColor(risk: string): 'yellow' | 'blue' | 'green' | 'purple' | 'pink' | 'orange' {
  switch (risk) {
    case 'high': return 'pink';
    case 'medium': return 'orange';
    case 'low': return 'green';
    case 'improving': return 'blue';
    default: return 'yellow';
  }
}

function getRiskLabel(risk: string): string {
  switch (risk) {
    case 'high': return 'High';
    case 'medium': return 'Medium';
    case 'low': return 'Low';
    case 'improving': return 'Improving';
    default: return 'Unknown';
  }
}