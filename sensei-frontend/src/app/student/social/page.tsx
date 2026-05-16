'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import LeaderboardTab from '../leaderboard/page';
import PollsTab from '../polls/page';
import HelpDeskTab from '../help-desk/page';
import { Users, Trophy, BarChart3, HelpCircle } from 'lucide-react';

export default function SocialPage() {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'polls' | 'helpdesk'>('leaderboard');

  const tabs = [
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy, color: '#FFD700' },
    { id: 'polls', label: 'Live Polls', icon: BarChart3, color: '#4CAF50' },
    { id: 'helpdesk', label: 'Help Desk', icon: HelpCircle, color: '#2196F3' }
  ] as const;

  return (
    <div className="w-full space-y-6">
      {}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-white p-8 rounded-3xl" style={{ border: '4px solid var(--comic-black)', boxShadow: '8px 8px 0 var(--comic-black)' }}>
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center border-2 border-black rotate-[-3deg]">
              <Users size={24} className="text-purple-600" />
            </div>
            <h1 className="font-fredoka text-4xl md:text-5xl font-black uppercase tracking-tight text-[var(--comic-black)]">
              Social Hub
            </h1>
          </div>
          <p className="font-fredoka text-gray-500 font-bold tracking-wide uppercase text-sm ml-1">
            Connect, Compete, and Collaborate!
          </p>
        </div>

        {}
        <div className="flex p-1.5 bg-gray-100 rounded-2xl border-2 border-black max-w-full overflow-x-auto hide-scrollbar">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative flex items-center gap-2 px-6 py-3 rounded-xl transition-all duration-300 font-fredoka font-bold uppercase text-sm whitespace-nowrap"
                style={{
                  color: isActive ? 'white' : 'var(--comic-black)',
                  textShadow: isActive ? '1px 1px 0px rgba(0,0,0,0.5)' : 'none'
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="social-tab-indicator"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: tab.color, border: '2px solid black' }}
                    transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10 flex items-center gap-2">
                  <Icon size={18} />
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {}
      <div className="relative min-h-[500px]">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full"
          >
            {activeTab === 'leaderboard' && <LeaderboardTab />}
            {activeTab === 'polls' && <PollsTab />}
            {activeTab === 'helpdesk' && <HelpDeskTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
