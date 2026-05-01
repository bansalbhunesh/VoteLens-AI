import { useState, useRef, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import FileUpload from '../components/FileUpload';
import MarkdownText from '../components/MarkdownText';
import { analyzeImage, streamVerify } from '../utils/api';
import { useGlobalContext } from '../hooks/useGlobalContext';

const RECENT_KEY = 'votelens_recent_claims';
const MAX_RECENT = 5;

function loadRecent() {
  try { return JSON.parse(sessionStorage.getItem(RECENT_KEY) || '[]'); } catch { return []; }
}
function addRecent(list, claim) {
  const trimmed = claim.slice(0, 120);
  const updated = [trimmed, ...list.filter((c) => c !== trimmed)].slice(0, MAX_RECENT);
  try { sessionStorage.setItem(RECENT_KEY, JSON.stringify(updated)); } catch {}
  return updated;
}

// Parse streaming text into reasoning steps
function parseReasoningSteps(fullText) {
  const steps = [];
  const stepRegex = /\[STEP\]\s*(.+)/g;
  let match;
  const positions = [];

  while ((match = stepRegex.exec(fullText)) !== null) {
    positions.push({ label: match[1].trim(), index: match.index, endIndex: match.index + match[0].length });
  }

  for (let i = 0; i < positions.length; i++) {
    const start = positions[i].endIndex;
    const end = i + 1 < positions.length ? positions[i + 1].index : fullText.length;
    const content = fullText.slice(start, end).trim();
    steps.push({
      label: positions[i].label,
      content,
      isComplete: i + 1 < positions.length, // complete if there's a next step
    });
  }

  return steps;
}

// Extract verdict from content
function parseVerdict(text) {
  if (!text) return null;
  const match = text.match(/\[VERDICT\]\s*(TRUE|FALSE|PARTIALLY TRUE|UNVERIFIABLE|INVALID)/i);
  if (!match) return null;
  const verdict = match[1].toUpperCase();
  const cleanText = text.replace(/\[VERDICT\].*?\n/i, '').trim();

  let color = 'bg-surface-500/20 text-surface-200 border-surface-500/30';
  let icon = '❓';
  let glow = '';

  if (verdict === 'TRUE') { color = 'bg-success-500/20 text-success-400 border-success-500/30'; icon = '✅'; glow = 'shadow-success-500/20'; }
  if (verdict === 'FALSE') { color = 'bg-danger-500/20 text-danger-400 border-danger-500/30'; icon = '❌'; glow = 'shadow-danger-500/20'; }
  if (verdict === 'PARTIALLY TRUE') { color = 'bg-warning-500/20 text-warning-400 border-warning-500/30'; icon = '⚠️'; glow = 'shadow-warning-500/20'; }
  if (verdict === 'INVALID') { color = 'bg-surface-500/20 text-surface-400 border-surface-500/30'; icon = '🛑'; glow = ''; }

  return { verdict, cleanText, color, icon, glow };
}

const STEP_ICONS = {
  'Analyzing Claim': '🔬',
  'Searching Evidence': '🌐',
  'Cross-Referencing Sources': '⚖️',
  'Synthesizing Verdict': '🎯',
};

export default function Verify() {
  const [tab, setTab] = useState('verify');
  const [claimText, setClaimText] = useState('');
  const [streamedText, setStreamedText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [result, setResult] = useState(null); // for image analysis
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [recentClaims, setRecentClaims] = useState(() => loadRecent());
  const abortRef = useRef(null);
  const [searchParams] = useSearchParams();
  const didAutoVerifyRef = useRef(false);
  const ctx = useGlobalContext();

  const reasoningSteps = parseReasoningSteps(streamedText);
  const lastStep = reasoningSteps[reasoningSteps.length - 1];
  const verdictData = lastStep ? parseVerdict(lastStep.content) : null;

  const handleStreamVerify = async (claimOverride) => {
    const claim = (claimOverride || claimText).trim();
    if (!claim) return;

    setIsStreaming(true);
    setIsComplete(false);
    setStreamedText('');
    setError('');
    setResult(null);

    abortRef.current?.abort();
    abortRef.current = new AbortController();

    try {
      let fullText = '';
      const stream = streamVerify(claim, abortRef.current.signal);

      for await (const chunk of stream) {
        fullText += chunk;
        setStreamedText(fullText);
      }

      setIsComplete(true);
      setRecentClaims(addRecent(recentClaims, claim));

      // Record in global context for cross-screen orchestration
      const verdict = parseVerdict(fullText);
      ctx.recordVerification(claim, verdict?.verdict || 'UNKNOWN');
    } catch (err) {
      if (err.name === 'AbortError') return;
      setError(err.message || 'Verification failed');
    } finally {
      setIsStreaming(false);
    }
  };

  // Auto-verify from ?claim= parameter (Omni-Intent routing)
  useEffect(() => {
    const claim = searchParams.get('claim');
    if (claim && !didAutoVerifyRef.current && !isStreaming && !isComplete) {
      didAutoVerifyRef.current = true;
      setClaimText(claim);
      // Small delay to show the claim in the textarea first
      setTimeout(() => handleStreamVerify(claim), 300);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleImageUpload = async (file) => {
    setIsLoading(true);
    setResult(null);
    setStreamedText('');
    setError('');
    try {
      const data = await analyzeImage(file, 'Analyze this election-related image');
      setResult(data.analysis);
    } catch (err) {
      setError(err.message || 'Analysis failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    abortRef.current?.abort();
    setIsStreaming(false);
  };

  const handleReset = () => {
    setStreamedText('');
    setIsComplete(false);
    setClaimText('');
    setResult(null);
    setError('');
    didAutoVerifyRef.current = false;
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <div className="mb-12">
        <h1 className="text-3xl font-light tracking-tight mb-2 text-surface-50/90">Verify</h1>
        <p className="text-sm text-surface-200/60 font-light">Fact-check rumors or analyze documents with precision.</p>
      </div>

      {/* Elegant Tabs */}
      <div className="flex gap-8 mb-12 border-b border-white/5" role="tablist">
        {[
          { id: 'verify', label: 'Fact-Check' },
          { id: 'analyze', label: 'Analyze Document' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => { setTab(t.id); handleReset(); }}
            className={`pb-4 text-sm font-medium transition-elegant relative ${
              tab === t.id ? 'text-surface-50' : 'text-surface-200/40 hover:text-surface-200/60'
            }`}
          >
            {t.label}
            {tab === t.id && (
              <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500/60" />
            )}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.5 }}
        >
          {tab === 'verify' ? (
            <div className="space-y-4">
              {!isStreaming && !isComplete && (
                <>
                  <textarea
                    value={claimText}
                    onChange={(e) => setClaimText(e.target.value)}
                    placeholder="Paste an election rumour or claim to fact-check…"
                    className="w-full bg-surface-800/20 rounded-[32px] p-8 text-lg text-surface-50 placeholder-surface-200/20 border border-white/5 focus:border-white/10 focus:ring-0 resize-none min-h-[180px] font-light transition-elegant"
                  />

                  {/* Recent checks */}
                  {recentClaims.length > 0 && (
                    <div className="flex flex-wrap items-center gap-2 px-1">
                      <span className="text-[10px] text-surface-700 uppercase tracking-wider shrink-0">Recent:</span>
                      {recentClaims.map((claim, i) => (
                        <button
                          key={i}
                          onClick={() => setClaimText(claim)}
                          className="text-[11px] text-surface-500 hover:text-surface-200 px-2.5 py-1 rounded-full border border-white/[0.06] hover:border-white/15 hover:bg-white/[0.04] transition-all max-w-[220px] truncate text-left"
                          title={claim}
                        >
                          {claim}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      onClick={() => handleStreamVerify()}
                      disabled={!claimText.trim()}
                      className="px-10 py-4 bg-surface-50 text-surface-950 rounded-full font-medium transition-elegant disabled:opacity-10 flex items-center gap-2"
                    >
                      Verify Claim
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="glass rounded-[40px] p-12">
              <FileUpload onUpload={handleImageUpload} isLoading={isLoading} />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Error State */}
      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-8 p-6 glass border-danger-500/30 rounded-2xl">
          <p className="text-danger-400 text-sm flex items-center gap-2">
            <span>⚠️</span> {error}
          </p>
        </motion.div>
      )}

      {/* ── Streaming Chain-of-Thought Reasoning ── */}
      {(isStreaming || isComplete) && tab === 'verify' && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 space-y-6"
        >
          {/* Claim being verified */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary-500/15 flex items-center justify-center text-sm">🔬</div>
              <div>
                <div className="text-[10px] font-bold text-primary-400 uppercase tracking-widest">Verifying</div>
                <p className="text-sm text-surface-400 max-w-md truncate">{claimText}</p>
              </div>
            </div>
            {isStreaming ? (
              <button onClick={handleCancel} className="text-xs text-surface-500 hover:text-surface-300 transition-colors px-3 py-1.5 rounded-full border border-white/10 hover:bg-white/5">
                Cancel
              </button>
            ) : (
              <button onClick={handleReset} className="text-xs text-surface-500 hover:text-surface-300 transition-colors px-3 py-1.5 rounded-full border border-white/10 hover:bg-white/5">
                New Claim
              </button>
            )}
          </div>

          {/* Reasoning Steps */}
          <div className="space-y-4">
            {reasoningSteps.map((step, i) => {
              const isLast = i === reasoningSteps.length - 1;
              const isActive = isLast && isStreaming;
              const stepIcon = STEP_ICONS[step.label] || '⚡';

              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="relative"
                >
                  {/* Connector line */}
                  {i < reasoningSteps.length - 1 && (
                    <div className="absolute left-5 top-12 bottom-0 w-px bg-gradient-to-b from-primary-500/30 to-transparent -mb-4" />
                  )}

                  <div className={`glass rounded-2xl p-6 border transition-all duration-500 ${
                    isActive
                      ? 'border-primary-500/30 shadow-lg shadow-primary-500/5'
                      : step.isComplete
                      ? 'border-white/5 opacity-90'
                      : 'border-primary-500/20'
                  }`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg transition-all ${
                        isActive ? 'bg-primary-500/20 reasoning-step-active' : 'bg-white/5'
                      }`}>
                        {stepIcon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-sm font-bold text-surface-50 flex items-center gap-2">
                          {step.label}
                          {isActive && (
                            <span className="inline-flex gap-1 ml-1">
                              <span className="w-1 h-1 bg-primary-400 rounded-full animate-bounce" />
                              <span className="w-1 h-1 bg-primary-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                              <span className="w-1 h-1 bg-primary-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                            </span>
                          )}
                          {step.isComplete && !isActive && (
                            <span className="text-success-400 text-xs">✓</span>
                          )}
                        </h3>
                      </div>
                      <div className="text-[10px] text-surface-600 font-bold tabular-nums">
                        STEP {i + 1}/{reasoningSteps.length >= 4 ? 4 : '?'}
                      </div>
                    </div>

                    {step.content && (
                      <div className="pl-[52px]">
                        {/* Check if this is the verdict step */}
                        {verdictData && i === reasoningSteps.length - 1 ? (
                          <div>
                            <motion.div
                              initial={{ opacity: 0, scale: 0.9 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                              className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-bold tracking-wider mb-4 shadow-lg ${verdictData.color} ${verdictData.glow}`}
                            >
                              <span className="text-lg">{verdictData.icon}</span>
                              {verdictData.verdict}
                            </motion.div>
                            <div className="markdown-content text-surface-200/80 font-light leading-relaxed [&_p]:text-base [&_p]:mb-3 [&_h3]:text-sm [&_h3]:font-bold [&_h3]:text-surface-50 [&_h3]:mt-4 [&_h3]:mb-1 [&_h4]:text-sm [&_h4]:font-bold [&_h4]:text-surface-50 [&_h4]:mt-3 [&_h4]:mb-1">
                              <MarkdownText content={verdictData.cleanText} />
                            </div>
                          </div>
                        ) : (
                          <p className="text-sm text-surface-300/80 leading-relaxed">
                            {step.content}
                            {isActive && (
                              <span className="inline-block w-0.5 h-4 bg-primary-400 ml-0.5 animate-pulse align-middle" />
                            )}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}

            {/* Show initial loading state before first step arrives */}
            {isStreaming && reasoningSteps.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass rounded-2xl p-6 border border-primary-500/20"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-500/20 flex items-center justify-center reasoning-step-active">
                    <span className="text-lg">🔬</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-primary-400 font-medium">
                    Initializing verification engine
                    <span className="inline-flex gap-1 ml-1">
                      <span className="w-1 h-1 bg-primary-400 rounded-full animate-bounce" />
                      <span className="w-1 h-1 bg-primary-400 rounded-full animate-bounce [animation-delay:0.15s]" />
                      <span className="w-1 h-1 bg-primary-400 rounded-full animate-bounce [animation-delay:0.3s]" />
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Copy result button */}
          {isComplete && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center justify-end gap-3"
            >
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(streamedText).catch(() => {});
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="text-xs text-surface-500 hover:text-surface-300 transition-colors flex items-center gap-1"
              >
                {copied ? '✓ Copied' : 'Copy full result'}
              </button>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Image Analysis Results (unchanged) */}
      {result && tab === 'analyze' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-16 space-y-12" role="region" aria-label="Analysis result">
          <div className="max-w-prose">
            <h3 className="text-xs font-medium text-primary-400 uppercase tracking-[0.3em] mb-6">Result</h3>
            <div className="markdown-content text-surface-200/80 font-light leading-relaxed [&_p]:text-lg [&_p]:mb-3 [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-surface-50 [&_h3]:mt-4 [&_h3]:mb-1">
              <MarkdownText content={result} />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
