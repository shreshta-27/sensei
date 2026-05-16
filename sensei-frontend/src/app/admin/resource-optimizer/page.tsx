'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as ReTooltip, ResponsiveContainer, BarChart, Bar, Cell } from 'recharts';
import { Zap, TrendingUp, Users, Calendar, AlertTriangle, CheckCircle, BarChart3, Clock, ArrowRight, Brain, Loader2 } from 'lucide-react';
import api from '@/lib/axios';
import toast from 'react-hot-toast';

export default function ResourceOptimizerPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runOptimization = async () => {
    setLoading(true);
    toast.loading('Analyzing historical patterns & exam calendar...');
    try {
      const { data } = await api.post('/api/resource/optimize');
      setData(data.plan);
      toast.dismiss();
      toast.success('Optimization complete!');
    } catch (err) {
      toast.dismiss();
      toast.error('Optimization failed');
    } finally {
      setLoading(false);
    }
  };

  const mockHeatmap = [
    { day: 'Mon', hour: '9am', val: 85 }, { day: 'Mon', hour: '11am', val: 92 }, { day: 'Mon', hour: '2pm', val: 40 },
    { day: 'Tue', hour: '9am', val: 60 }, { day: 'Tue', hour: '11am', val: 75 }, { day: 'Tue', hour: '2pm', val: 88 },
    { day: 'Wed', hour: '9am', val: 95 }, { day: 'Wed', hour: '11am', val: 82 }, { day: 'Wed', hour: '2pm', val: 30 },
    { day: 'Thu', hour: '9am', val: 40 }, { day: 'Thu', hour: '11am', val: 55 }, { day: 'Thu', hour: '2pm', val: 70 },
    { day: 'Fri', hour: '9am', val: 20 }, { day: 'Fri', hour: '11am', val: 35 }, { day: 'Fri', hour: '2pm', val: 15 },
  ];

  return (
    <div className="space-y-8 pb-20 cosmos-container text-white">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="cosmos-title text-4xl">Smart Resource Optimizer</h1>
          <p className="cosmos-text opacity-70">AI-driven predictive workload & budget allocator</p>
        </div>
        <button 
            onClick={runOptimization} 
            disabled={loading}
            className="cosmos-btn-primary flex items-center gap-2"
        >
          {loading ? <Loader2 className="animate-spin" /> : <Brain size={20} />} OPTIMIZE RESOURCES
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {}
        <div className="lg:col-span-2 space-y-6">
            <div className="cosmos-card p-6 bg-white/5">
                <h2 className="text-xl font-display mb-6 flex items-center gap-2">
                    <TrendingUp className="text-cyan-400" /> Resource Demand Forecast
                </h2>
                <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data?.demandForecast?.predictions || [
                            { day: 'Mon', utilization: 40 }, { day: 'Tue', utilization: 65 }, { day: 'Wed', utilization: 85 }, 
                            { day: 'Thu', utilization: 55 }, { day: 'Fri', utilization: 30 }
                        ]}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff11" />
                            <XAxis dataKey="day" stroke="#ffffff66" />
                            <YAxis stroke="#ffffff66" />
                            <ReTooltip contentStyle={{ background: '#0F172A', border: '1px solid #1E293B', color: '#fff' }} />
                            <Line type="monotone" dataKey="utilization" stroke="#22d3ee" strokeWidth={3} dot={{ fill: '#22d3ee' }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="cosmos-card p-6 bg-white/5">
                    <h3 className="text-lg font-display mb-4 flex items-center gap-2">
                        <Users className="text-purple-400" /> Faculty Workload Alerts
                    </h3>
                    <div className="space-y-3">
                        {(data?.workloadAnalysis?.alerts || [
                            { teacherName: "Dr. Mehta", issue: "6 consecutive morning sessions", severity: "warning" },
                            { teacherName: "Prof. Smith", issue: "Lab overload (12h+ daily)", severity: "critical" }
                        ]).map((alert: any, i: number) => (
                            <div key={i} className={`p-3 rounded-lg border flex gap-3 ${alert.severity === 'critical' ? 'bg-red-500/10 border-red-500/30' : 'bg-orange-500/10 border-orange-500/30'}`}>
                                <AlertTriangle size={18} className={alert.severity === 'critical' ? 'text-red-400' : 'text-orange-400'} />
                                <div>
                                    <p className="text-xs font-bold">{alert.teacherName}</p>
                                    <p className="text-[10px] opacity-70">{alert.issue}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="cosmos-card p-6 bg-white/5">
                    <h3 className="text-lg font-display mb-4 flex items-center gap-2">
                        <BarChart3 className="text-green-400" /> Budget Forecast
                    </h3>
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-xs opacity-60">Projected Spend</span>
                            <span className="text-xl font-display">₹{(data?.budgetForecast?.projectedSpend || 520000).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-green-400">
                            <span className="text-xs">Potential Savings</span>
                            <span className="text-xl font-display">+ ₹{(data?.budgetForecast?.totalPotentialSavings || 50000).toLocaleString()}</span>
                        </div>
                        <div className="w-full bg-white/10 h-2 rounded-full overflow-hidden">
                            <div className="h-full bg-green-500" style={{ width: '85%' }} />
                        </div>
                        <p className="text-[10px] text-center opacity-50 italic">AI Recommendation: "Rescheduling off-peak Lab sessions"</p>
                    </div>
                </div>
            </div>
        </div>

        {}
        <div className="space-y-6">
            <div className="cosmos-card p-6 bg-white/5">
                <h3 className="text-lg font-display mb-4 flex items-center gap-2">
                    <Clock className="text-cyan-400" /> Lab Utilization Heatmap
                </h3>
                <div className="grid grid-cols-3 gap-2">
                    {mockHeatmap.map((item, i) => (
                        <div key={i} className="flex flex-col items-center">
                            <div 
                                className="w-full aspect-video rounded border border-white/10 transition-colors" 
                                style={{ backgroundColor: `rgba(34, 211, 238, ${item.val / 100})` }}
                                title={`${item.day} ${item.hour}: ${item.val}%`}
                            />
                            <span className="text-[8px] mt-1 opacity-50 uppercase">{item.day} {item.hour}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="cosmos-card p-6 bg-cyan-500/10 border border-cyan-500/30">
                <h3 className="text-lg font-display mb-4">Prioritized Actions</h3>
                <div className="space-y-4">
                    {(data?.budgetForecast?.recommendations || [
                        { action: "Reschedule CS-101 Lab", estimatedSavings: 15000, priority: "high" },
                        { action: "Optimize Lighting in Block A", estimatedSavings: 5000, priority: "medium" },
                        { action: "Faculty Workload Redistribution", estimatedSavings: 0, priority: "high" }
                    ]).map((rec: any, i: number) => (
                        <div key={i} className="flex justify-between items-start border-b border-white/10 pb-3 last:border-0 last:pb-0">
                            <div>
                                <p className="text-sm font-bold">{rec.action}</p>
                                <p className="text-[10px] text-green-400">Est. Savings: ₹{rec.estimatedSavings.toLocaleString()}</p>
                            </div>
                            <span className={`text-[8px] px-2 py-0.5 rounded font-bold uppercase ${rec.priority === 'high' ? 'bg-red-500 text-white' : 'bg-cyan-500 text-black'}`}>
                                {rec.priority}
                            </span>
                        </div>
                    ))}
                </div>
                <button className="w-full mt-6 py-3 bg-cyan-500 text-black font-display rounded-xl flex items-center justify-center gap-2 hover:bg-cyan-400 transition-colors">
                    APPLY SUGGESTED REALLOCATION <ArrowRight size={16} />
                </button>
            </div>
        </div>
      </div>
    </div>
  );
}
