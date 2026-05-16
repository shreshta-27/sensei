'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Zap, TrendingUp, Users, Clock, AlertTriangle, Brain, Loader2, ArrowRight, CheckCircle } from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

const HEATMAP_DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const HEATMAP_HOURS = ['9am', '11am', '2pm', '4pm'];
const HEATMAP_VALS = [85, 92, 40, 60, 65, 75, 88, 70, 95, 82, 30, 50, 40, 55, 70, 45, 20, 35, 15, 30];

export default function ResourceOptimizerPage() {
  const [data, setData]   = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runOptimization = async () => {
    setLoading(true);
    toast.loading('Analyzing historical patterns & exam calendar…');
    try {
      const { data } = await api.post('/api/resource/optimize');
      setData(data.plan);
      toast.dismiss();
      toast.success('Optimization complete!');
    } catch {
      toast.dismiss();
      toast.error('Optimization failed');
    } finally { setLoading(false); }
  };

  const chartData = data?.demandForecast?.predictions || [
    { day: 'Mon', utilization: 40 }, { day: 'Tue', utilization: 65 },
    { day: 'Wed', utilization: 85 }, { day: 'Thu', utilization: 55 }, { day: 'Fri', utilization: 30 },
  ];
  const workloadAlerts = data?.workloadAnalysis?.alerts || [
    { teacherName: 'Dr. Mehta', issue: '6 consecutive morning sessions', severity: 'warning' },
    { teacherName: 'Prof. Smith', issue: 'Lab overload (12h+ daily)', severity: 'critical' },
  ];
  const budgetRecs = data?.budgetForecast?.recommendations || [
    { action: 'Reschedule CS-101 Lab', estimatedSavings: 15000, priority: 'high' },
    { action: 'Optimize Lighting in Block A', estimatedSavings: 5000, priority: 'medium' },
    { action: 'Faculty Workload Redistribution', estimatedSavings: 0, priority: 'high' },
  ];

  const tooltipStyle = {
    contentStyle: { background: 'rgba(255,255,255,0.92)', backdropFilter: 'blur(12px)', border: '1px solid rgba(124,58,237,0.15)', borderRadius: '12px', boxShadow: '0 4px 20px rgba(124,58,237,0.1)' },
    cursor: { fill: 'rgba(124,58,237,0.05)' },
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap size={24} style={{ color: '#F59E0B' }} />
            <h1 className="text-3xl font-black tracking-tight" style={{ color: 'var(--adm-text)', fontFamily: 'Space Grotesk, sans-serif' }}>
              Smart Resource Optimizer
            </h1>
          </div>
          <p className="text-sm" style={{ color: 'var(--adm-text-muted)' }}>AI-driven predictive workload & budget allocator</p>
        </div>
        <button
          onClick={runOptimization}
          disabled={loading}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60 transition-all flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #F59E0B, #EF4444)', boxShadow: '0 4px 12px rgba(245,158,11,0.3)' }}
        >
          {loading ? <Loader2 size={16} className="animate-spin" /> : <Brain size={16} />}
          Optimize Resources
        </button>
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-5">
        {/* Charts */}
        <div className="lg:col-span-2 space-y-5">
          {/* Demand Forecast */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="adm-card p-6">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp size={16} style={{ color: 'var(--adm-accent)' }} />
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--adm-text)' }}>Resource Demand Forecast</p>
            </div>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(124,58,237,0.07)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--adm-text-muted)" style={{ fontSize: 11 }} />
                <YAxis stroke="var(--adm-text-muted)" style={{ fontSize: 11 }} />
                <Tooltip {...tooltipStyle} />
                <Line type="monotone" dataKey="utilization" stroke="var(--adm-accent)" strokeWidth={2.5} dot={{ fill: 'var(--adm-accent)', r: 4 }} activeDot={{ r: 6, stroke: 'white', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Workload + Budget */}
          <div className="grid sm:grid-cols-2 gap-5">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }} className="adm-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <Users size={15} style={{ color: '#8B5CF6' }} />
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--adm-text)' }}>Faculty Workload Alerts</p>
              </div>
              <div className="space-y-2">
                {workloadAlerts.map((alert: any, i: number) => {
                  const isCritical = alert.severity === 'critical';
                  return (
                    <div key={i} className="p-3 rounded-xl flex gap-3 items-start"
                      style={{ background: isCritical ? 'rgba(255,228,232,0.7)' : 'rgba(254,249,195,0.7)', border: `1px solid ${isCritical ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}` }}>
                      <AlertTriangle size={14} style={{ color: isCritical ? '#EF4444' : '#F59E0B', marginTop: 1, flexShrink: 0 }} />
                      <div>
                        <p className="text-xs font-bold" style={{ color: 'var(--adm-text)' }}>{alert.teacherName}</p>
                        <p className="text-[10px]" style={{ color: 'var(--adm-text-muted)' }}>{alert.issue}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }} className="adm-card p-5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp size={15} style={{ color: '#22C55E' }} />
                <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--adm-text)' }}>Budget Forecast</p>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs" style={{ color: 'var(--adm-text-muted)' }}>Projected Spend</span>
                  <span className="text-lg font-black" style={{ color: 'var(--adm-text)', fontFamily: 'Space Grotesk, sans-serif' }}>₹{(data?.budgetForecast?.projectedSpend || 520000).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs" style={{ color: 'var(--adm-text-muted)' }}>Potential Savings</span>
                  <span className="text-lg font-black" style={{ color: '#16A34A', fontFamily: 'Space Grotesk, sans-serif' }}>+₹{(data?.budgetForecast?.totalPotentialSavings || 50000).toLocaleString()}</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'rgba(124,58,237,0.1)' }}>
                  <div className="h-full rounded-full" style={{ width: '85%', background: 'linear-gradient(90deg, var(--adm-accent), #A78BFA)' }} />
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Right panel */}
        <div className="space-y-5">
          {/* Heatmap */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }} className="adm-card p-5">
            <div className="flex items-center gap-2 mb-4">
              <Clock size={15} style={{ color: 'var(--adm-accent)' }} />
              <p className="text-xs font-bold uppercase tracking-widest" style={{ color: 'var(--adm-text)' }}>Lab Utilization Heatmap</p>
            </div>
            <div className="grid gap-1.5" style={{ gridTemplateColumns: `repeat(${HEATMAP_HOURS.length}, 1fr)` }}>
              {HEATMAP_DAYS.map((day, di) =>
                HEATMAP_HOURS.map((hour, hi) => {
                  const val = HEATMAP_VALS[di * HEATMAP_HOURS.length + hi] ?? 50;
                  const alpha = val / 100;
                  return (
                    <div key={`${day}-${hour}`} className="rounded-lg flex flex-col items-center justify-center p-1.5 cursor-default transition-transform hover:scale-105"
                      style={{ background: `rgba(124,58,237,${0.08 + alpha * 0.5})`, aspectRatio: '1' }}
                      title={`${day} ${hour}: ${val}%`}>
                      <span className="text-[8px] font-bold text-center leading-tight" style={{ color: 'var(--adm-text)', opacity: 0.7 }}>{day}</span>
                      <span className="text-[7px] text-center" style={{ color: 'var(--adm-text-muted)' }}>{hour}</span>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>

          {/* Recommendations */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.26 }}
            className="adm-card p-5" style={{ border: '1.5px solid rgba(124,58,237,0.2)', background: 'rgba(237,233,254,0.4)' }}>
            <p className="text-xs font-bold uppercase tracking-widest mb-4" style={{ color: 'var(--adm-text)' }}>Prioritized Actions</p>
            <div className="space-y-3">
              {budgetRecs.map((rec: any, i: number) => (
                <div key={i} className="flex justify-between items-start gap-2 pb-3 last:pb-0" style={{ borderBottom: i < budgetRecs.length - 1 ? '1px solid rgba(124,58,237,0.1)' : 'none' }}>
                  <div>
                    <p className="text-xs font-semibold" style={{ color: 'var(--adm-text)' }}>{rec.action}</p>
                    <p className="text-[10px] mt-0.5" style={{ color: '#16A34A' }}>Est. Savings: ₹{rec.estimatedSavings.toLocaleString()}</p>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase flex-shrink-0"
                    style={{ color: rec.priority === 'high' ? '#DC2626' : '#D97706', background: rec.priority === 'high' ? 'rgba(255,228,232,0.8)' : 'rgba(254,249,195,0.8)' }}>
                    {rec.priority}
                  </span>
                </div>
              ))}
            </div>
            <button
              className="w-full mt-4 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all"
              style={{ background: 'linear-gradient(135deg, var(--adm-accent), #A78BFA)', boxShadow: '0 4px 12px rgba(124,58,237,0.25)' }}
              onClick={() => toast('🚀 Applying reallocation suggestions…')}
            >
              Apply Reallocation <ArrowRight size={14} />
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
