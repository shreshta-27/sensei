'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Users, Search, GraduationCap, BookOpen, X, 
  Copy, Check, Hash 
} from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import PaperSheet from '@/components/teacher/PaperSheet';
import type { ClassItem, StudentItem } from '@/types';

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

  if (loading && classes.length === 0) return <div className="p-8 text-center handwriting text-2xl">Loading your workspace...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl font-black text-[#1A1A1A]">My Workspace</h1>
          <p className="handwriting text-xl text-gray-500 font-medium">Manage your classes and student rosters</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-6 py-3 bg-purple-600 text-white rounded-2xl font-bold shadow-lg shadow-purple-200 flex items-center gap-2 hover:scale-105 transition-all"
        >
          <Plus size={20} /> Create New Class
        </button>
      </div>

      {}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filtered.length === 0 ? (
          <div className="md:col-span-2 lg:col-span-3">
            <PaperSheet className="text-center py-20">
              <Users size={64} className="mx-auto text-gray-200 mb-4" />
              <h2 className="text-2xl font-bold text-gray-800">No classes found</h2>
              <p className="text-gray-500 mb-8">Start by creating your first class or refining your search.</p>
              <div className="relative max-w-md mx-auto">
                 <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                 <input 
                   type="text" 
                   value={search}
                   onChange={(e) => setSearch(e.target.value)}
                   placeholder="Search classes..." 
                   className="w-full bg-gray-50 border border-gray-200 rounded-2xl py-3 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-purple-500"
                 />
              </div>
            </PaperSheet>
          </div>
        ) : (
          filtered.map((cls, i) => (
            <motion.div
              key={cls._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => openClass(cls)}
              className="group cursor-pointer"
            >
              <PaperSheet className="h-full hover:border-purple-400 hover:shadow-xl transition-all duration-300">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600">
                    <GraduationCap size={24} />
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">SEMESTER</span>
                    <span className="text-lg font-black text-gray-800">{cls.semester}</span>
                  </div>
                </div>

                <h3 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-purple-600 transition-colors">{cls.name}</h3>
                <p className="handwriting text-gray-500 text-lg mb-6">{cls.department}</p>

                <div className="flex items-center gap-6 pt-6 border-t border-dashed border-gray-200">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">STUDENTS</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <Users size={14} className="text-purple-600" />
                      <span className="text-sm font-bold text-gray-700">{cls.studentCount || cls.studentIds?.length || 0}</span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">SUBJECTS</span>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <BookOpen size={14} className="text-blue-500" />
                      <span className="text-sm font-bold text-gray-700">{cls.subjects?.length || 0}</span>
                    </div>
                  </div>
                </div>
              </PaperSheet>
            </motion.div>
          ))
        )}
      </div>

      {}
      <AnimatePresence>
        {selectedClass && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setSelectedClass(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-4xl max-h-[90vh] overflow-hidden"
            >
              <PaperSheet title={selectedClass.name} className="flex flex-col h-full !p-0 overflow-hidden">
                <div className="p-8 pb-4 flex items-center justify-between border-b border-gray-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
                       <GraduationCap size={20} />
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800">{selectedClass.name}</h2>
                      <p className="handwriting text-gray-500 text-lg -mt-1">{selectedClass.department} • Semester {selectedClass.semester}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedClass(null)} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-all">
                    <X size={20} />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 pt-6">
                  {loadingStudents ? (
                    <div className="p-20 text-center handwriting text-2xl">Consulting student records...</div>
                  ) : students.length === 0 ? (
                    <div className="py-20 text-center">
                       <Users size={48} className="mx-auto text-gray-200 mb-4" />
                       <p className="text-gray-500 italic">No students registered in this class yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {students.map((student, i) => (
                         <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-purple-200 transition-all group">
                            <div className="w-12 h-12 rounded-full bg-white border border-gray-100 flex items-center justify-center text-purple-600 font-bold shadow-sm">
                               {student.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                               <p className="text-sm font-bold text-gray-800 truncate">{student.name}</p>
                               <p className="text-[11px] text-gray-400 truncate">{student.email}</p>
                            </div>
                            <div className="flex flex-col items-end shrink-0">
                               <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                 student.riskLevel === 'critical' ? 'bg-red-50 text-red-500' :
                                 student.riskLevel === 'high' ? 'bg-orange-50 text-orange-500' :
                                 'bg-green-50 text-green-500'
                               }`}>
                                 {student.riskLevel || 'Safe'}
                               </span>
                               <span className="text-xs font-bold text-gray-600 mt-1">{student.attendance}% Att.</span>
                            </div>
                         </div>
                       ))}
                    </div>
                  )}
                </div>

                <div className="p-6 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                   <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-xl border border-gray-200">
                      <Hash size={14} className="text-gray-400" />
                      <span className="text-[10px] font-bold text-gray-500 select-all">{selectedClass._id}</span>
                      <button onClick={() => copyClassId(selectedClass._id)} className="ml-2 p-1 hover:text-purple-600 transition-colors">
                         {copiedId ? <Check size={14} /> : <Copy size={14} />}
                      </button>
                   </div>
                   <button className="px-6 py-2 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-100 transition-all">
                      Export Roster (CSV)
                   </button>
                </div>
              </PaperSheet>
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
            className="fixed inset-0 z-[100] bg-gray-900/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowCreate(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg"
            >
              <PaperSheet title="CREATE NEW CLASS">
                <div className="space-y-6">
                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Class Name</label>
                     <input 
                       value={newClass.name}
                       onChange={e => setNewClass({ ...newClass, name: e.target.value })}
                       placeholder="e.g. Fullstack Web Dev - Sec B" 
                       className="w-full bg-gray-50 border-2 border-transparent border-b-gray-200 py-3 px-4 focus:border-b-purple-500 outline-none handwriting text-xl transition-all"
                     />
                   </div>

                   <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Department</label>
                        <input 
                          value={newClass.department}
                          onChange={e => setNewClass({ ...newClass, department: e.target.value })}
                          placeholder="e.g. Computer Science" 
                          className="w-full bg-gray-50 border-2 border-transparent border-b-gray-200 py-2 px-4 focus:border-b-purple-500 outline-none handwriting text-lg transition-all"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Semester</label>
                        <input 
                          type="number"
                          value={newClass.semester}
                          onChange={e => setNewClass({ ...newClass, semester: e.target.value })}
                          placeholder="e.g. 5" 
                          className="w-full bg-gray-50 border-2 border-transparent border-b-gray-200 py-2 px-4 focus:border-b-purple-500 outline-none handwriting text-lg transition-all"
                        />
                      </div>
                   </div>

                   <div className="space-y-2">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Subjects (Comma Separated)</label>
                     <input 
                       value={newClass.subjects}
                       onChange={e => setNewClass({ ...newClass, subjects: e.target.value })}
                       placeholder="e.g. React, Node.js, MongoDB" 
                       className="w-full bg-gray-50 border-2 border-transparent border-b-gray-200 py-2 px-4 focus:border-b-purple-500 outline-none handwriting text-lg transition-all"
                     />
                   </div>

                   <div className="flex gap-4 pt-4">
                      <button 
                        onClick={() => setShowCreate(false)}
                        className="flex-1 py-3 text-gray-500 font-bold hover:bg-gray-100 rounded-2xl transition-all"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleCreateClass}
                        disabled={creating}
                        className="flex-1 py-3 bg-purple-600 text-white rounded-2xl font-bold shadow-lg shadow-purple-200 hover:scale-105 transition-all disabled:opacity-50"
                      >
                        {creating ? 'Creating...' : 'Establish Class'}
                      </button>
                   </div>
                </div>
              </PaperSheet>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
