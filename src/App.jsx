import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, ChevronLeft, ChevronRight, CheckCircle2,
  Sparkles, RotateCcw, Share2, Layers, Binary,
  GraduationCap, Network, ExternalLink, HelpCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';

import Sidebar from './components/Sidebar';
import LevelWorkspace from './components/LevelWorkspace';
import PacketXRay from './components/PacketXRay';
import CidrBitLab from './components/CidrBitLab';
import DefenseAcademy from './components/DefenseAcademy';
import levels from './data/levelsData';

export default function App() {
  // ── Active Module ('levels' | 'xray' | 'cidr' | 'defense') ──
  const [activeModule, setActiveModule] = useState('levels');

  // ── Active Training Level (1 to 10) ──
  const [activeLevel, setActiveLevel] = useState(1);

  // ── Completed Levels (persisted) ──
  const [completedLevels, setCompletedLevels] = useState(() => {
    try {
      const saved = localStorage.getItem('unp_completed_levels');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // ── Answers per level: { [levelId]: { [fieldId]: value } } ──
  const [levelAnswers, setLevelAnswers] = useState(() => {
    try {
      const saved = localStorage.getItem('unp_level_answers');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // ── Dark Mode (persisted) ──
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem('unp_dark_mode');
      if (saved !== null) return JSON.parse(saved);
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    } catch {
      return false;
    }
  });

  // Sync dark mode class on <html>
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('unp_dark_mode', JSON.stringify(darkMode));
  }, [darkMode]);

  // Persist completed levels
  useEffect(() => {
    localStorage.setItem('unp_completed_levels', JSON.stringify(completedLevels));
  }, [completedLevels]);

  // Persist answers
  useEffect(() => {
    localStorage.setItem('unp_level_answers', JSON.stringify(levelAnswers));
  }, [levelAnswers]);

  // Current Level Object
  const currentLevel = useMemo(() => {
    return levels.find((l) => l.id === activeLevel) || levels[0];
  }, [activeLevel]);

  // Current Level Answers
  const currentAnswers = useMemo(() => {
    return levelAnswers[activeLevel] || {};
  }, [levelAnswers, activeLevel]);

  // Set answers for current level
  const setCurrentAnswers = useCallback((updater) => {
    setLevelAnswers((prev) => {
      const oldAnswers = prev[activeLevel] || {};
      const newAnswers = typeof updater === 'function' ? updater(oldAnswers) : updater;
      return {
        ...prev,
        [activeLevel]: newAnswers,
      };
    });
  }, [activeLevel]);

  // Handle Level Completion
  const handleLevelComplete = useCallback((levelId) => {
    setCompletedLevels((prev) => {
      if (prev.includes(levelId)) return prev;
      const updated = [...prev, levelId].sort((a, b) => a - b);
      // If all 10 are completed, fire celebratory confetti shower!
      if (updated.length === 10) {
        setTimeout(() => {
          confetti({
            particleCount: 300,
            spread: 120,
            origin: { y: 0.4 },
            colors: ['#2383E2', '#0F7B6C', '#D9730D', '#C14C8A', '#6940A5', '#FFD700'],
          });
        }, 500);
      }
      return updated;
    });
  }, []);

  // Reset all level progress
  const handleResetAllProgress = useCallback(() => {
    if (window.confirm('Are you sure you want to reset all completed levels and saved configurations?')) {
      setCompletedLevels([]);
      setLevelAnswers({});
      localStorage.removeItem('unp_completed_levels');
      localStorage.removeItem('unp_level_answers');
    }
  }, []);

  const totalCompleted = completedLevels.length;
  const isAllCompleted = totalCompleted === 10;

  return (
    <div className="min-h-screen flex" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
      {/* ─── Notion-Style Sidebar ─── */}
      <Sidebar
        activeModule={activeModule}
        setActiveModule={setActiveModule}
        activeLevel={activeLevel}
        setActiveLevel={setActiveLevel}
        completedLevels={completedLevels}
        levels={levels}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* ─── Main Content Canvas ─── */}
      <main className="main-content flex-1 flex flex-col">
        {/* Top Header / Breadcrumb Bar */}
        <header className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-6 border-b"
                style={{ borderColor: 'var(--border-clr)' }}>
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-sec)' }}>
            <span className="font-semibold" style={{ color: 'var(--text)' }}>
              Ultimate NetPractice
            </span>
            <span>/</span>
            {activeModule === 'levels' && (
              <>
                <span className="cursor-pointer hover:underline" onClick={() => setActiveModule('levels')}>
                  Training Levels
                </span>
                <span>/</span>
                <span className="font-medium" style={{ color: 'var(--accent)' }}>
                  Level {activeLevel}: {currentLevel.title}
                </span>
              </>
            )}
            {activeModule === 'xray' && (
              <span className="font-medium" style={{ color: 'var(--accent)' }}>
                Packet X-Ray Lab
              </span>
            )}
            {activeModule === 'cidr' && (
              <span className="font-medium" style={{ color: 'var(--accent)' }}>
                CIDR Bit Lab
              </span>
            )}
            {activeModule === 'defense' && (
              <span className="font-medium" style={{ color: 'var(--accent)' }}>
                42 Oral Defense Academy
              </span>
            )}
          </div>

          {/* Quick stats & action pills */}
          <div className="flex items-center gap-2">
            <span className="text-xs px-2.5 py-1 rounded-full font-mono flex items-center gap-1.5"
                  style={{ background: 'var(--card)', border: '1px solid var(--border-clr)' }}>
              <Trophy size={13} style={{ color: isAllCompleted ? '#D9730D' : 'var(--text-sec)' }} />
              <span className="font-semibold">{totalCompleted}/10</span>
              <span style={{ color: 'var(--text-ter)' }}>levels</span>
            </span>

            {totalCompleted > 0 && (
              <button
                className="btn btn-ghost btn-sm text-xs"
                onClick={handleResetAllProgress}
                title="Reset all level answers and progress"
              >
                <RotateCcw size={12} /> Reset All
              </button>
            )}
          </div>
        </header>

        {/* ─── Level Navigation Ribbon (When 'levels' module is active) ─── */}
        {activeModule === 'levels' && (
          <div className="mb-6 p-2 rounded-xl flex flex-wrap items-center justify-between gap-2 border"
               style={{ background: 'var(--card)', borderColor: 'var(--border-clr)' }}>
            {/* Prev / Next buttons */}
            <div className="flex items-center gap-1.5">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setActiveLevel((prev) => Math.max(1, prev - 1))}
                disabled={activeLevel === 1}
                title="Previous Level"
              >
                <ChevronLeft size={16} /> Prev
              </button>

              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setActiveLevel((prev) => Math.min(10, prev + 1))}
                disabled={activeLevel === 10}
                title="Next Level"
              >
                Next <ChevronRight size={16} />
              </button>
            </div>

            {/* Level Quick Pills */}
            <div className="flex items-center gap-1 overflow-x-auto py-1 px-1">
              {levels.map((lvl) => {
                const isCur = lvl.id === activeLevel;
                const isDone = completedLevels.includes(lvl.id);
                return (
                  <motion.button
                    key={lvl.id}
                    className="relative flex items-center justify-center rounded-lg text-xs font-mono font-medium transition-all"
                    style={{
                      width: '32px',
                      height: '32px',
                      background: isCur
                        ? 'var(--accent)'
                        : isDone
                        ? 'var(--success-bg)'
                        : 'transparent',
                      color: isCur
                        ? '#ffffff'
                        : isDone
                        ? 'var(--success)'
                        : 'var(--text-sec)',
                      border: isCur
                        ? '1.5px solid var(--accent)'
                        : isDone
                        ? '1.5px solid var(--success)'
                        : '1px solid var(--border-clr)',
                    }}
                    onClick={() => setActiveLevel(lvl.id)}
                    whileHover={{ scale: 1.08 }}
                    whileTap={{ scale: 0.95 }}
                    title={`Level ${lvl.id}: ${lvl.title} ${isDone ? '(Completed)' : ''}`}
                  >
                    {isDone && !isCur ? (
                      <CheckCircle2 size={15} />
                    ) : (
                      lvl.id
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Quick jump to defense / X-Ray */}
            <div className="hidden lg:flex items-center gap-2">
              <button
                className="text-xs px-2.5 py-1 rounded-md text-left flex items-center gap-1.5 transition-colors"
                style={{ color: 'var(--text-sec)', background: 'var(--border-clr)' }}
                onClick={() => setActiveModule('defense')}
              >
                <GraduationCap size={13} />
                <span>Defense Flashcards</span>
              </button>
            </div>
          </div>
        )}

        {/* ─── All 10 Levels Completed Master Banner ─── */}
        {isAllCompleted && activeModule === 'levels' && (
          <motion.div
            className="mb-6 p-4 rounded-xl border flex items-center justify-between gap-4"
            style={{
              background: 'linear-gradient(135deg, var(--success-bg) 0%, var(--accent-bg) 100%)',
              borderColor: 'var(--success)',
            }}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-xl shadow-sm"
                   style={{ background: '#fff' }}>
                🏆
              </div>
              <div>
                <h3 className="text-sm font-bold" style={{ color: 'var(--text)' }}>
                  Certified 42 NetPractice Master!
                </h3>
                <p className="text-xs" style={{ color: 'var(--text-sec)' }}>
                  You have solved all 10 topological levels without errors. Ready for your peer-evaluation defense!
                </p>
              </div>
            </div>

            <button
              className="btn btn-success btn-sm text-xs font-semibold"
              onClick={() => setActiveModule('defense')}
            >
              <GraduationCap size={14} /> Practice Defense Quiz
            </button>
          </motion.div>
        )}

        {/* ─── Active Module Rendering with Smooth Page Transitions ─── */}
        <AnimatePresence mode="wait">
          {activeModule === 'levels' && (
            <motion.div
              key={`level-${activeLevel}`}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="flex-1"
            >
              <LevelWorkspace
                level={currentLevel}
                answers={currentAnswers}
                setAnswers={setCurrentAnswers}
                onComplete={handleLevelComplete}
                isCompleted={completedLevels.includes(activeLevel)}
              />
            </motion.div>
          )}

          {activeModule === 'xray' && (
            <motion.div
              key="xray"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="flex-1"
            >
              <PacketXRay />
            </motion.div>
          )}

          {activeModule === 'cidr' && (
            <motion.div
              key="cidr"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="flex-1"
            >
              <CidrBitLab />
            </motion.div>
          )}

          {activeModule === 'defense' && (
            <motion.div
              key="defense"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="flex-1"
            >
              <DefenseAcademy />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer */}
        <footer className="mt-auto pt-8 pb-4 text-center text-xs" style={{ color: 'var(--text-ter)' }}>
          <p>
            Ultimate NetPractice — Built with ❤️ for 42 School students & network engineers.
          </p>
        </footer>
      </main>
    </div>
  );
}
