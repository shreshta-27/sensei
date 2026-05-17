'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Briefcase, Plus, MapPin, Users, DollarSign, Clock, Search,
  CheckCircle2, XCircle, ArrowRight, Building2, FileText,
  GraduationCap, Filter, Eye, Send
} from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';
import StickyCard from '@/components/faculty/StickyCard';
import ComicButton from '@/components/faculty/ComicButton';
import RiskBadge from '@/components/faculty/RiskBadge';
import TeacherAvatar from '@/components/faculty/TeacherAvatar';

type StatusFilter = 'all' | 'open' | 'in_review' | 'closed';

type JobPosting = {
  _id: string;
  title: string;
  company: string;
  type: string;
  location: string;
  salary: string;
  postedOn: string;
  deadline: string;
  applicants: number;
  status: 'open' | 'in_review' | 'closed';
  description: string;
};

type Applicant = {
  _id: string;
  name: string;
  cgpa: number;
  skills: string[];
  matchScore: number;
  risk: 'high' | 'medium' | 'low';
};

export default function PlacementPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');
  const [showPostForm, setShowPostForm] = useState(false);
  const [selectedJob, setSelectedJob] = useState<JobPosting | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [form, setForm] = useState({ title: '', company: '', type: 'Full-time', location: '', salary: '', deadline: '', description: '' });

  useEffect(() => {
    api.get('/api/teacher/placement/jobs')
      .then(r => setJobs(r.data.jobs || r.data || []))
      .catch(() => setJobs(mockJobs))
      .finally(() => setLoading(false));
  }, []);

  const fetchApplicants = async (jobId: string) => {
    try {
      const { data } = await api.get(`/api/teacher/placement/applicants/${jobId}`);
      setApplicants(data.applicants || data || []);
    } catch { setApplicants(mockApplicants); }
  };

  const filteredJobs = jobs
    .filter(j => statusFilter === 'all' || j.status === statusFilter)
    .filter(j => !search || j.title.toLowerCase().includes(search.toLowerCase()) || j.company.toLowerCase().includes(search.toLowerCase()));

  const stats = {
    total: jobs.length,
    open: jobs.filter(j => j.status === 'open').length,
    inReview: jobs.filter(j => j.status === 'in_review').length,
    totalApps: jobs.reduce((s, j) => s + j.applicants, 0),
  };

  if (loading) return <div className="text-center py-20 font-handwrite text-2xl text-[var(--text-muted)]">Loading placements…</div>;

  return (
    <div className="page-mobile-pad space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="font-display text-4xl text-[var(--text-primary)] flex items-center gap-2">
            <Briefcase size={34} className="text-[var(--accent-purple)]" /> Placement Board
          </h1>
          <p className="font-handwrite text-xl text-[var(--text-muted)]">Manage job postings & student applications</p>
        </div>
        <ComicButton variant="primary" icon={<Plus size={16} />} onClick={() => setShowPostForm(true)}>Post Job</ComicButton>
      </motion.div>

      {/* KPI Row */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
      >
        <StickyCard color="blue"><p className="font-display text-3xl text-[var(--text-primary)]">{stats.total}</p><p className="font-ui text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Total Postings</p></StickyCard>
        <StickyCard color="green"><p className="font-display text-3xl text-[var(--text-primary)]">{stats.open}</p><p className="font-ui text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Open</p></StickyCard>
        <StickyCard color="orange"><p className="font-display text-3xl text-[var(--text-primary)]">{stats.inReview}</p><p className="font-ui text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">In Review</p></StickyCard>
        <StickyCard color="purple"><p className="font-display text-3xl text-[var(--text-primary)]">{stats.totalApps}</p><p className="font-ui text-[10px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">Applications</p></StickyCard>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ── Job Listings ── */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {(['all', 'open', 'in_review', 'closed'] as const).map(f => (
              <button key={f} onClick={() => setStatusFilter(f)}
                className={`px-4 py-1.5 rounded-full font-ui text-xs font-bold border-2 transition-all ${statusFilter === f ? 'bg-[var(--accent-purple)] text-white border-[var(--accent-purple)]' : 'bg-white text-[var(--text-secondary)] border-[var(--border-card)]'}`}>
                {f === 'all' ? 'All' : f === 'in_review' ? 'In Review' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
            <div className="relative ml-auto">
              <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
              <input type="text" placeholder="Search jobs…" value={search} onChange={e => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-full bg-white border-2 border-[var(--border-card)] font-ui text-xs outline-none focus:border-[var(--accent-purple)] w-[160px]" />
            </div>
          </div>

          <div className="space-y-4">
            {filteredJobs.map((job, i) => (
              <motion.div key={job._id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <StickyCard color={i % 2 === 0 ? 'blue' : 'green'} className="!p-5 cursor-pointer"
                  onClick={() => { setSelectedJob(job); fetchApplicants(job._id); }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-display text-lg text-[var(--text-primary)]">{job.title}</h3>
                        <span className={`font-ui text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          job.status === 'open' ? 'bg-green-50 text-green-700' :
                          job.status === 'in_review' ? 'bg-amber-50 text-amber-700' : 'bg-gray-50 text-gray-700'
                        }`}>{job.status === 'in_review' ? 'In Review' : job.status}</span>
                      </div>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5">
                        <span className="flex items-center gap-1 font-ui text-xs text-[var(--text-muted)]"><Building2 size={12} />{job.company}</span>
                        <span className="flex items-center gap-1 font-ui text-xs text-[var(--text-muted)]"><MapPin size={12} />{job.location}</span>
                        <span className="flex items-center gap-1 font-ui text-xs text-[var(--text-muted)]"><DollarSign size={12} />{job.salary}</span>
                      </div>
                      <p className="font-body text-xs text-[var(--text-secondary)] mt-2 line-clamp-2">{job.description}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="flex items-center gap-1 font-ui text-[10px] text-[var(--text-muted)]"><Clock size={10} />Deadline: {job.deadline}</span>
                        <span className="flex items-center gap-1 font-ui text-[10px] font-bold text-[var(--accent-purple)]"><Users size={10} />{job.applicants} applicants</span>
                      </div>
                    </div>
                    <ArrowRight size={18} className="text-[var(--text-muted)] shrink-0 self-center" />
                  </div>
                </StickyCard>
              </motion.div>
            ))}
            {filteredJobs.length === 0 && (
              <StickyCard color="yellow" className="text-center py-12">
                <Briefcase size={40} className="mx-auto opacity-30 mb-3" />
                <p className="font-handwrite text-2xl text-[var(--text-muted)]">No jobs found</p>
              </StickyCard>
            )}
          </div>
        </div>

        {/* ── Applicants Panel ── */}
        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
          className="space-y-4"
        >
          <StickyCard color="purple" pinned className="!p-5">
            <h3 className="font-display text-xl mb-1">{selectedJob ? selectedJob.title : ' Applicants'}</h3>
            <p className="font-ui text-xs text-[var(--text-muted)]">{selectedJob ? `${applicants.length} matches` : 'Select a job to view applicants'}</p>
          </StickyCard>

          {selectedJob && (
            <div className="space-y-3">
              {applicants.map((a, i) => (
                <motion.div key={a._id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                  <StickyCard color={['yellow','blue','green','pink','purple','orange'][i % 6] as any} className="!p-4">
                    <div className="flex items-start gap-3">
                      <TeacherAvatar name={a.name} size={36} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-ui text-sm font-bold text-[var(--text-primary)] truncate">{a.name}</h4>
                          <span className="font-mono text-[11px] font-bold">{a.cgpa.toFixed(1)} CGPA</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-1">
                          <span className="font-ui text-[10px] font-bold px-2 py-0.5 rounded-full bg-[var(--accent-green)]/15 text-[var(--accent-green)]">{a.matchScore}% match</span>
                          <RiskBadge level={a.risk} label={a.risk.charAt(0).toUpperCase() + a.risk.slice(1)} />
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {a.skills.map((s, si) => (
                            <span key={si} className="font-ui text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/60 text-[var(--text-muted)]">{s}</span>
                          ))}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <button className="flex-1 font-ui text-[11px] font-bold text-[var(--accent-green)] bg-green-50 px-2 py-1 rounded-lg hover:bg-green-100 transition">Approve</button>
                          <button className="flex-1 font-ui text-[11px] font-bold text-[var(--accent-red)] bg-red-50 px-2 py-1 rounded-lg hover:bg-red-100 transition">Reject</button>
                        </div>
                      </div>
                    </div>
                  </StickyCard>
                </motion.div>
              ))}
              {applicants.length === 0 && (
                <div className="text-center py-8"><p className="font-handwrite text-lg text-[var(--text-muted)]">No applicants yet</p></div>
              )}
            </div>
          )}
          {!selectedJob && (
            <div className="text-center py-12">
              <Eye size={32} className="mx-auto text-[var(--text-muted)] opacity-30 mb-2" />
              <p className="font-handwrite text-lg text-[var(--text-muted)]">Click a job to see students</p>
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Post Job Modal ── */}
      <AnimatePresence>
        {showPostForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowPostForm(false)}
          >
            <motion.div initial={{ scale: 0.92, rotate: -1 }} animate={{ scale: 1, rotate: 0 }} exit={{ scale: 0.9 }}
              onClick={e => e.stopPropagation()} className="w-full max-w-lg sticky-card bg-[var(--sticky-yellow)]"
            >
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display text-2xl">Post New Opportunity</h2>
                <button onClick={() => setShowPostForm(false)} className="w-8 h-8 rounded-full bg-white/60 flex items-center justify-center font-ui text-sm text-red-400"><XCircle size={14} /></button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-ui text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-1 block mb-1">Role Title</label>
                    <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Frontend Intern"
                      className="w-full bg-white/80 border-b-3 border-[var(--border-doodle)] border-t-0 border-l-0 border-r-0 px-3 py-2 font-body text-base outline-none focus:border-[var(--accent-purple)]" />
                  </div>
                  <div>
                    <label className="font-ui text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-1 block mb-1">Company</label>
                    <input value={form.company} onChange={e => setForm(f => ({ ...f, company: e.target.value }))} placeholder="Company name"
                      className="w-full bg-white/80 border-b-3 border-[var(--border-doodle)] border-t-0 border-l-0 border-r-0 px-3 py-2 font-body text-base outline-none focus:border-[var(--accent-purple)]" />
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="font-ui text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-1 block mb-1">Location</label>
                    <input value={form.location} onChange={e => setForm(f => ({ ...f, location: e.target.value }))} placeholder="Remote / City"
                      className="w-full bg-white/80 border-2 border-[var(--border-doodle)] rounded-xl px-3 py-2 font-ui text-sm outline-none" />
                  </div>
                  <div>
                    <label className="font-ui text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-1 block mb-1">Type</label>
                    <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                      className="w-full bg-white/80 border-2 border-[var(--border-doodle)] rounded-xl px-3 py-2 font-ui text-sm outline-none">
                      <option>Full-time</option><option>Internship</option><option>Part-time</option><option>Contract</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="font-ui text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-1 block mb-1">Stipend / Salary</label>
                    <input value={form.salary} onChange={e => setForm(f => ({ ...f, salary: e.target.value }))} placeholder="e.g. ₹35,000/mo"
                      className="w-full bg-white/80 border-2 border-[var(--border-doodle)] rounded-xl px-3 py-2 font-ui text-sm outline-none" />
                  </div>
                  <div>
                    <label className="font-ui text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-1 block mb-1">Apply By</label>
                    <input type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))}
                      className="w-full bg-white/80 border-2 border-[var(--border-doodle)] rounded-xl px-3 py-2 font-ui text-sm outline-none" />
                  </div>
                </div>
                <div>
                  <label className="font-ui text-[10px] font-black text-[var(--text-muted)] uppercase tracking-wider ml-1 block mb-1">Description</label>
                  <textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    placeholder="Brief description of the role and requirements…"
                    className="w-full bg-white/80 border-2 border-[var(--border-doodle)] rounded-xl px-3 py-2 font-body text-sm outline-none focus:border-[var(--accent-purple)] h-20 resize-none" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button onClick={() => setShowPostForm(false)} className="flex-1 py-3 rounded-xl font-ui text-sm font-bold text-[var(--text-secondary)] hover:bg-white/50">Cancel</button>
                  <button onClick={() => { toast.success('Job posted!'); setShowPostForm(false); setForm({ title: '', company: '', type: 'Full-time', location: '', salary: '', deadline: '', description: '' }); }}
                    className="flex-1 py-3 rounded-xl bg-[var(--accent-purple)] text-white font-ui font-bold shadow-[var(--shadow-sticky)] hover:-translate-y-0.5">
                    <Send size={15} className="inline mr-1" /> Publish
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Mock Data ── */
const mockJobs: JobPosting[] = [
  { _id: 'j1', title: 'Frontend Engineering Intern', company: 'Google', type: 'Internship', location: 'Bangalore / Remote', salary: '₹35,000 / mo', postedOn: '2024-05-10', deadline: '2024-06-15', applicants: 24, status: 'open', description: 'Work on Material Design web components. Requires React, TypeScript, and CSS. 3–6 months, remote-friendly.' },
  { _id: 'j2', title: 'Backend Developer', company: 'Infosys', type: 'Full-time', location: 'Pune', salary: '₹12–18 LPA', postedOn: '2024-05-08', deadline: '2024-06-01', applicants: 56, status: 'in_review', description: 'Design and maintain Java/Spring microservices for the enterprise platform. Strong REST API skills required.' },
  { _id: 'j3', title: 'Machine Learning Intern', company: 'Microsoft Research', type: 'Internship', location: 'Hyderabad', salary: '₹50,000 / mo', postedOn: '2024-04-28', deadline: '2024-05-20', applicants: 19, status: 'open', description: 'Assist with LLM fine-tuning projects. Python, PyTorch, and ML experience required.' },
  { _id: 'j4', title: 'Data Analyst', company: 'TCS', type: 'Full-time', location: 'Mumbai', salary: '₹8–12 LPA', postedOn: '2024-03-15', deadline: '2024-04-30', applicants: 89, status: 'in_review', description: 'Analyse business data and build dashboards. SQL, Python, and Tableau essential.' },
  { _id: 'j5', title: 'Cloud Engineering Intern', company: 'AWS Educate', type: 'Internship', location: 'Remote', salary: '₹30,000 / mo', postedOn: '2024-02-10', deadline: '2024-03-31', applicants: 37, status: 'closed', description: 'Deploy and manage AWS infrastructure for student projects. Cloud fundamentals required.' },
];

const mockApplicants: Applicant[] = [
  { _id: 'a1', name: 'Arjun Patel', cgpa: 8.6, skills: ['React', 'TypeScript', 'Node.js'], matchScore: 92, risk: 'low' },
  { _id: 'a2', name: 'Priya Sharma', cgpa: 9.1, skills: ['Python', 'PyTorch', 'NLP'], matchScore: 88, risk: 'low' },
  { _id: 'a3', name: 'Rohit Kumar', cgpa: 7.8, skills: ['Java', 'Spring Boot', 'SQL'], matchScore: 72, risk: 'medium' },
  { _id: 'a4', name: 'Sneha Reddy', cgpa: 9.4, skills: ['React', 'Figma', 'CSS'], matchScore: 95, risk: 'low' },
  { _id: 'a5', name: 'Amit Singh', cgpa: 7.2, skills: ['Python', 'ML'], matchScore: 68, risk: 'high' },
];
