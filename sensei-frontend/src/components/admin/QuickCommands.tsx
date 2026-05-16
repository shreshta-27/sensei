'use client';

import { motion } from 'framer-motion';
import { Megaphone, FileText, Cpu, Download, AlertOctagon, HardDrive } from 'lucide-react';
import toast from 'react-hot-toast';

interface Command {
  label: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  action: () => void;
}

const COMMANDS: Command[] = [
  {
    label: 'Broadcast Announcement',
    icon: <Megaphone size={18} />,
    color: '#3B82F6',
    bg: '#EFF6FF',
    action: () => toast('📢 Announcement broadcast initiated', { icon: '📡' }),
  },
  {
    label: 'Generate Institutional Report',
    icon: <FileText size={18} />,
    color: '#8B5CF6',
    bg: '#F5F3FF',
    action: () => toast.loading('Generating institutional report...'),
  },
  {
    label: 'Run AI Diagnostics',
    icon: <Cpu size={18} />,
    color: '#0EA5E9',
    bg: '#F0F9FF',
    action: () => toast.loading('Running AI system diagnostics...'),
  },
  {
    label: 'Export NAAC Report',
    icon: <Download size={18} />,
    color: '#F59E0B',
    bg: '#FFFBEB',
    action: () => toast('📄 NAAC report export queued', { icon: '✅' }),
  },
  {
    label: 'Emergency Alert',
    icon: <AlertOctagon size={18} />,
    color: '#EF4444',
    bg: '#FEF2F2',
    action: () => toast.error('⚠️ Emergency alert requires confirmation'),
  },
  {
    label: 'System Backup',
    icon: <HardDrive size={18} />,
    color: '#6B7280',
    bg: '#F9FAFB',
    action: () => toast.loading('Initiating system backup...'),
  },
];

export default function QuickCommands() {
  return (
    <div className="adm-card h-full flex flex-col">
      <div
        className="px-5 py-4 border-b flex-shrink-0"
        style={{ borderColor: 'var(--adm-border-solid)' }}
      >
        <h3 className="adm-section-title">Quick Commands</h3>
      </div>

      <div className="flex-1 p-4 grid grid-cols-2 gap-2.5">
        {COMMANDS.map((cmd, i) => (
          <motion.button
            key={cmd.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.06 + 0.2, duration: 0.3 }}
            onClick={cmd.action}
            className="flex flex-col items-center gap-2 p-3 rounded-xl text-center transition-all duration-150 cursor-pointer"
            style={{
              background: cmd.bg,
              border: `1px solid ${cmd.color}22`,
            }}
            whileHover={{ scale: 1.03, boxShadow: `0 4px 16px ${cmd.color}22` }}
            whileTap={{ scale: 0.97 }}
          >
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: `${cmd.color}18`, color: cmd.color }}
            >
              {cmd.icon}
            </div>
            <p
              className="text-[10px] font-semibold leading-tight"
              style={{ color: 'var(--adm-text)' }}
            >
              {cmd.label}
            </p>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
