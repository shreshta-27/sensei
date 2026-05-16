'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, BookOpen, X, ChevronRight, GraduationCap, Plus, Loader2, AlertTriangle, Copy, Check, Calendar, Hash } from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import PageTransition from '@/components/teacher/PageTransition';
import GlowCard from '@/components/teacher/GlowCard';
import EmptyState from '@/components/teacher/EmptyState';
import { TableSkeleton } from '@/components/teacher/LoadingSkeleton';

interface ClassItem {
  _id: string;
  name: string;
  semester: number;
  department: string;
  studentIds: string[];
  subjects: string[];
  academicYear: string;
  studentCount?: number;
  avgRisk?: number;
}

interface StudentItem {
  _id: string;
  name: string;
  email: string;
  studentId: string;
  cgpa: number;
  riskLevel: string;
  attendance: number;
}

export default function ClassesPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedClass, setSelectedClass] = useState<ClassItem | null>(null);
  const [students, setStudents] = useState<StudentItem[]>([]);
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [newClass, setNewClass] = useState({ name: '', semester: '', department: '', academicYear: '', subjects: '' });

  const fetchClasses = () => {
    setLoading(true);
    api.get('/api/teacher/classes')
      .then(({ data }) => setClasses(data.classes || data || []))
      .catch(() => toast.error('Failed to load classes'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchClasses(); }, []);

  const openClass = (cls: ClassItem) => {
    setSelectedClass(cls);
    setLoadingStudents(true);
    api.get(`/api/teacher/classes/${cls._id}`)
      .then(({ data }) => setStudents(data.students || []))
      .catch(() => setStudents([]))
      .finally(() => setLoadingStudents(false));
  };

  const handleCreateClass = async () => {
    if (!newClass.name.trim() || !newClass.semester || !newClass.department.trim()) {
      toast.error('Name, Semester, and Department are required');
      return;
    }
    setCreating(true);
    try {
      await api.post('/api/teacher/classes', {
        name: newClass.name.trim(),
        semester: parseInt(newClass.semester, 10),
        department: newClass.department.trim(),
        academicYear: newClass.academicYear.trim() || undefined,
        subjects: newClass.subjects ? newClass.subjects.split(',').map(s => s.trim()).filter(Boolean) : []
      });
      toast.success('Class created successfully!');
      setShowCreate(false);
      setNewClass({ name: '', semester: '', department: '', academicYear: '', subjects: '' });
      fetchClasses();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create class');
    } finally {
      setCreating(false);
    }
  };

  const copyClassId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    toast.success('Class ID copied!');
    setTimeout(() => setCopiedId(false), 2000);
  };

  const filtered = classes.filter(c =>
    (c.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
    (c.department?.toLowerCase() || '').includes(search.toLowerCase())
  );

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500/15 text-red-400 border-red-500/30';
      case 'high': return 'bg-orange-500/15 text-orange-400 border-orange-500/30';
      case 'medium': return 'bg-yellow-500/15 text-yellow-400 border-yellow-500/30';
      default: return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
    }
  };

  if (loading && classes.length === 0) return <TableSkeleton rows={6} />;

  return (
    <PageTransition>
      <div className="space-y-6 px-1 sm:px-0">
        {}
        <div className="flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="font-faculty-heading text-xl sm:text-2xl font-bold text-faculty-text">Classes</h1>
              <p className="font-faculty text-xs sm:text-sm text-faculty-text-secondary mt-1">Manage your classes and students</p>
            </div>
            <button
              onClick={() => setShowCreate(true)}
              className="faculty-btn flex items-center justify-center gap-2 w-full sm:w-auto text-sm sm:text-base px-4 py-2.5"
            >
              <Plus size={16} /> Create Class
            </button>
          </div>

          {}
          <div className="relative w-full">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-faculty-text-secondary" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or department..."
              className="faculty-input w-full pl-10 text-sm"
            />
          </div>
        </div>

        {}
        {classes.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Total Classes', value: classes.length, color: 'text-faculty-teal' },
              { label: 'Total Students', value: classes.reduce((sum, c) => sum + (c.studentCount || c.studentIds?.length || 0), 0), color: 'text-faculty-purple' },
              { label: 'Active', value: classes.length, color: 'text-emerald-400' },
              { label: 'At Risk', value: classes.reduce((sum, c) => sum + (c.avgRisk || 0), 0), color: 'text-red-400' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="faculty-card p-3 sm:p-4 text-center"
              >
                <p className={`font-faculty-data text-lg sm:text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                <p className="font-faculty text-[10px] sm:text-xs text-faculty-text-secondary mt-0.5">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        )}

        {}
        {filtered.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No Classes Found"
            description={search ? 'No classes match your search.' : 'Create your first class to get started.'}
            action={{ label: 'Create Class', onClick: () => setShowCreate(true) }}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((cls, i) => (
              <motion.div
                key={cls._id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => openClass(cls)}
                className="faculty-card p-4 sm:p-5 cursor-pointer group hover:border-faculty-teal/40 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-faculty-teal/20 to-faculty-purple/20 flex items-center justify-center border border-faculty-border/50">
                    <GraduationCap size={20} className="text-faculty-teal" />
                  </div>
                  <ChevronRight size={16} className="text-faculty-text-secondary opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200" />
                </div>
                <h3 className="font-faculty-heading text-sm sm:text-base font-semibold text-faculty-text mb-1 truncate">{cls.name}</h3>
                <p className="font-faculty text-[11px] sm:text-xs text-faculty-text-secondary mb-3">{cls.department} • Sem {cls.semester}</p>
                {cls.academicYear && (
                  <p className="font-faculty text-[10px] text-faculty-text-secondary mb-3 flex items-center gap-1">
                    <Calendar size={10} /> {cls.academicYear}
                  </p>
                )}
                <div className="flex items-center justify-between pt-3 border-t border-faculty-border/30">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5">
                      <Users size={12} className="text-faculty-teal" />
                      <span className="font-faculty-data text-xs text-faculty-text">{cls.studentCount || cls.studentIds?.length || 0}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <BookOpen size={12} className="text-faculty-purple" />
                      <span className="font-faculty-data text-xs text-faculty-text">{cls.subjects?.length || 0}</span>
                    </div>
                  </div>
                  {(cls.avgRisk || 0) > 0 && (
                    <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 border border-red-500/20">
                      <AlertTriangle size={10} className="text-red-400" />
                      <span className="font-faculty-data text-[10px] text-red-400">{cls.avgRisk}</span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {}
        <AnimatePresence>
          {selectedClass && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center"
              onClick={() => setSelectedClass(null)}
            >
              <motion.div
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 60 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className="w-full sm:max-w-lg max-h-[85vh] sm:max-h-[80vh] overflow-hidden bg-faculty-surface border border-faculty-border rounded-t-2xl sm:rounded-2xl flex flex-col"
              >
                {}
                <div className="shrink-0 bg-gradient-to-r from-faculty-teal/10 to-faculty-purple/10 border-b border-faculty-border p-4 sm:p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0 pr-3">
                      <h2 className="font-faculty-heading text-base sm:text-lg font-bold text-faculty-text truncate">{selectedClass.name}</h2>
                      <p className="font-faculty text-xs text-faculty-text-secondary mt-0.5">
                        {selectedClass.department} • Semester {selectedClass.semester}
                        {selectedClass.academicYear && ` • ${selectedClass.academicYear}`}
                      </p>
                    </div>
                    <button onClick={() => setSelectedClass(null)} className="p-2 rounded-lg hover:bg-faculty-surface-hover text-faculty-text-secondary shrink-0">
                      <X size={18} />
                    </button>
                  </div>

                  {}
                  <div className="mt-3 flex items-center gap-2">
                    <div className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-faculty-bg/60 border border-faculty-border/50 rounded-lg">
                      <Hash size={12} className="text-faculty-text-secondary shrink-0" />
                      <span className="font-faculty-data text-[11px] text-faculty-text-secondary truncate">{selectedClass._id}</span>
                    </div>
                    <button
                      onClick={() => copyClassId(selectedClass._id)}
                      className="shrink-0 p-2 rounded-lg bg-faculty-teal/10 hover:bg-faculty-teal/20 text-faculty-teal border border-faculty-teal/20 transition-colors"
                    >
                      {copiedId ? <Check size={14} /> : <Copy size={14} />}
                    </button>
                  </div>

                  {}
                  {selectedClass.subjects && selectedClass.subjects.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {selectedClass.subjects.map((sub, i) => (
                        <span key={i} className="px-2 py-0.5 text-[10px] font-faculty font-medium bg-faculty-purple/10 text-faculty-purple border border-faculty-purple/20 rounded-full">
                          {sub}
                        </span>
                      ))}
                    </div>
                  )}

                  {}
                  <div className="mt-3 flex items-center gap-2">
                    <Users size={14} className="text-faculty-teal" />
                    <span className="font-faculty text-xs text-faculty-text-secondary">
                      {loadingStudents ? 'Loading...' : `${students.length} student${students.length !== 1 ? 's' : ''} enrolled`}
                    </span>
                  </div>
                </div>

                {}
                <div className="flex-1 overflow-y-auto p-4 faculty-scrollbar">
                  {loadingStudents ? (
                    <div className="space-y-3">
                      {[1, 2, 3, 4].map(i => (
                        <div key={i} className="flex items-center gap-3 p-3 rounded-xl animate-pulse">
                          <div className="w-10 h-10 rounded-full bg-faculty-border/30" />
                          <div className="flex-1 space-y-2">
                            <div className="h-3 bg-faculty-border/30 rounded w-2/3" />
                            <div className="h-2 bg-faculty-border/20 rounded w-1/3" />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : students.length === 0 ? (
                    <div className="text-center py-10">
                      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-faculty-teal/10 flex items-center justify-center">
                        <Users size={28} className="text-faculty-teal/50" />
                      </div>
                      <p className="font-faculty text-sm text-faculty-text-secondary mb-2">No students enrolled yet</p>
                      <p className="font-faculty text-[11px] text-faculty-text-secondary/60 max-w-xs mx-auto">
                        Upload a CSV file from your dashboard or add students to this class to see them here.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {students.map((s, i) => (
                        <motion.div
                          key={s._id || i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="flex items-center gap-3 p-3 rounded-xl bg-faculty-bg/40 border border-faculty-border/40 hover:border-faculty-teal/30 transition-colors"
                        >
                          {}
                          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-faculty-teal to-faculty-purple flex items-center justify-center text-white text-xs sm:text-sm font-bold shrink-0">
                            {s.name?.charAt(0)?.toUpperCase() || '?'}
                          </div>

                          {}
                          <div className="flex-1 min-w-0">
                            <p className="font-faculty text-xs sm:text-sm text-faculty-text font-medium truncate">{s.name || 'Unknown Student'}</p>
                            <p className="font-faculty text-[10px] sm:text-xs text-faculty-text-secondary truncate">{s.email || s.studentId || '—'}</p>
                          </div>

                          {}
                          <div className="hidden sm:flex items-center gap-3 shrink-0">
                            <div className="text-center">
                              <p className="font-faculty-data text-xs font-bold" style={{ color: s.cgpa >= 7 ? '#22c55e' : s.cgpa >= 5 ? '#eab308' : '#ef4444' }}>
                                {s.cgpa > 0 ? s.cgpa.toFixed(1) : '—'}
                              </p>
                              <p className="font-faculty text-[9px] text-faculty-text-secondary">CGPA</p>
                            </div>
                            <span className={`px-2 py-0.5 text-[10px] font-faculty-data font-bold uppercase rounded-full border ${getRiskColor(s.riskLevel)}`}>
                              {s.riskLevel || 'low'}
                            </span>
                          </div>

                          {}
                          <div className="sm:hidden shrink-0">
                            <span className={`w-2.5 h-2.5 rounded-full inline-block ${
                              s.riskLevel === 'critical' || s.riskLevel === 'high' ? 'bg-red-400' :
                              s.riskLevel === 'medium' ? 'bg-yellow-400' : 'bg-emerald-400'
                            }`} />
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {}
        <AnimatePresence>
          {showCreate && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center"
              onClick={() => setShowCreate(false)}
            >
              <motion.div
                initial={{ opacity: 0, y: 60 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 60 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                onClick={e => e.stopPropagation()}
                className="w-full sm:max-w-md bg-faculty-surface border border-faculty-border rounded-t-2xl sm:rounded-2xl p-5 sm:p-6"
              >
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h2 className="font-faculty-heading text-base sm:text-lg font-bold text-faculty-text">Create New Class</h2>
                    <p className="font-faculty text-[11px] text-faculty-text-secondary mt-0.5">Fill in the details below</p>
                  </div>
                  <button onClick={() => setShowCreate(false)} className="p-2 rounded-lg hover:bg-faculty-surface-hover text-faculty-text-secondary">
                    <X size={18} />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="font-faculty text-[11px] text-faculty-text-secondary uppercase tracking-wider mb-1.5 block">Class Name *</label>
                    <input
                      value={newClass.name}
                      onChange={e => setNewClass({ ...newClass, name: e.target.value })}
                      className="faculty-input w-full text-sm"
                      placeholder="e.g. CSE-S5-2025"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="font-faculty text-[11px] text-faculty-text-secondary uppercase tracking-wider mb-1.5 block">Department *</label>
                      <input
                        value={newClass.department}
                        onChange={e => setNewClass({ ...newClass, department: e.target.value })}
                        className="faculty-input w-full text-sm"
                        placeholder="e.g. CSE"
                      />
                    </div>
                    <div>
                      <label className="font-faculty text-[11px] text-faculty-text-secondary uppercase tracking-wider mb-1.5 block">Semester *</label>
                      <input
                        type="number"
                        min="1"
                        max="10"
                        value={newClass.semester}
                        onChange={e => setNewClass({ ...newClass, semester: e.target.value })}
                        className="faculty-input w-full text-sm"
                        placeholder="e.g. 5"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="font-faculty text-[11px] text-faculty-text-secondary uppercase tracking-wider mb-1.5 block">Academic Year</label>
                    <input
                      value={newClass.academicYear}
                      onChange={e => setNewClass({ ...newClass, academicYear: e.target.value })}
                      className="faculty-input w-full text-sm"
                      placeholder="e.g. 2025-2026"
                    />
                  </div>

                  <div>
                    <label className="font-faculty text-[11px] text-faculty-text-secondary uppercase tracking-wider mb-1.5 block">Subjects (comma separated)</label>
                    <input
                      value={newClass.subjects}
                      onChange={e => setNewClass({ ...newClass, subjects: e.target.value })}
                      className="faculty-input w-full text-sm"
                      placeholder="e.g. Networks, OS, DBMS"
                    />
                  </div>

                  <button
                    onClick={handleCreateClass}
                    disabled={creating || !newClass.name.trim() || !newClass.semester || !newClass.department.trim()}
                    className="faculty-btn w-full flex items-center justify-center gap-2 py-2.5 mt-1 disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    {creating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                    {creating ? 'Creating...' : 'Create Class'}
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </PageTransition>
  );
}
