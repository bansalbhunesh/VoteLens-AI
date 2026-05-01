import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { generateQuiz } from '../utils/api';
import { QUIZ_TOPICS } from '../utils/constants';
import { useGlobalContext } from '../hooks/useGlobalContext';

const GRADES = [
  { min: 5, label: 'Election Expert',  icon: '🏆', color: 'text-accent-400',   bg: 'bg-accent-500/10 border-accent-500/30' },
  { min: 4, label: 'Informed Voter',   icon: '⭐', color: 'text-primary-400',  bg: 'bg-primary-500/10 border-primary-500/30' },
  { min: 3, label: 'Good Citizen',     icon: '👍', color: 'text-success-400',  bg: 'bg-success-500/10 border-success-500/30' },
  { min: 0, label: 'Keep Learning',    icon: '📚', color: 'text-surface-300',  bg: 'bg-surface-700/30 border-white/10' },
];

function getGrade(score) {
  return GRADES.find((g) => score >= g.min);
}

// ── Quiz history (localStorage) ──
const HISTORY_KEY = 'votelens_quiz_scores';

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY) || '{}'); } catch { return {}; }
}

function saveScore(topicId, score, total) {
  const h = loadHistory();
  const prev = h[topicId];
  h[topicId] = {
    best: prev ? Math.max(prev.best, score) : score,
    last: score,
    total,
    attempts: (prev?.attempts || 0) + 1,
    date: new Date().toISOString().split('T')[0],
  };
  try { localStorage.setItem(HISTORY_KEY, JSON.stringify(h)); } catch {}
  return h;
}

// ── Animated score counter ──
function useCountUp(target, duration = 900) {
  const [count, setCount] = useState(0);
  const raf = useRef(null);
  useEffect(() => {
    cancelAnimationFrame(raf.current);
    const start = performance.now();
    const step = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      setCount(Math.round(progress * target));
      if (progress < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf.current);
  }, [target, duration]);
  return count;
}

function ScoreDisplay({ score, total }) {
  const animated = useCountUp(score, 900);
  return (
    <div className="text-6xl font-black text-surface-50 mb-2">
      {animated}<span className="text-surface-600">/{total}</span>
    </div>
  );
}

export default function Quiz() {
  const [phase, setPhase] = useState('select');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [revealed, setRevealed] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [quizHistory, setQuizHistory] = useState(() => loadHistory());
  const [prevLast, setPrevLast] = useState(null);
  const [searchParams] = useSearchParams();
  const ctx = useGlobalContext();
  const didInitRef = useRef(false);

  const score = Object.entries(answers).filter(
    ([i, ans]) => questions[parseInt(i)]?.correct === ans
  ).length;

  const handleTopicSelect = async (topic) => {
    setSelectedTopic(topic);
    setPhase('loading');
    setError('');
    // Capture previous last score as state before this attempt is saved
    setPrevLast(quizHistory[topic.id]?.last ?? null);
    try {
      const qs = await generateQuiz(topic.id);
      setQuestions(qs);
      setCurrentQ(0);
      setAnswers({});
      setRevealed(false);
      setPhase('quiz');
    } catch (err) {
      setError(err.message || 'Failed to generate quiz. Please try again.');
      setPhase('select');
    }
  };

  useEffect(() => {
    const t = searchParams.get('topic');
    if (t && !didInitRef.current && phase === 'select') {
      const found = QUIZ_TOPICS.find((q) => q.id === t);
      if (found) {
        didInitRef.current = true;
        setTimeout(() => {
          handleTopicSelect(found);
        }, 0);
      }
    }
  }, [searchParams, phase]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleAnswer = useCallback((option) => {
    if (revealed) return;
    setAnswers((prev) => ({ ...prev, [currentQ]: option }));
    setRevealed(true);
  }, [revealed, currentQ]);

  const handleNext = useCallback(() => {
    if (currentQ < questions.length - 1) {
      setCurrentQ((q) => q + 1);
      setRevealed(false);
    } else {
      const newHistory = saveScore(selectedTopic.id, score, questions.length);
      setQuizHistory(newHistory);
      ctx.recordQuizResult(selectedTopic.label, score, questions.length);
      setPhase('results');
    }
  }, [currentQ, questions.length, selectedTopic, score, ctx]);

  // Keyboard shortcuts — declared after handleAnswer/handleNext so closures capture them
  const handleKeyDown = useCallback(
    (e) => {
      if (phase !== 'quiz') return;
      const optionKeys = ['a', 'b', 'c', 'd'];
      const key = e.key.toLowerCase();
      if (!revealed && optionKeys.includes(key)) {
        const upper = key.toUpperCase();
        if (questions[currentQ]?.options[upper] !== undefined) handleAnswer(upper);
      }
      if (revealed && (e.key === 'Enter' || e.key === 'ArrowRight')) handleNext();
    },
    [phase, revealed, currentQ, questions, handleAnswer, handleNext]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  const handleRetry = () => {
    setPhase('select');
    setQuestions([]);
    setAnswers({});
    setRevealed(false);
    setCurrentQ(0);
    setSelectedTopic(null);
  };

  const handleShare = async () => {
    const grade = getGrade(score);
    const pct = Math.round((score / questions.length) * 100);
    const text = `I scored ${score}/${questions.length} (${pct}%) on the "${selectedTopic?.label}" civic quiz — ${grade.label}! 🗳️\nTry it at VoteLens AI`;
    try {
      if (navigator.share) {
        await navigator.share({ title: 'VoteLens AI Quiz', text });
      } else {
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    } catch {
      // user cancelled share
    }
  };

  // Trend compared to previous attempt
  const trend = prevLast !== null
    ? score > prevLast ? 'improved' : score < prevLast ? 'lower' : 'same'
    : null;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-light tracking-tight mb-2 text-surface-50/90">Civic Quiz</h1>
        <p className="text-sm text-surface-200/60 font-light">
          AI-generated questions — fresh every time.
        </p>
      </div>

      <AnimatePresence mode="wait">

        {/* ── Topic Selection ── */}
        {phase === 'select' && (
          <motion.div
            key="select"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.4 }}
          >
            {error && (
              <div role="alert" className="mb-6 p-4 glass rounded-2xl border border-danger-500/30 text-danger-400 text-sm">
                ⚠️ {error}
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {QUIZ_TOPICS.map((topic, i) => {
                const record = quizHistory[topic.id];
                return (
                  <motion.button
                    key={topic.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.07 }}
                    onClick={() => handleTopicSelect(topic)}
                    className="group text-left glass rounded-3xl p-6 border border-white/5 hover:border-primary-500/30 hover:bg-white/[0.03] transition-elegant"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-3xl group-hover:scale-110 transition-transform inline-block">{topic.icon}</span>
                      {record && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            record.best >= 4
                              ? 'bg-success-500/10 text-success-400 border-success-500/20'
                              : record.best >= 3
                              ? 'bg-accent-500/10 text-accent-400 border-accent-500/20'
                              : 'bg-surface-700/30 text-surface-400 border-white/10'
                          }`}
                        >
                          Best {record.best}/{record.total}
                        </span>
                      )}
                    </div>
                    <div className="font-semibold text-surface-50 mb-1">{topic.label}</div>
                    <div className="text-xs text-surface-400/70 leading-snug">{topic.desc}</div>
                    {record && (
                      <div className="text-[10px] text-surface-600 mt-2">
                        {record.attempts} attempt{record.attempts !== 1 ? 's' : ''} · last {record.date}
                      </div>
                    )}
                    <div className="mt-3 text-xs text-primary-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                      {record ? 'Try again →' : 'Start 5 questions →'}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* ── Loading ── */}
        {phase === 'loading' && (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-32 gap-6"
            aria-live="polite"
            aria-label="Generating quiz questions"
          >
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 rounded-full border-4 border-white/5" />
              <div className="absolute inset-0 rounded-full border-4 border-t-primary-500 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
            </div>
            <div className="text-center">
              <div className="text-surface-200 font-medium mb-1">Generating questions…</div>
              <div className="text-xs text-surface-500">
                Crafting fresh questions on <span className="text-primary-400">{selectedTopic?.label}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Quiz ── */}
        {phase === 'quiz' && questions[currentQ] && (
          <motion.div
            key={`q-${currentQ}`}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.35 }}
          >
            {/* Progress */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex gap-1.5" role="progressbar" aria-valuenow={currentQ + 1} aria-valuemax={questions.length}>
                {questions.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      i === currentQ ? 'w-8 bg-primary-500' : i < currentQ ? 'w-4 bg-primary-500/50' : 'w-4 bg-surface-700'
                    }`}
                  />
                ))}
              </div>
              <div className="text-xs text-surface-500 font-bold tabular-nums">
                {currentQ + 1} / {questions.length}
              </div>
            </div>

            {/* Question */}
            <div className="glass rounded-3xl p-8 mb-6" role="heading" aria-level="2">
              <div className="text-[10px] font-bold text-primary-400 uppercase tracking-widest mb-3">
                {selectedTopic?.label}
              </div>
              <p className="text-xl font-medium text-surface-50 leading-relaxed">
                {questions[currentQ].question}
              </p>
              {!revealed && (
                <p className="mt-3 text-xs text-surface-600">Press A / B / C / D to answer</p>
              )}
            </div>

            {/* Options */}
            <div className="space-y-3 mb-6" role="group" aria-label="Answer options">
              {Object.entries(questions[currentQ].options).map(([key, val]) => {
                const isChosen = answers[currentQ] === key;
                const isCorrect = questions[currentQ].correct === key;
                let cls = 'glass border-white/5 text-surface-200 hover:border-white/20 hover:bg-white/[0.03] focus:outline-none focus:ring-2 focus:ring-primary-500/50';
                if (revealed) {
                  if (isCorrect) cls = 'quiz-option-correct border focus:outline-none';
                  else if (isChosen && !isCorrect) cls = 'quiz-option-wrong border focus:outline-none';
                  else cls = 'opacity-40 border-white/5 focus:outline-none';
                }
                return (
                  <motion.button
                    key={key}
                    onClick={() => handleAnswer(key)}
                    disabled={revealed}
                    whileHover={!revealed ? { x: 4 } : {}}
                    whileTap={!revealed ? { scale: 0.98 } : {}}
                    className={`w-full text-left px-5 py-4 rounded-2xl border transition-all duration-300 flex items-center gap-4 ${cls}`}
                    aria-pressed={isChosen}
                    aria-label={`Option ${key}: ${val}`}
                  >
                    <span className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-xs font-bold shrink-0">
                      {key}
                    </span>
                    <span className="text-sm leading-snug">{val}</span>
                    {revealed && isCorrect && <span className="ml-auto text-success-400" aria-label="Correct">✓</span>}
                    {revealed && isChosen && !isCorrect && <span className="ml-auto text-danger-400" aria-label="Incorrect">✗</span>}
                  </motion.button>
                );
              })}
            </div>

            {/* Explanation */}
            <AnimatePresence>
              {revealed && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="glass rounded-2xl p-5 mb-6 border border-primary-500/20"
                  role="status"
                  aria-live="polite"
                >
                  <div className="text-[10px] font-bold text-primary-400 uppercase tracking-widest mb-2">Explanation</div>
                  <p className="text-sm text-surface-300 leading-relaxed">{questions[currentQ].explanation}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {revealed && (
              <motion.button
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={handleNext}
                className="w-full py-4 bg-primary-500 hover:bg-primary-400 text-white font-semibold rounded-2xl transition-all shadow-xl shadow-primary-500/20"
              >
                {currentQ < questions.length - 1 ? 'Next Question →' : 'See Results →'}
                <span className="ml-2 text-xs opacity-60">↵ Enter</span>
              </motion.button>
            )}
          </motion.div>
        )}

        {/* ── Results ── */}
        {phase === 'results' && (
          <motion.div
            key="results"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 14 }}
              className="text-8xl mb-6"
              aria-hidden="true"
            >
              {getGrade(score).icon}
            </motion.div>

            <div className={`inline-flex items-center gap-2 px-5 py-2 rounded-full border text-sm font-bold tracking-wider mb-6 ${getGrade(score).bg} ${getGrade(score).color}`}>
              {getGrade(score).label}
            </div>

            <ScoreDisplay score={score} total={questions.length} />

            {/* Trend indicator */}
            {trend && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className={`inline-flex items-center gap-1 text-xs font-medium mb-2 ${
                  trend === 'improved' ? 'text-success-400' : trend === 'lower' ? 'text-warning-400' : 'text-surface-500'
                }`}
              >
                {trend === 'improved' && '↑ Improved from last attempt'}
                {trend === 'lower' && '↓ Lower than last attempt'}
                {trend === 'same' && '→ Same as last attempt'}
              </motion.div>
            )}

            <div className="text-surface-400 mb-10 text-sm">
              {Math.round((score / questions.length) * 100)}% correct on{' '}
              <span className="text-primary-400">{selectedTopic?.label}</span>
            </div>

            {/* Breakdown */}
            <div className="space-y-3 mb-10 text-left">
              {questions.map((q, i) => {
                const chosen = answers[i];
                const correct = chosen === q.correct;
                return (
                  <div
                    key={i}
                    className={`glass rounded-2xl px-5 py-3 flex items-start gap-3 border ${correct ? 'border-success-500/20' : 'border-danger-500/20'}`}
                  >
                    <span className={`text-base shrink-0 mt-0.5 ${correct ? 'text-success-400' : 'text-danger-400'}`}>
                      {correct ? '✓' : '✗'}
                    </span>
                    <div className="min-w-0">
                      <p className="text-xs text-surface-300 leading-snug line-clamp-2">{q.question}</p>
                      {!correct && (
                        <p className="text-[11px] text-success-400 mt-1">
                          Correct: {q.correct}. {q.options[q.correct]}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={() => handleTopicSelect(selectedTopic)}
                className="px-8 py-3 bg-primary-500 hover:bg-primary-400 text-white font-semibold rounded-full transition-all shadow-lg"
              >
                Retry Topic
              </button>
              <button
                onClick={handleRetry}
                className="px-8 py-3 glass text-surface-200 hover:bg-white/5 rounded-full transition-elegant"
              >
                New Topic
              </button>
              <button
                onClick={handleShare}
                className="px-6 py-3 glass text-surface-300 hover:bg-white/5 rounded-full transition-elegant flex items-center gap-2"
                title={copied ? 'Copied!' : 'Share result'}
              >
                {copied ? '✓ Copied' : '↗ Share'}
              </button>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
