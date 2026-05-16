'use client';

import Link from 'next/link';
import { useEffect, useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Search, Users, GraduationCap, BookOpen, Shield, X, ArrowRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/axios';

const DEPARTMENTS = ['CSE', 'IT', 'BTECH', 'AI'];
const ROLES = ['student', 'teacher', 'admin'];

interface UserItem { _id: string; name: string; email: string; role: string; department: string; studentId?: string; isActive: boolean; createdAt: string; }

function UsersContent() {
  const searchParams = useSearchParams();
  const initialDept = searchParams.get('department') || '';
  
  const [users, setUsers] = useState<UserItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState(initialDept);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', department: 'CSE', studentId: '', semester: 1 });
  const [creating, setCreating] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (search) params.set('search', search);
    if (roleFilter) params.set('role', roleFilter);
    if (deptFilter) params.set('department', deptFilter);
    api.get(`/api/admin/users?${params}`).then(({ data }) => {
      setUsers(data.users || []);
      setTotal(data.total || 0);
    }).catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, [page, roleFilter, deptFilter]);

  const createUser = async () => {
    if (!form.name || !form.email || !form.password) return toast.error('Fill all required fields');
    setCreating(true);
    try {
      await api.post('/api/auth/register', {
        ...form,
        department: form.department.toUpperCase(),
        semester: form.role === 'student' ? Number(form.semester) : undefined,
        studentId: form.role === 'student' ? form.studentId : undefined
      });
      toast.success(`${form.role} created successfully!`);
      setShowModal(false);
      setForm({ name: '', email: '', password: '', role: 'student', department: 'CSE', studentId: '', semester: 1 });
      fetchUsers();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      toast.error(e.response?.data?.error || 'Failed to create user');
    } finally { setCreating(false); }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      await api.patch(`/api/admin/users/${id}`, { isActive: !isActive });
      toast.success(isActive ? 'User deactivated' : 'User activated');
      fetchUsers();
    } catch { toast.error('Failed to update'); }
  };

  const roleIcon = (role: string) => role === 'student' ? '🎓' : role === 'teacher' ? '📐' : '🌌';

  const handleExport = async () => {
    try {
      const response = await api.get('/api/admin/users/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'users.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch {
      toast.error('Failed to export users');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--a-primary)' }}>👥 User Management</h1>
        <div className="flex gap-3">
          <button onClick={handleExport} className="px-4 py-2 border text-white rounded-xl font-bold flex items-center gap-2 hover:bg-white/5 transition-colors" style={{ fontFamily: 'var(--font-body)', borderColor: 'var(--a-border)' }}>
            <Users size={16} /> Export CSV
          </button>
          <button onClick={() => setShowModal(true)} className="px-4 py-2 bg-purple-600 text-white rounded-xl font-bold flex items-center gap-2 hover:bg-purple-700 transition-colors" style={{ fontFamily: 'var(--font-body)' }}>
            <UserPlus size={16} /> Register User
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && fetchUsers()} placeholder="Search by name..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border text-sm" style={{ background: 'var(--a-card)', borderColor: 'var(--a-border)', color: 'var(--a-text)', fontFamily: 'var(--font-body)' }} />
        </div>
        <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-xl border text-sm" style={{ background: 'var(--a-card)', borderColor: 'var(--a-border)', color: 'var(--a-text)' }}>
          <option value="">All Roles</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select value={deptFilter} onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }}
          className="px-3 py-2 rounded-xl border text-sm" style={{ background: 'var(--a-card)', borderColor: 'var(--a-border)', color: 'var(--a-text)' }}>
          <option value="">All Depts</option>
          {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      <div className="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--a-muted)' }}>Total: {total} users</div>

      {loading ? <div className="pencil-loader w-48 mx-auto" /> : (
        <div className="rounded-xl border overflow-hidden" style={{ borderColor: 'var(--a-border)' }}>
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: 'var(--a-card)', fontFamily: 'var(--font-mono)', color: 'var(--a-muted)' }}>
                <th className="text-left p-3">User</th>
                <th className="text-left p-3">Role</th>
                <th className="text-left p-3">Dept</th>
                <th className="text-center p-3">Status</th>
                <th className="text-center p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <motion.tr key={u._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="border-t" style={{ borderColor: 'var(--a-border)', background: 'var(--a-card)' }}>
                  <td className="p-3 text-left">
                    <Link href={`/admin/users/${u._id}`} className="hover:text-purple-400 transition-colors cursor-pointer group flex items-center gap-2">
                      <div>
                        <p className="font-bold" style={{ fontFamily: 'var(--font-body)', color: 'var(--a-text)' }}>{u.name}</p>
                        <p className="text-xs" style={{ color: 'var(--a-muted)' }}>{u.email}</p>
                      </div>
                      <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                    </Link>
                  </td>
                  <td className="p-3"><span className="text-sm">{roleIcon(u.role)} {u.role}</span></td>
                  <td className="p-3" style={{ color: 'var(--a-text)' }}>{u.department}</td>
                  <td className="p-3 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${u.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {u.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-3 text-center">
                    <button onClick={() => toggleActive(u._id, u.isActive)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold ${u.isActive ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'}`}>
                      {u.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md p-6 rounded-2xl" style={{ background: 'var(--a-card)', border: '1px solid var(--a-border)' }}
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl" style={{ fontFamily: 'var(--font-display)', color: 'var(--a-primary)' }}>Register New User</h2>
                <button onClick={() => setShowModal(false)}><X size={20} style={{ color: 'var(--a-muted)' }} /></button>
              </div>

              <div className="space-y-3">
                <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Full Name" className="w-full px-4 py-2.5 rounded-xl border text-sm" style={{ background: 'var(--a-bg)', borderColor: 'var(--a-border)', color: 'var(--a-text)' }} />
                <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="Email" type="email" className="w-full px-4 py-2.5 rounded-xl border text-sm" style={{ background: 'var(--a-bg)', borderColor: 'var(--a-border)', color: 'var(--a-text)' }} />
                <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="Password" type="password" className="w-full px-4 py-2.5 rounded-xl border text-sm" style={{ background: 'var(--a-bg)', borderColor: 'var(--a-border)', color: 'var(--a-text)' }} />

                <div className="grid grid-cols-2 gap-3">
                  <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className="px-3 py-2.5 rounded-xl border text-sm" style={{ background: 'var(--a-bg)', borderColor: 'var(--a-border)', color: 'var(--a-text)' }}>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} className="px-3 py-2.5 rounded-xl border text-sm" style={{ background: 'var(--a-bg)', borderColor: 'var(--a-border)', color: 'var(--a-text)' }}>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>

                {form.role === 'student' && (
                  <div className="grid grid-cols-2 gap-3">
                    <input value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} placeholder="Roll Number" className="px-4 py-2.5 rounded-xl border text-sm" style={{ background: 'var(--a-bg)', borderColor: 'var(--a-border)', color: 'var(--a-text)' }} />
                    <select value={form.semester} onChange={(e) => setForm({ ...form, semester: Number(e.target.value) })} className="px-3 py-2.5 rounded-xl border text-sm" style={{ background: 'var(--a-bg)', borderColor: 'var(--a-border)', color: 'var(--a-text)' }}>
                      {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                    </select>
                  </div>
                )}

                <button onClick={createUser} disabled={creating}
                  className="w-full py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 disabled:opacity-50 transition-colors"
                  style={{ fontFamily: 'var(--font-body)' }}>
                  {creating ? 'Creating...' : `Register ${form.role}`}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-64"><div className="pencil-loader w-48" /></div>}>
      <UsersContent />
    </Suspense>
  );
}
