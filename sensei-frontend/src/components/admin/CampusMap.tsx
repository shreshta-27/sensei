'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Plus, Minus, MapPin } from 'lucide-react';

interface BuildingInfo {
  id: string;
  name: string;
  occupancy: number;
  posX: string;
  posY: string;
  color: string;
  width: string;
  height: string;
}

const buildings: BuildingInfo[] = [
  { id: 'b1', name: 'Engineering Block', occupancy: 92, posX: '22%', posY: '38%', color: '#8B5CF6', width: '80px', height: '50px' },
  { id: 'b2', name: 'Library',           occupancy: 95, posX: '60%', posY: '18%', color: '#3B82F6', width: '64px', height: '44px' },
  { id: 'b3', name: 'Main Building',     occupancy: 94, posX: '38%', posY: '55%', color: '#7C3AED', width: '90px', height: '58px' },
  { id: 'b4', name: 'Hostel',            occupancy: 88, posX: '72%', posY: '42%', color: '#F59E0B', width: '60px', height: '40px' },
  { id: 'b5', name: 'Sports Complex',    occupancy: 90, posX: '62%', posY: '68%', color: '#10B981', width: '76px', height: '48px' },
  { id: 'b6', name: 'Admin Block',       occupancy: 78, posX: '12%', posY: '62%', color: '#F43F5E', width: '56px', height: '38px' },
];

function occupancyColor(occ: number) {
  if (occ >= 90) return '#10B981';
  if (occ >= 75) return '#F59E0B';
  return '#EF4444';
}

export default function CampusMap() {
  const [selected, setSelected] = useState<BuildingInfo | null>(null);
  const [zoom, setZoom] = useState(1);

  return (
    <div className="adm-card h-full flex flex-col" style={{ minHeight: '360px' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-5 py-4 border-b flex-shrink-0"
        style={{ borderColor: 'var(--adm-border-solid)' }}
      >
        <div className="flex items-center gap-2">
          <MapPin size={14} style={{ color: 'var(--adm-accent)' }} />
          <h3 className="adm-section-title">Campus Intelligence Map</h3>
        </div>
        {/* Zoom controls */}
        <div
          className="flex items-center rounded-lg overflow-hidden border"
          style={{ borderColor: 'var(--adm-border-solid)' }}
        >
          <button
            onClick={() => setZoom((z) => Math.min(z + 0.15, 1.6))}
            className="w-7 h-7 flex items-center justify-center transition-colors text-xs font-bold"
            style={{ color: 'var(--adm-text-sub)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--adm-bg)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            <Plus size={12} />
          </button>
          <div className="w-px h-5" style={{ background: 'var(--adm-border-solid)' }} />
          <button
            onClick={() => setZoom((z) => Math.max(z - 0.15, 0.7))}
            className="w-7 h-7 flex items-center justify-center transition-colors text-xs font-bold"
            style={{ color: 'var(--adm-text-sub)' }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = 'var(--adm-bg)'; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
          >
            <Minus size={12} />
          </button>
        </div>
      </div>

      {/* Map area */}
      <div className="flex-1 relative overflow-hidden rounded-b-2xl">
        {/* Ground/aerial background */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(145deg, #e8edf2 0%, #d4e8e0 40%, #d8e8f0 70%, #e4dcf8 100%)',
          }}
        >
          {/* Grid lines */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'linear-gradient(rgba(124,58,237,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.3) 1px, transparent 1px)',
              backgroundSize: '40px 40px',
            }}
          />
          {/* Paths */}
          <svg className="absolute inset-0 w-full h-full opacity-30" preserveAspectRatio="none">
            <path d="M 50% 0% L 50% 100%" stroke="#B0C4D0" strokeWidth="8" strokeDasharray="none" />
            <path d="M 0% 50% L 100% 50%" stroke="#B0C4D0" strokeWidth="8" />
            <path d="M 30% 0% L 30% 100%" stroke="#B0C4D0" strokeWidth="4" strokeDasharray="6,4" />
            <path d="M 65% 0% L 65% 100%" stroke="#B0C4D0" strokeWidth="4" strokeDasharray="6,4" />
          </svg>
          {/* Green areas */}
          <div className="absolute rounded-full opacity-40" style={{ width: '60px', height: '60px', background: '#86EFAC', left: '48%', top: '28%' }} />
          <div className="absolute rounded-full opacity-35" style={{ width: '48px', height: '48px', background: '#86EFAC', left: '18%', top: '72%' }} />
        </div>

        {/* Zoom wrapper */}
        <div
          className="absolute inset-0"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'center center', transition: 'transform 0.3s ease' }}
        >
          {/* Buildings */}
          {buildings.map((b) => (
            <motion.button
              key={b.id}
              className="absolute flex flex-col items-center gap-1 group"
              style={{ left: b.posX, top: b.posY, transform: 'translate(-50%, -50%)' }}
              onClick={() => setSelected(selected?.id === b.id ? null : b)}
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.97 }}
            >
              {/* Building footprint */}
              <div
                className="rounded-lg border-2 flex items-center justify-center shadow-md transition-all duration-200"
                style={{
                  width: b.width,
                  height: b.height,
                  background: `${b.color}22`,
                  borderColor: selected?.id === b.id ? b.color : `${b.color}66`,
                  boxShadow: selected?.id === b.id ? `0 0 0 3px ${b.color}44, 0 4px 12px ${b.color}33` : `0 2px 8px ${b.color}22`,
                }}
              >
                <Building2 size={16} style={{ color: b.color }} />
              </div>

              {/* Label card */}
              <div
                className="px-2 py-1 rounded-lg text-center shadow-sm whitespace-nowrap"
                style={{ background: 'rgba(255,255,255,0.92)', border: `1px solid ${b.color}33` }}
              >
                <p className="text-[9px] font-bold leading-tight" style={{ color: 'var(--adm-text)', maxWidth: '90px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {b.name}
                </p>
                <p className="text-[10px] font-bold" style={{ color: occupancyColor(b.occupancy) }}>
                  {b.occupancy}%
                </p>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Selected building detail */}
        <AnimatePresence>
          {selected && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 6 }}
              className="absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-56 rounded-xl p-3 shadow-lg"
              style={{
                background: 'var(--adm-surface)',
                border: `1.5px solid ${selected.color}44`,
                boxShadow: `0 4px 20px ${selected.color}22`,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: `${selected.color}20` }}>
                    <Building2 size={12} style={{ color: selected.color }} />
                  </div>
                  <p className="text-xs font-semibold" style={{ color: 'var(--adm-text)', fontFamily: 'Space Grotesk, sans-serif' }}>{selected.name}</p>
                </div>
                <button onClick={() => setSelected(null)} className="text-[10px]" style={{ color: 'var(--adm-text-muted)' }}>✕</button>
              </div>
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <span className="text-[10px]" style={{ color: 'var(--adm-text-muted)' }}>Occupancy</span>
                  <span className="text-xs font-bold" style={{ color: occupancyColor(selected.occupancy) }}>{selected.occupancy}%</span>
                </div>
                <div
                  className="h-1.5 rounded-full overflow-hidden"
                  style={{ background: 'var(--adm-border-solid)' }}
                >
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${selected.occupancy}%`, background: occupancyColor(selected.occupancy) }}
                  />
                </div>
                <p className="text-[10px]" style={{ color: 'var(--adm-text-muted)' }}>
                  {selected.occupancy >= 90 ? '🟢 High utilization' : selected.occupancy >= 75 ? '🟡 Moderate load' : '🔴 Under-utilized'}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hint */}
        {!selected && (
          <div
            className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-full text-[10px] font-medium"
            style={{ background: 'rgba(255,255,255,0.85)', color: 'var(--adm-text-muted)', backdropFilter: 'blur(8px)', border: '1px solid var(--adm-border-solid)' }}
          >
            Click a building to view details
          </div>
        )}
      </div>
    </div>
  );
}
