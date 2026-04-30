import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FileUpload from '../components/FileUpload';
import { analyzeImage, verifyClaim } from '../utils/api';

export default function Verify() {
  const [tab, setTab] = useState('verify'); // 'verify' | 'analyze'
  const [claimText, setClaimText] = useState('');
  const [result, setResult] = useState(null);
  const [sources, setSources] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

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
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-black mb-2">Verify & Analyze</h1>
        <p className="text-surface-200">Fact-check election claims or analyze voting documents with AI.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 glass rounded-xl p-1.5" role="tablist">
        {[
          { id: 'verify', label: '🔍 Fact-Check a Claim', desc: 'Verify election information' },
          { id: 'analyze', label: '📸 Analyze a Document', desc: 'Upload voter slip or screenshot' },
        ].map((t) => (
          <button key={t.id} onClick={() => { setTab(t.id); setResult(null); setError(''); }} role="tab" aria-selected={tab === t.id} className={`flex-1 py-3 px-4 rounded-lg text-sm font-medium transition-all ${tab === t.id ? 'bg-primary-600/20 text-primary-300 shadow-lg shadow-primary-500/10' : 'text-surface-200 hover:text-white hover:bg-white/5'}`} id={`tab-${t.id}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <AnimatePresence mode="wait">
        <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
          {tab === 'verify' ? (
            <div className="glass rounded-2xl p-6">
              <label htmlFor="claim-input" className="block text-sm font-medium text-surface-200 mb-2">Paste a claim, WhatsApp message, or election rumor:</label>
              <textarea id="claim-input" value={claimText} onChange={(e) => setClaimText(e.target.value)} placeholder="e.g., 'EVMs can be hacked using a smartphone app'" className="w-full bg-surface-900/50 rounded-xl p-4 text-sm text-surface-50 placeholder-surface-200 border border-white/5 focus:border-primary-500/50 focus:outline-none resize-none min-h-[100px]" rows={4} />
              <div className="flex items-center justify-between mt-4">
                <p className="text-xs text-surface-200">Uses Google Search grounding for real-time verification</p>
                <motion.button onClick={handleVerify} disabled={!claimText.trim() || isLoading} whileTap={{ scale: 0.95 }} className="px-6 py-2.5 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed" id="verify-btn">
                  {isLoading ? 'Verifying...' : '🔍 Verify'}
                </motion.button>
              </div>
            </div>
          ) : (
            <div className="glass rounded-2xl p-6">
              <p className="text-sm text-surface-200 mb-4">Upload a voter ID, election notice, polling slip, or any election-related image.</p>
              <FileUpload onUpload={handleImageUpload} isLoading={isLoading} />
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Error */}
      {error && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-6 p-4 rounded-xl bg-danger-500/10 border border-danger-500/20 text-danger-400 text-sm" role="alert">
          {error}
        </motion.div>
      )}

      {/* Result */}
      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
          <div className="glass rounded-2xl p-6">
            <h3 className="text-sm font-bold text-primary-400 uppercase tracking-wider mb-4">
              {tab === 'verify' ? '🔍 Verification Result' : '📄 Analysis Result'}
            </h3>
            <div className="markdown-content text-surface-200 leading-relaxed whitespace-pre-wrap">{result}</div>
          </div>

          {/* Sources */}
          {sources.length > 0 && (
            <div className="mt-4">
              <h4 className="text-xs font-bold text-surface-200 uppercase tracking-wider mb-3">📚 Sources (Google Search)</h4>
              <div className="space-y-2">
                {sources.map((s, i) => (
                  <a key={i} href={s.url} target="_blank" rel="noopener noreferrer" className="block glass rounded-xl p-3 hover:bg-white/[0.04] transition-colors group">
                    <p className="text-sm text-surface-50 group-hover:text-primary-300 transition-colors">{s.title}</p>
                    <p className="text-xs text-surface-200 truncate mt-0.5">{s.url}</p>
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
