import { motion, AnimatePresence } from 'framer-motion';
import {
  Network, BookOpen, Binary, GraduationCap, Layers,
  Sun, Moon, ChevronRight, CheckCircle2, Menu, X
} from 'lucide-react';
import { useState } from 'react';

const modules = [
  { id: 'levels', label: 'Training Levels', icon: Network, emoji: '🧩' },
  { id: 'xray', label: 'Packet X-Ray', icon: Layers, emoji: '🔬' },
  { id: 'cidr', label: 'CIDR Bit Lab', icon: Binary, emoji: '🧮' },
  { id: 'defense', label: 'Defense Academy', icon: GraduationCap, emoji: '🎓' },
];

function ProgressRing({ progress, size = 28, strokeWidth = 3 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="shrink-0">
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke="var(--border-clr)" strokeWidth={strokeWidth}
      />
      <circle
        cx={size / 2} cy={size / 2} r={radius}
        fill="none" stroke="var(--accent)" strokeWidth={strokeWidth}
        strokeDasharray={circumference} strokeDashoffset={offset}
        strokeLinecap="round"
        className="progress-ring-circle"
      />
    </svg>
  );
}

export default function Sidebar({
  activeModule, setActiveModule,
  activeLevel, setActiveLevel,
  completedLevels, levels,
  darkMode, setDarkMode,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const progress = Math.round((completedLevels.length / 10) * 100);

  return (
    <>
      {/* Mobile toggle */}
      <button
        className="fixed top-3 left-3 z-[60] p-2 rounded-lg md:hidden"
        style={{ background: 'var(--card)', border: '1px solid var(--border-clr)' }}
        onClick={() => setMobileOpen(!mobileOpen)}
      >
        {mobileOpen ? <X size={20} /> : <Menu size={20} />}
      </button>

      <AnimatePresence>
        {(mobileOpen || true) && (
          <motion.aside
            className={`sidebar ${mobileOpen ? 'open' : ''}`}
            initial={false}
          >
            {/* Header */}
            <div className="px-4 pt-5 pb-3 border-b" style={{ borderColor: 'var(--border-clr)' }}>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                     style={{ background: 'var(--accent-bg)' }}>
                  🌐
                </div>
                <div>
                  <h1 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>
                    Ultimate NetPractice
                  </h1>
                  <p className="text-xs" style={{ color: 'var(--text-sec)' }}>
                    Interactive Trainer
                  </p>
                </div>
              </div>

              {/* Overall progress */}
              <div className="flex items-center gap-2.5 px-1">
                <ProgressRing progress={progress} />
                <div className="flex-1">
                  <div className="flex justify-between text-xs mb-1">
                    <span style={{ color: 'var(--text-sec)' }}>Progress</span>
                    <span className="font-medium" style={{ color: 'var(--accent)' }}>{progress}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full" style={{ background: 'var(--border-clr)' }}>
                    <motion.div
                      className="h-full rounded-full"
                      style={{ background: 'var(--accent)' }}
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Module Navigation */}
            <div className="px-2 pt-3 pb-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider px-2 mb-1.5"
                 style={{ color: 'var(--text-ter)' }}>
                Modules
              </p>
              {modules.map((mod) => {
                const isActive = activeModule === mod.id;
                return (
                  <motion.button
                    key={mod.id}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-left text-sm transition-colors mb-0.5"
                    style={{
                      background: isActive ? 'var(--accent-bg)' : 'transparent',
                      color: isActive ? 'var(--accent)' : 'var(--text-sec)',
                      fontWeight: isActive ? 500 : 400,
                    }}
                    onClick={() => {
                      setActiveModule(mod.id);
                      setMobileOpen(false);
                    }}
                    whileHover={{ x: 2 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-base">{mod.emoji}</span>
                    {mod.label}
                  </motion.button>
                );
              })}
            </div>

            {/* Level list (only when Training Levels is active) */}
            {activeModule === 'levels' && (
              <div className="px-2 pb-2 flex-1 overflow-y-auto">
                <p className="text-[10px] font-semibold uppercase tracking-wider px-2 mb-1.5 mt-1"
                   style={{ color: 'var(--text-ter)' }}>
                  Levels
                </p>
                {levels.map((level) => {
                  const isCompleted = completedLevels.includes(level.id);
                  const isCurrent = activeLevel === level.id;
                  return (
                    <motion.button
                      key={level.id}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-left text-sm mb-0.5 transition-colors"
                      style={{
                        background: isCurrent ? 'var(--accent-bg)' : 'transparent',
                        color: isCurrent ? 'var(--accent)' : 'var(--text-sec)',
                      }}
                      onClick={() => {
                        setActiveLevel(level.id);
                        setMobileOpen(false);
                      }}
                      whileHover={{ x: 2 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      {isCompleted ? (
                        <CheckCircle2 size={15} style={{ color: 'var(--success)' }} />
                      ) : (
                        <span className="w-[15px] h-[15px] rounded-full border flex items-center justify-center text-[9px] font-mono font-bold"
                              style={{ borderColor: 'var(--border-clr)', color: 'var(--text-ter)' }}>
                          {level.id}
                        </span>
                      )}
                      <span className="truncate flex-1">{level.title}</span>
                      <ChevronRight size={13} style={{ opacity: isCurrent ? 1 : 0.3 }} />
                    </motion.button>
                  );
                })}
              </div>
            )}

            {/* Bottom: Dark mode toggle */}
            <div className="mt-auto px-3 pb-4 pt-2 border-t" style={{ borderColor: 'var(--border-clr)' }}>
              <motion.button
                className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors"
                style={{ color: 'var(--text-sec)' }}
                onClick={() => setDarkMode(!darkMode)}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
              >
                {darkMode ? <Sun size={16} /> : <Moon size={16} />}
                {darkMode ? 'Light Mode' : 'Dark Mode'}
              </motion.button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  );
}
