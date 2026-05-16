'use client';

import React from 'react';
import { Bell, Search, Calendar as CalendarIcon, ChevronDown, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

const FacultyTopNav = () => {
  const { user } = useAuthStore();
  const today = new Date();
  const dateString = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <div className="h-24 flex items-center justify-between px-8 bg-transparent relative z-20 pointer-events-none">
      <div className="flex items-center gap-6 flex-1 pointer-events-auto">
        <div className="relative max-w-md w-full hidden lg:block group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" size={20} />
          <input 
            type="text" 
            placeholder="Search Intelligence Desk..." 
            className="w-full bg-white/60 backdrop-blur-md border-2 border-white/50 rounded-3xl py-3.5 pl-14 pr-6 text-sm font-bold text-gray-700 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-300 focus:bg-white transition-all shadow-xl shadow-gray-200/20"
          />
        </div>
      </div>

      <div className="flex items-center gap-6 pointer-events-auto">
        {}
        <div className="hidden xl:flex items-center gap-3 px-6 py-3 bg-white/60 backdrop-blur-md border-2 border-white/50 rounded-3xl shadow-xl shadow-gray-200/10">
           <div className="w-8 h-8 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
              <CalendarIcon size={16} />
           </div>
           <div className="flex flex-col">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-tight">OFFICIAL DATE</span>
              <span className="text-xs font-black text-gray-700 leading-tight">{dateString}</span>
           </div>
        </div>

        {}
        <div className="flex items-center gap-3">
           <button className="relative w-14 h-14 bg-white/80 backdrop-blur-md border-2 border-white rounded-[22px] flex items-center justify-center shadow-xl shadow-gray-200/20 hover:scale-105 active:scale-95 transition-all group">
             <Bell size={24} className="text-gray-600 group-hover:text-purple-600 transition-colors" />
             <span className="absolute top-4 right-4 w-3.5 h-3.5 bg-purple-600 border-4 border-white rounded-full animate-pulse" />
           </button>

           <div className="h-14 pl-2 flex items-center gap-4">
              <div className="flex flex-col items-end hidden sm:flex">
                 <span className="text-sm font-black text-gray-800 leading-none">{user?.name || 'Faculty Member'}</span>
                 <span className="text-[10px] font-black text-purple-600 uppercase tracking-[0.2em] mt-1 flex items-center gap-1">
                    <Sparkles size={10} className="fill-current" /> Verified Educator
                 </span>
              </div>
              <div className="w-14 h-14 bg-purple-600 border-4 border-white rounded-[22px] flex items-center justify-center text-white font-black text-xl shadow-2xl shadow-purple-200 hover:rotate-3 transition-transform cursor-pointer overflow-hidden">
                {user?.name?.charAt(0) || 'P'}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyTopNav;
