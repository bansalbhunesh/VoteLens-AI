import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FileUpload from '../components/FileUpload';
import MarkdownText from '../components/MarkdownText';
import { analyzeImage, verifyClaim } from '../utils/api';

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

export default function Verify() {
  const [tab, setTab] = useState('verify');
  const [claimText, setClaimText] = useState('');
  const [result, setResult] = useState(null);
  const [sources, setSources] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState('');
  const [recentClaims, setRecentClaims] = useState(() => loadRecent());

  const parseVerdict = (text) => {
    if (!text) return null;
    const match = text.match(/\[VERDICT\]\s*(TRUE|FALSE|PARTIALLY TRUE|UNVERIFIABLE|INVALID)/i);
    if (!match) return null;
    
    const verdict = match[1].toUpperCase();
    const cleanText = text.replace(/\[VERDICT\].*?\n/i, '').trim();
    
    let color = 'bg-surface-500/20 text-surface-200 border-surface-500/30';
    let icon = '❓';
    
    if (verdict === 'TRUE') { color = 'bg-success-500/20 text-success-400 border-success-500/30'; icon = '✅'; }
    if (verdict === 'FALSE') { color = 'bg-danger-500/20 text-danger-400 border-danger-500/30'; icon = '❌'; }
    if (verdict === 'PARTIALLY TRUE') { color = 'bg-warning-500/20 text-warning-400 border-warning-500/30'; icon = '⚠️'; }
    if (verdict === 'INVALID') { color = 'bg-surface-500/20 text-surface-400 border-surface-500/30'; icon = '🛑'; }
    
    return { verdict, cleanText, color, icon };
  };

  const parsedResult = tab === 'verify' && result ? parseVerdict(result) : null;

  const handleVerify = async () => {
    if (!claimText.trim()) return;
    setIsLoading(true);
    setResult(null);
    setSources([]);
    setError('');
    try {
      const data = await verifyClaim(claimText.trim());
      setResult(data.text);
      setSources(data.sources || []);
      setRecentClaims(addRecent(recentClaims, claimText.trim()));
    } catch (err) {
      setError(err.message || 'Verification failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageUpload = async (file) => {
    setIsLoading(true);
    setResult(null);
    setSources([]);
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
            onClick={() => { setTab(t.id); setResult(null); setError(''); }}
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
              <textarea
                value={claimText}
                onChange={(e) => setClaimText(e.target.value)}
                placeholder="Paste an election rumour or claim to fact-check…"
                className="w-full bg-surface-800/20 rounded-[32px] p-8 text-lg text-surface-50 placeholder-surface-200/20 border border-white/5 focus:border-white/10 focus:ring-0 resize-none min-h-[180px] font-light transition-elegant"
              />

              {/* Recent checks */}
              {recentClaims.length > 0 && !result && (
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
                  onClick={handleVerify}
                  disabled={!claimText.trim() || isLoading}
                  className="px-10 py-4 bg-surface-50 text-surface-950 rounded-full font-medium transition-elegant disabled:opacity-10 flex items-center gap-2"
                >
                  {isLoading && <div className="w-4 h-4 border-2 border-surface-600 border-t-surface-900 rounded-full animate-spin" />}
                  {isLoading ? 'Verifying…' : 'Verify Claim'}
                </button>
              </div>
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

      {/* Results */}
      {result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-16 space-y-12" role="region" aria-label="Verification result">
          <div className="max-w-prose">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xs font-medium text-primary-400 uppercase tracking-[0.3em]">Result</h3>
              <button
                onClick={async () => {
                  const text = parsedResult ? `${parsedResult.verdict}\n\n${parsedResult.cleanText}` : result;
                  await navigator.clipboard.writeText(text).catch(() => {});
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="text-xs text-surface-500 hover:text-surface-300 transition-colors flex items-center gap-1"
              >
                {copied ? '✓ Copied' : 'Copy result'}
              </button>
            </div>

            {parsedResult && (
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-bold tracking-wider mb-6 ${parsedResult.color}`}>
                <span>{parsedResult.icon}</span>
                {parsedResult.verdict}
              </div>
            )}

            <div className="markdown-content text-surface-200/80 font-light leading-relaxed [&_p]:text-lg [&_p]:mb-3 [&_h3]:text-base [&_h3]:font-bold [&_h3]:text-surface-50 [&_h3]:mt-4 [&_h3]:mb-1 [&_h4]:text-sm [&_h4]:font-bold [&_h4]:text-surface-50 [&_h4]:mt-3 [&_h4]:mb-1">
              <MarkdownText content={parsedResult ? parsedResult.cleanText : result} />
            </div>
          </div>

          {sources.length > 0 && (
            <div>
              <h4 className="text-xs font-medium text-surface-200/40 uppercase tracking-[0.2em] mb-6">Sources</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sources.map((s, i) => (
                  <a
                    key={i}
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="glass rounded-2xl p-6 hover:bg-white/5 transition-elegant group"
                  >
                    <p className="text-sm text-surface-50 group-hover:text-primary-400 transition-colors font-medium mb-1 truncate">{s.title}</p>
                    <p className="text-xs text-surface-200/30 truncate font-light">{s.url}</p>
                  </a>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
