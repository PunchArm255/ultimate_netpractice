import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, RotateCcw, ChevronLeft, ChevronRight, Shuffle, Check, X as XIcon } from 'lucide-react';
import { defenseTopics } from '../data/theoryData';
import Markdown from './Markdown';

/* ═══════════════ Interactive Flip-Card ══════════════════════════════════ */
function FlipCard({ card, index, total }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <motion.div
      className="flashcard"
      onClick={() => setFlipped(!flipped)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
    >
      <div className={`flashcard-inner ${flipped ? '' : ''}`}>
        {/* Front */}
        <motion.div
          className="rounded-xl border-2 p-6"
          style={{
            background: 'var(--card)',
            borderColor: flipped ? 'var(--success)' : 'var(--accent)',
            minHeight: 200,
            cursor: 'pointer',
          }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.5, type: 'spring', stiffness: 200 }}
        >
          <AnimatePresence mode="wait">
            {!flipped ? (
              <motion.div
                key="front"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col justify-center h-full"
              >
                <div className="text-[10px] font-semibold uppercase mb-3 flex items-center gap-1.5"
                     style={{ color: 'var(--text-ter)' }}>
                  <BookOpen size={12} />
                  Question {index + 1} of {total} — Click to reveal
                </div>
                <Markdown content={card.q} className="text-base font-medium leading-relaxed" />
              </motion.div>
            ) : (
              <motion.div
                key="back"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col justify-center h-full"
                style={{ transform: 'rotateY(180deg)' }}
              >
                <div className="text-[10px] font-semibold uppercase mb-3 flex items-center gap-1.5"
                     style={{ color: 'var(--success)' }}>
                  <Check size={12} />
                  Answer — Click to flip back
                </div>
                <Markdown content={card.a} className="text-sm leading-relaxed" />
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </motion.div>
  );
}

/* ═══════════════ Topic Card Group ══════════════════════════════════════ */
function TopicGroup({ topic }) {
  const [currentCard, setCurrentCard] = useState(0);
  const total = topic.cards.length;

  const nextCard = useCallback(() => {
    setCurrentCard((c) => (c + 1) % total);
  }, [total]);

  const prevCard = useCallback(() => {
    setCurrentCard((c) => (c - 1 + total) % total);
  }, [total]);

  const shuffleCards = useCallback(() => {
    let newIndex;
    do {
      newIndex = Math.floor(Math.random() * total);
    } while (newIndex === currentCard && total > 1);
    setCurrentCard(newIndex);
  }, [currentCard, total]);

  return (
    <motion.div
      className="p-5 rounded-xl border mb-4"
      style={{ background: 'var(--card)', borderColor: 'var(--border-clr)' }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-2.5 mb-4">
        <span className="text-2xl">{topic.emoji}</span>
        <div>
          <h3 className="text-base font-bold" style={{ color: 'var(--text)' }}>{topic.title}</h3>
          <span className="text-xs" style={{ color: 'var(--text-ter)' }}>
            {total} flashcards — Click card to flip
          </span>
        </div>
      </div>

      <AnimatePresence mode="wait">
        <FlipCard
          key={`${topic.id}-${currentCard}`}
          card={topic.cards[currentCard]}
          index={currentCard}
          total={total}
        />
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-3">
        <button className="btn btn-ghost btn-sm" onClick={prevCard}>
          <ChevronLeft size={14} /> Prev
        </button>

        <div className="flex gap-1.5">
          {topic.cards.map((_, i) => (
            <button
              key={i}
              className="w-2 h-2 rounded-full transition-all cursor-pointer"
              style={{ background: i === currentCard ? 'var(--accent)' : 'var(--border-clr)' }}
              onClick={() => setCurrentCard(i)}
            />
          ))}
        </div>

        <div className="flex gap-1.5">
          <button className="btn btn-ghost btn-sm" onClick={shuffleCards}>
            <Shuffle size={14} />
          </button>
          <button className="btn btn-ghost btn-sm" onClick={nextCard}>
            Next <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════ Quiz Mode ═════════════════════════════════════════════ */
function QuizMode() {
  const allCards = defenseTopics.flatMap((t) =>
    t.cards.map((c) => ({ ...c, topic: t.title, emoji: t.emoji }))
  );

  const [quizCards, setQuizCards] = useState(() => shuffleArray([...allCards]));
  const [currentIdx, setCurrentIdx] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [score, setScore] = useState({ correct: 0, incorrect: 0 });
  const [finished, setFinished] = useState(false);

  const currentCard = quizCards[currentIdx];
  const total = quizCards.length;

  function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  const handleAnswer = (correct) => {
    setScore((s) => ({
      correct: s.correct + (correct ? 1 : 0),
      incorrect: s.incorrect + (correct ? 0 : 1),
    }));
    if (currentIdx + 1 >= total) {
      setFinished(true);
    } else {
      setCurrentIdx((c) => c + 1);
      setRevealed(false);
    }
  };

  const reset = () => {
    setQuizCards(shuffleArray([...allCards]));
    setCurrentIdx(0);
    setRevealed(false);
    setScore({ correct: 0, incorrect: 0 });
    setFinished(false);
  };

  if (finished) {
    const pct = Math.round((score.correct / total) * 100);
    return (
      <motion.div
        className="p-6 rounded-xl border text-center"
        style={{ background: 'var(--card)', borderColor: 'var(--border-clr)' }}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <div className="text-4xl mb-3">{pct >= 80 ? '🎉' : pct >= 50 ? '📚' : '💪'}</div>
        <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--text)' }}>
          Quiz Complete!
        </h3>
        <div className="text-3xl font-bold mb-3" style={{ color: pct >= 80 ? 'var(--success)' : 'var(--warning)' }}>
          {pct}%
        </div>
        <p className="text-sm mb-4" style={{ color: 'var(--text-sec)' }}>
          {score.correct} correct, {score.incorrect} incorrect out of {total} questions
        </p>
        <button className="btn btn-primary" onClick={reset}>
          <RotateCcw size={15} /> Try Again
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="p-5 rounded-xl border"
      style={{ background: 'var(--card)', borderColor: 'var(--border-clr)' }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">{currentCard.emoji}</span>
          <span className="text-xs font-medium" style={{ color: 'var(--text-sec)' }}>
            {currentCard.topic}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono" style={{ color: 'var(--success)' }}>✓ {score.correct}</span>
          <span className="text-xs font-mono" style={{ color: 'var(--danger)' }}>✗ {score.incorrect}</span>
          <span className="text-xs font-mono" style={{ color: 'var(--text-ter)' }}>{currentIdx + 1}/{total}</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1 rounded-full mb-4" style={{ background: 'var(--border-clr)' }}>
        <motion.div
          className="h-full rounded-full"
          style={{ background: 'var(--accent)' }}
          animate={{ width: `${((currentIdx + 1) / total) * 100}%` }}
        />
      </div>

      {/* Question */}
      <div className="mb-4">
        <Markdown content={currentCard.q} className="text-base font-medium" />
      </div>

      {/* Reveal / Answer */}
      {!revealed ? (
        <button className="btn btn-primary w-full" onClick={() => setRevealed(true)}>
          Reveal Answer
        </button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="p-4 rounded-lg mb-3 text-sm leading-relaxed"
               style={{ background: 'var(--success-bg)', color: 'var(--text)' }}>
            <Markdown content={currentCard.a} />
          </div>
          <div className="flex gap-2">
            <button className="btn btn-success flex-1" onClick={() => handleAnswer(true)}>
              <Check size={15} /> I knew this
            </button>
            <button className="btn btn-danger flex-1" onClick={() => handleAnswer(false)}>
              <XIcon size={15} /> I need to study this
            </button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

/* ═══════════════ MAIN EXPORT ════════════════════════════════════════════ */
export default function DefenseAcademy() {
  const [mode, setMode] = useState('study'); // 'study' or 'quiz'

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3 mb-2">
        <span className="text-2xl">🎓</span>
        <div>
          <h2 className="text-xl font-bold" style={{ color: 'var(--text)' }}>
            42 Oral Defense Academy
          </h2>
          <p className="text-sm" style={{ color: 'var(--text-sec)' }}>
            Master every concept evaluators ask. Study cards or test yourself in quiz mode.
          </p>
        </div>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2 mb-5 mt-3">
        <button
          className={`btn ${mode === 'study' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setMode('study')}
        >
          <BookOpen size={15} /> Study Cards
        </button>
        <button
          className={`btn ${mode === 'quiz' ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => setMode('quiz')}
        >
          <Shuffle size={15} /> Quiz Mode
        </button>
      </div>

      <AnimatePresence mode="wait">
        {mode === 'study' ? (
          <motion.div
            key="study"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {defenseTopics.map((topic) => (
              <TopicGroup key={topic.id} topic={topic} />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="quiz"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <QuizMode />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
