'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Upload, MessageCircle, X } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/axios';
import StickyCard from '@/components/faculty/StickyCard';
import KPICard from '@/components/faculty/KPICard';
import RiskBadge from '@/components/faculty/RiskBadge';
import ComicButton from '@/components/faculty/ComicButton';
import TeacherAvatar from '@/components/faculty/TeacherAvatar';

interface Student {
  id: string;
  _id?: string;
  name: string;
  dept: string;
  sem: number;
  cgpa: number;
  attendance: number;
  riskLevel: 'high' | 'medium' | 'low' | 'improving';
  performanceNote: string;
  email?: string;
  studentId?: string;
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
  const router = useRouter();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Form states for Add Student
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newStudentId, setNewStudentId] = useState('');
  const [newDept, setNewDept] = useState('');
  const [newSem, setNewSem] = useState('1');
  const [newCgpa, setNewCgpa] = useState('');
  const [newAtt, setNewAtt] = useState('');
  const [addingStudent, setAddingStudent] = useState(false);

  // CSV upload states
  const [classes, setClasses] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/teacher/students');
      const raw = data.students || data || [];
      const mapped: Student[] = raw.map((s: any) => ({
        id: s._id || s.id || '',
        _id: s._id,
        name: s.name || 'Unknown',
        dept: s.department || s.dept || 'General',
        sem: s.semester || s.sem || 0,
        cgpa: s.cgpa || 0,
        attendance: s.attendance || 0,
        riskLevel: s.riskLevel || 'low',
        performanceNote: s.performanceNote || s.riskReason || `${s.name || 'Student'} - ${s.department || 'General'}`,
        email: s.email,
        studentId: s.studentId,
      }));
      setStudents(mapped.length > 0 ? mapped : mockStudents);
    } catch {
      setStudents(mockStudents);
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const { data } = await api.get('/api/teacher/classes');
      const list = data.classes || data || [];
      setClasses(list);
      if (list.length > 0) setSelectedClass(list[0]._id);
    } catch {
      toast.error('Failed to load classes');
    }
  };

  useEffect(() => {
    if (showUploadModal) {
      fetchClasses();
    }
  }, [showUploadModal]);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newEmail.trim()) {
      toast.error('Name and Email are required!');
      return;
    }
    setAddingStudent(true);
    try {
      await api.post('/api/teacher/students', {
        name: newName,
        email: newEmail,
        studentId: newStudentId || undefined,
        department: newDept || undefined,
        semester: Number(newSem) || 1,
        cgpa: newCgpa ? Number(newCgpa) : undefined,
        attendance: newAtt ? Number(newAtt) : undefined,
      });
      toast.success('Student added successfully!');
      setShowAddModal(false);
      // Reset form
      setNewName('');
      setNewEmail('');
      setNewStudentId('');
      setNewDept('');
      setNewSem('1');
      setNewCgpa('');
      setNewAtt('');
      fetchStudents();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to add student');
    } finally {
      setAddingStudent(false);
    }
  };

  const handleUploadCSV = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      toast.error('Please select a CSV file first');
      return;
    }
    if (!selectedClass) {
      toast.error('Please select a class first');
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append('csv', selectedFile);
    formData.append('classId', selectedClass);

    try {
      await api.post('/api/teacher/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      toast.success('CSV uploaded successfully!');
      setShowUploadModal(false);
      setSelectedFile(null);
      fetchStudents();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to upload CSV');
    } finally {
      setUploading(false);
    }
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = (s.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
                          (s.dept || '').toLowerCase().includes(searchQuery.toLowerCase());
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="font-handwrite text-3xl text-[var(--text-muted)] animate-pulse">Loading students…</div>
      </div>
    );
  }

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
                  ? 'bg-[var(--accent-purple)] text-white shadow-[2px_2px_0_var(--text-primary)]'
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
            <ComicButton variant="ghost" icon={<Plus size={16} />} onClick={() => setShowAddModal(true)}>
              Add Student
            </ComicButton>
            <ComicButton variant="secondary" icon={<Upload size={16} />} onClick={() => setShowUploadModal(true)}>
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
          <motion.div key={student.id || student._id || student.name} variants={cardVariants}>
            <StickyCard color={getStickyColor(student.riskLevel)} rotation={-0.5}>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <TeacherAvatar name={student.name || '?'} size={42} />
                  <div>
                    <Link href={`/teacher/students/${student.id || student._id}`}>
                      <h3 className="font-ui font-bold text-[var(--text-primary)] hover:text-[var(--accent-purple)] transition-colors cursor-pointer">
                        {student.name || 'Unknown'}
                      </h3>
                    </Link>
                    <p className="font-ui text-xs text-[var(--text-secondary)]">
                      {student.dept || 'General'} · Sem {student.sem || '-'}
                    </p>
                  </div>
                </div>
                <RiskBadge level={student.riskLevel === 'improving' ? 'low' : (student.riskLevel || 'low') as any} label={getRiskLabel(student.riskLevel)} />
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
                {student.performanceNote || 'No performance notes available'}
              </p>

              <div className="w-full h-2 bg-[#E5E0D8] rounded-full overflow-hidden mb-3">
                <div
                  className="h-full bg-[var(--accent-purple)] transition-all duration-500"
                  style={{ width: `${student.attendance || 0}%` }}
                />
              </div>

              <div className="flex gap-2">
                <ComicButton variant="ghost" size="sm" onClick={() => router.push(`/teacher/students/${student.id || student._id}`)} className="flex-1">
                  View Profile
                </ComicButton>
                <ComicButton variant="secondary" size="sm" icon={<MessageCircle size={14} />} onClick={() => {
                  toast.success(`Opening message window for ${student.name}...`);
                  window.location.href = `mailto:${student.email || 'student@sensei.edu'}?subject=Sensei Feedback - Academic Update`;
                }} className="flex-1">
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

      {/* ── ADD STUDENT MODAL ── */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            {/* Dialog Content */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg bg-[#FAF6EE] border-4 border-black rounded-[var(--btn-radius)] p-6 shadow-[6px_6px_0_#000] z-10"
            >
              <button
                onClick={() => setShowAddModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-xl border-2 border-black bg-white hover:bg-[var(--sticky-yellow)] transition-colors"
              >
                <X size={16} />
              </button>

              <h2 className="font-display text-2xl mb-4 text-[var(--text-primary)]">✨ Add New Student</h2>

              <form onSubmit={handleAddStudent} className="space-y-4 font-ui">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-3 py-2 border-2 border-black rounded-xl bg-white outline-none focus:ring-2 focus:ring-[var(--accent-purple)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    placeholder="e.g. rahul@sensei.edu"
                    className="w-full px-3 py-2 border-2 border-black rounded-xl bg-white outline-none focus:ring-2 focus:ring-[var(--accent-purple)]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">Student ID</label>
                    <input
                      type="text"
                      value={newStudentId}
                      onChange={e => setNewStudentId(e.target.value)}
                      placeholder="e.g. ST1024"
                      className="w-full px-3 py-2 border-2 border-black rounded-xl bg-white outline-none focus:ring-2 focus:ring-[var(--accent-purple)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">Department</label>
                    <input
                      type="text"
                      value={newDept}
                      onChange={e => setNewDept(e.target.value)}
                      placeholder="e.g. CSE"
                      className="w-full px-3 py-2 border-2 border-black rounded-xl bg-white outline-none focus:ring-2 focus:ring-[var(--accent-purple)]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">Semester</label>
                    <select
                      value={newSem}
                      onChange={e => setNewSem(e.target.value)}
                      className="w-full px-3 py-2 border-2 border-black rounded-xl bg-white outline-none focus:ring-2 focus:ring-[var(--accent-purple)]"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(s => (
                        <option key={s} value={s}>Sem {s}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">CGPA (0 - 10)</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={newCgpa}
                      onChange={e => setNewCgpa(e.target.value)}
                      placeholder="e.g. 8.5"
                      className="w-full px-3 py-2 border-2 border-black rounded-xl bg-white outline-none focus:ring-2 focus:ring-[var(--accent-purple)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">Attendance %</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={newAtt}
                      onChange={e => setNewAtt(e.target.value)}
                      placeholder="e.g. 92"
                      className="w-full px-3 py-2 border-2 border-black rounded-xl bg-white outline-none focus:ring-2 focus:ring-[var(--accent-purple)]"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <ComicButton variant="ghost" onClick={() => setShowAddModal(false)}>
                    Cancel
                  </ComicButton>
                  <ComicButton variant="primary" type="submit" disabled={addingStudent}>
                    {addingStudent ? 'Adding...' : 'Add Student'}
                  </ComicButton>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── UPLOAD CSV MODAL ── */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowUploadModal(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            {/* Dialog Content */}
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-[#FAF6EE] border-4 border-black rounded-[var(--btn-radius)] p-6 shadow-[6px_6px_0_#000] z-10"
            >
              <button
                onClick={() => setShowUploadModal(false)}
                className="absolute top-4 right-4 p-1.5 rounded-xl border-2 border-black bg-white hover:bg-[var(--sticky-yellow)] transition-colors"
              >
                <X size={16} />
              </button>

              <h2 className="font-display text-2xl mb-4 text-[var(--text-primary)]">📎 Bulk Upload Students</h2>

              <form onSubmit={handleUploadCSV} className="space-y-4 font-ui">
                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Target Class *</label>
                  <select
                    required
                    value={selectedClass}
                    onChange={e => setSelectedClass(e.target.value)}
                    className="w-full px-3 py-2 border-2 border-black rounded-xl bg-white outline-none focus:ring-2 focus:ring-[var(--accent-purple)]"
                  >
                    {classes.map(c => (
                      <option key={c._id} value={c._id}>
                        {c.name} ({c.department})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase mb-1">Select CSV File *</label>
                  <div className="border-4 border-dashed border-black rounded-xl p-6 text-center bg-white hover:bg-[var(--sticky-yellow)] transition-colors cursor-pointer relative">
                    <input
                      type="file"
                      required
                      accept=".csv"
                      onChange={e => {
                        const file = e.target.files?.[0] || null;
                        setSelectedFile(file);
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <Upload size={32} className="mx-auto mb-2 text-[var(--accent-purple)]" />
                    <p className="font-bold text-sm">
                      {selectedFile ? selectedFile.name : 'Click to select CSV'}
                    </p>
                    <p className="text-[10px] text-[var(--text-muted)] mt-1">Only .csv files up to 5MB</p>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <ComicButton variant="ghost" onClick={() => setShowUploadModal(false)}>
                    Cancel
                  </ComicButton>
                  <ComicButton variant="primary" type="submit" disabled={uploading}>
                    {uploading ? 'Uploading...' : 'Upload CSV'}
                  </ComicButton>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
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