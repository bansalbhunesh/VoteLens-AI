import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import FileUpload from '../components/FileUpload';
import { analyzeImage, verifyClaim } from '../utils/api';

export default function Verify() {
  const [tab, setTab] = useState('verify');
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
            <div className="space-y-6">
              <textarea
                value={claimText}
                onChange={(e) => setClaimText(e.target.value)}
                placeholder="Paste an election rumor or claim..."
                className="w-full bg-surface-800/20 rounded-[32px] p-8 text-lg text-surface-50 placeholder-surface-200/20 border border-white/5 focus:border-white/10 focus:ring-0 resize-none min-h-[200px] font-light transition-elegant"
              />
              <div className="flex justify-end">
                <button
                  onClick={handleVerify}
                  disabled={!claimText.trim() || isLoading}
                  className="px-10 py-4 bg-surface-50 text-surface-950 rounded-full font-medium transition-elegant disabled:opacity-10"
                >
                  {isLoading ? 'Verifying...' : 'Verify Claim'}
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

      {/* Results */}
      {result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-16 space-y-12">
          <div className="max-w-prose">
            <h3 className="text-xs font-medium text-primary-400 uppercase tracking-[0.3em] mb-6">Result</h3>
            <div className="markdown-content text-xl text-surface-200/80 font-light leading-relaxed">
              {result}
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
