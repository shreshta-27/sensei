'use client';

import Link from 'next/link';
import { useEffect, useState, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Search, Users, X, ArrowRight, ArrowLeft, Download } from 'lucide-react';
import { useSearchParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import api from '@/lib/axios';

const DEPARTMENTS = ['CSE', 'IT', 'BTECH', 'AI'];
const ROLES = ['student', 'teacher', 'admin'];

interface UserItem { _id: string; name: string; email: string; role: string; department: string; studentId?: string; isActive: boolean; createdAt: string; }

const ROLE_META: Record<string, { emoji: string; color: string; bg: string }> = {
  student: { emoji: '🎓', color: '#7C3AED', bg: 'rgba(237,233,254,0.7)' },
  teacher: { emoji: '📐', color: '#3B82F6', bg: 'rgba(219,234,254,0.7)' },
  admin:   { emoji: '🌌', color: '#D97706', bg: 'rgba(254,249,195,0.7)' },
};

function UsersContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [users, setUsers]         = useState<UserItem[]>([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [search, setSearch]       = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [deptFilter, setDeptFilter] = useState(searchParams.get('department') || '');
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [creating, setCreating]   = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'student', department: 'CSE', studentId: '', semester: 1 });

  const fetchUsers = () => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), limit: '20' });
    if (search) params.set('search', search);
    if (roleFilter) params.set('role', roleFilter);
    if (deptFilter) params.set('department', deptFilter);
    api.get(`/api/admin/users?${params}`)
      .then(({ data }) => { setUsers(data.users || []); setTotal(data.total || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
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
        studentId: form.role === 'student' ? form.studentId : undefined,
      });
      toast.success(`${form.role} registered successfully!`);
      setShowModal(false);
      setForm({ name: '', email: '', password: '', role: 'student', department: 'CSE', studentId: '', semester: 1 });
      fetchUsers();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Failed to create user');
    } finally { setCreating(false); }
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    try {
      await api.patch(`/api/admin/users/${id}`, { isActive: !isActive });
      toast.success(isActive ? 'User deactivated' : 'User activated');
      fetchUsers();
    } catch { toast.error('Failed to update'); }
  };

  const handleExport = async () => {
    try {
      const response = await api.get('/api/admin/users/export', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url; link.setAttribute('download', 'users.csv');
      document.body.appendChild(link); link.click(); link.remove();
    } catch { toast.error('Export failed'); }
  };

  const inputStyle = {
    background: 'rgba(255,255,255,0.6)',
    backdropFilter: 'blur(8px)',
    border: '1px solid rgba(124,58,237,0.15)',
    borderRadius: '12px',
    color: 'var(--adm-text)',
    outline: 'none',
    fontFamily: 'Inter, sans-serif',
    fontSize: '0.875rem',
    padding: '8px 12px',
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <button
          onClick={() => router.push('/admin')}
          className="adm-back-btn mb-4"
        >
          <ArrowLeft size={15} />
          <span>Back to Dashboard</span>
        </button>
      </motion.div>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Users size={24} style={{ color: 'var(--adm-accent)' }} />
            <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--adm-text)', fontFamily: 'Space Grotesk, sans-serif' }}>
              User Management
            </h1>
          </div>
          <p className="text-sm" style={{ color: 'var(--adm-text-muted)' }}>Total: {total} users</p>
        </div>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
            style={{ background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(8px)', border: '1px solid rgba(124,58,237,0.15)', color: 'var(--adm-text-sub)' }}
          >
            <Download size={15} /> Export CSV
          </button>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all"
            style={{ background: 'linear-gradient(135deg, var(--adm-accent), #A78BFA)', boxShadow: '0 4px 12px rgba(124,58,237,0.3)' }}
          >
            <UserPlus size={15} /> Add User
          </button>
        </div>
      </motion.div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--adm-text-muted)' }} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchUsers()}
            placeholder="Search by name…"
            className="w-full pl-9 pr-4"
            style={inputStyle}
          />
        </div>
        <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }} style={inputStyle}>
          <option value="">All Roles</option>
          {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
        </select>
        <select value={deptFilter} onChange={(e) => { setDeptFilter(e.target.value); setPage(1); }} style={inputStyle}>
          <option value="">All Depts</option>
          {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 rounded-full border-[3px] border-t-transparent animate-spin" style={{ borderColor: 'var(--adm-accent)', borderTopColor: 'transparent' }} />
        </div>
      ) : (
        <div className="adm-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(124,58,237,0.1)', background: 'rgba(124,58,237,0.03)' }}>
                  {['User', 'Role', 'Dept', 'Status', 'Action'].map(col => (
                    <th key={col} className="px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest" style={{ color: 'var(--adm-text-muted)' }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((u, i) => {
                  const meta = ROLE_META[u.role] || ROLE_META.student;
                  return (
                    <motion.tr
                      key={u._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: i * 0.025 }}
                      style={{ borderBottom: '1px solid rgba(124,58,237,0.06)' }}
                      onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'rgba(124,58,237,0.03)'; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    >
                      <td className="px-4 py-3">
                        <Link href={`/admin/users/${u._id}`} className="flex items-center gap-3 group">
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ background: `linear-gradient(135deg, ${meta.color}, ${meta.color}99)` }}>
                            {u.name.charAt(0)}
                          </div>
                          <div>
                            <p className="text-sm font-semibold group-hover:text-purple-700 transition-colors" style={{ color: 'var(--adm-text)' }}>{u.name}</p>
                            <p className="text-[10px]" style={{ color: 'var(--adm-text-muted)' }}>{u.email}</p>
                          </div>
                          <ArrowRight size={13} className="opacity-0 group-hover:opacity-100 transition-opacity ml-1" style={{ color: 'var(--adm-accent)' }} />
                        </Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold capitalize" style={{ color: meta.color, background: meta.bg }}>
                          {meta.emoji} {u.role}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs font-semibold" style={{ color: 'var(--adm-text-sub)' }}>{u.department}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold`}
                          style={{
                            color: u.isActive ? '#16A34A' : '#DC2626',
                            background: u.isActive ? 'rgba(209,250,229,0.7)' : 'rgba(255,228,232,0.7)',
                          }}>
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: u.isActive ? '#22C55E' : '#EF4444' }} />
                          {u.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => toggleActive(u._id, u.isActive)}
                          className="px-3 py-1.5 rounded-xl text-[10px] font-bold transition-all"
                          style={{
                            color: u.isActive ? '#DC2626' : '#16A34A',
                            background: u.isActive ? 'rgba(255,228,232,0.7)' : 'rgba(209,250,229,0.7)',
                          }}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {total > 20 && (
            <div className="flex justify-center gap-2 p-4" style={{ borderTop: '1px solid rgba(124,58,237,0.08)' }}>
              {page > 1 && (
                <button onClick={() => setPage(p => p - 1)} className="px-4 py-2 rounded-xl text-xs font-semibold transition-all" style={{ background: 'rgba(124,58,237,0.08)', color: 'var(--adm-accent)' }}>← Prev</button>
              )}
              <span className="px-4 py-2 text-xs font-semibold" style={{ color: 'var(--adm-text-muted)' }}>Page {page} of {Math.ceil(total / 20)}</span>
              {page * 20 < total && (
                <button onClick={() => setPage(p => p + 1)} className="px-4 py-2 rounded-xl text-xs font-semibold transition-all" style={{ background: 'rgba(124,58,237,0.08)', color: 'var(--adm-accent)' }}>Next →</button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Create User Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
            style={{ backdropFilter: 'blur(6px)' }}
            onClick={() => setShowModal(false)}>
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }}
              className="w-full max-w-md p-6 rounded-3xl"
              style={{ background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255,255,255,0.96)', boxShadow: '0 24px 60px rgba(124,58,237,0.2)' }}
              onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-xl font-bold" style={{ color: 'var(--adm-text)', fontFamily: 'Space Grotesk, sans-serif' }}>Register New User</h2>
                <button onClick={() => setShowModal(false)} className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(124,58,237,0.08)', color: 'var(--adm-accent)' }}>
                  <X size={16} />
                </button>
              </div>
              <div className="space-y-3">
                {[
                  { placeholder: 'Full Name', type: 'text', key: 'name' },
                  { placeholder: 'Email', type: 'email', key: 'email' },
                  { placeholder: 'Password', type: 'password', key: 'password' },
                ].map(f => (
                  <input
                    key={f.key}
                    type={f.type}
                    placeholder={f.placeholder}
                    value={(form as any)[f.key]}
                    onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                    className="w-full"
                    style={inputStyle}
                  />
                ))}
                <div className="grid grid-cols-2 gap-3">
                  <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} style={{ ...inputStyle, width: '100%' }}>
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <select value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })} style={{ ...inputStyle, width: '100%' }}>
                    {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                {form.role === 'student' && (
                  <div className="grid grid-cols-2 gap-3">
                    <input value={form.studentId} onChange={(e) => setForm({ ...form, studentId: e.target.value })} placeholder="Roll Number" style={inputStyle} />
                    <select value={form.semester} onChange={(e) => setForm({ ...form, semester: Number(e.target.value) })} style={{ ...inputStyle, width: '100%' }}>
                      {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                    </select>
                  </div>
                )}
                <button
                  onClick={createUser}
                  disabled={creating}
                  className="w-full py-3 text-sm font-bold text-white rounded-xl disabled:opacity-60 transition-all"
                  style={{ background: 'linear-gradient(135deg, var(--adm-accent), #A78BFA)', boxShadow: '0 4px 12px rgba(124,58,237,0.3)' }}
                >
                  {creating ? 'Creating…' : `Register ${form.role}`}
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
    <Suspense fallback={
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 rounded-full border-[3px] border-t-transparent animate-spin" style={{ borderColor: 'var(--adm-accent)', borderTopColor: 'transparent' }} />
      </div>
    }>
      <UsersContent />
    </Suspense>
  );
}
