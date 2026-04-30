import { motion, AnimatePresence } from 'framer-motion';

export default function SimulationStage({ step, onAction, data }) {
  const renderStage = () => {
    switch (step) {
      case 1: return <PreparationStage />;
      case 2: return <PollingStationStage />;
      case 3: return <IDVerificationStage />;
      case 4: return <InkingStage />;
      case 5: return <EVMStage onVote={(c) => onAction('vote', c)} hasVoted={data.hasVoted} selectedCandidate={data.selectedCandidate} />;
      case 6: return <VVPATStage candidate={data.selectedCandidate} show={data.showVVPAT} secondsLeft={data.vvpatSecondsLeft} />;
      case 7: return <CompletionStage />;
      default: return null;
    }
  };

  return (
    <div className="w-full max-w-4xl h-[400px] glass rounded-[40px] mb-8 relative overflow-hidden flex items-center justify-center p-6 border border-white/5">
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.05, y: -20 }}
          transition={{ duration: 0.5, ease: 'circOut' }}
          className="w-full h-full flex items-center justify-center"
        >
          {renderStage()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/* ── Step 1: Preparation ── */
function PreparationStage() {
  const docs = [
    { icon: '🪪', label: 'Voter ID (EPIC)' },
    { icon: '📱', label: 'Aadhaar Card' },
    { icon: '🚗', label: 'Driving Licence' },
    { icon: '📄', label: 'PAN Card' },
  ];
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-sm">
      <div className="text-surface-400 font-bold uppercase tracking-widest text-xs">Gather Your Documents</div>
      <div className="grid grid-cols-2 gap-3 w-full">
        {docs.map((d, i) => (
          <motion.div
            key={d.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
            className="glass rounded-2xl p-4 flex items-center gap-3 border border-white/5"
          >
            <span className="text-2xl">{d.icon}</span>
            <span className="text-xs text-surface-300 font-medium">{d.label}</span>
          </motion.div>
        ))}
      </div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-xs text-accent-400 font-medium"
      >
        Any ONE of the 12 ECI-approved documents
      </motion.div>
    </div>
  );
}

/* ── Step 2: Arriving at the Polling Station ── */
function PollingStationStage() {
  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 3.5, repeat: Infinity }}
        className="text-8xl"
      >
        🏛️
      </motion.div>
      <div className="text-surface-300 font-bold tracking-widest uppercase text-xs">Polling Station 104-B</div>
      <div className="flex gap-3 mt-2">
        {['👤', '👤', '👤', '👤'].map((p, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.2 }}
            className="text-2xl"
          >
            {p}
          </motion.span>
        ))}
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 1 }}
          className="text-2xl"
        >
          👣
        </motion.span>
      </div>
      <div className="text-xs text-primary-400 font-medium mt-1">Separate queues for men and women</div>
    </div>
  );
}

/* ── Step 3: Identity Verification ── */
function IDVerificationStage() {
  return (
    <div className="flex flex-col items-center gap-5">
      <motion.div
        initial={{ rotateY: 0 }}
        animate={{ rotateY: [0, 20, 0, -20, 0] }}
        transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
        className="text-8xl"
      >
        🪪
      </motion.div>
      <div className="flex items-center gap-3">
        <motion.div
          animate={{ scaleX: [1, 1.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="h-0.5 w-16 bg-primary-500/60 rounded-full"
        />
        <span className="text-primary-400 font-medium text-sm">Verifying identity…</span>
        <motion.div
          animate={{ scaleX: [1, 1.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, delay: 0.75 }}
          className="h-0.5 w-16 bg-primary-500/60 rounded-full"
        />
      </div>
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.8, type: 'spring' }}
        className="px-4 py-2 rounded-full bg-success-500/10 border border-success-500/30 text-success-400 text-xs font-bold tracking-wider"
      >
        ✓ EPIC Card Accepted
      </motion.div>
    </div>
  );
}

/* ── Step 4: Inking ── */
function InkingStage() {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <motion.div
          animate={{ rotate: [0, 4, 0, -4, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 1 }}
          className="text-8xl"
        >
          ☝️
        </motion.div>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5, type: 'spring' }}
          className="absolute -top-1 -right-1 w-7 h-7 rounded-full border-2 border-white/20"
          style={{ background: '#3b0764' }}
        />
      </div>
      <div className="text-surface-300 font-medium text-sm">Indelible ink applied to left forefinger</div>
      <div className="text-xs text-surface-500 text-center max-w-[220px]">
        Silver nitrate formula — cannot be washed off for weeks
      </div>
    </div>
  );
}

/* ── Step 5: EVM ── */
function EVMStage({ onVote, hasVoted, selectedCandidate }) {
  const candidates = [
    { id: 1, name: 'Candidate A', symbol: '🌸' },
    { id: 2, name: 'Candidate B', symbol: '🌿' },
    { id: 3, name: 'Candidate C', symbol: '☀️' },
    { id: 4, name: 'NOTA', symbol: '✖️' },
  ];

  return (
    <div className="bg-[#334155] p-5 rounded-2xl border-4 border-[#1e293b] shadow-2xl w-full max-w-xs">
      <div className="bg-[#0f172a] px-4 py-2.5 mb-4 rounded-lg flex justify-between items-center border border-white/5">
        <div className="text-[#10b981] font-mono text-xs font-bold">
          {hasVoted ? 'VOTE CAST' : 'READY'}
        </div>
        <div className={`w-3 h-3 rounded-full transition-all ${hasVoted ? 'bg-red-500 shadow-[0_0_10px_red]' : 'bg-green-500 shadow-[0_0_10px_#10b981] animate-pulse'}`} />
      </div>

      <div className="space-y-2">
        {candidates.map((c) => {
          const isSelected = selectedCandidate?.id === c.id;
          return (
            <div key={c.id} className={`bg-white flex items-center p-2 rounded border-b-2 transition-all ${isSelected ? 'border-red-400 bg-red-50' : 'border-slate-300'}`}>
              <div className="w-7 h-7 flex items-center justify-center text-lg mr-2">{c.symbol}</div>
              <div className="flex-1 text-slate-800 font-bold text-[11px] uppercase">{c.name}</div>
              <motion.button
                onClick={() => !hasVoted && onVote(c)}
                disabled={hasVoted}
                whileTap={!hasVoted ? { scale: 0.8 } : {}}
                aria-label={`Vote for ${c.name}`}
                className={`w-9 h-7 rounded-sm flex items-center justify-center shadow-md transition-all ${
                  isSelected
                    ? 'bg-red-500 shadow-red-500/40'
                    : hasVoted
                    ? 'bg-slate-400 opacity-40 cursor-not-allowed'
                    : 'bg-blue-600 hover:bg-blue-500 active:translate-y-0.5'
                }`}
              >
                <div className="w-3 h-3 bg-white/30 rounded-full border border-white/50" />
              </motion.button>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ── Step 6: VVPAT ── */
function VVPATStage({ candidate, show, secondsLeft }) {
  return (
    <div className="flex flex-col items-center gap-4">
      <div className="text-xs text-accent-400 font-bold uppercase tracking-widest mb-1">VVPAT — Paper Audit Trail</div>
      <div
        className="bg-slate-900 border-8 border-slate-700 rounded-xl shadow-inner overflow-hidden flex items-start justify-center"
        style={{ width: 140, height: 180 }}
      >
        <AnimatePresence>
          {show && candidate && (
            <motion.div
              initial={{ y: -200 }}
              animate={{ y: 8 }}
              exit={{ y: 200, opacity: 0 }}
              transition={{ duration: 1.2, ease: [0.4, 0, 0.2, 1] }}
              className="bg-white w-24 p-2 flex flex-col items-center shadow-lg"
            >
              <div className="text-[8px] font-bold text-slate-400 border-b border-slate-200 w-full text-center pb-1 mb-1">VVPAT SLIP</div>
              <div className="text-4xl my-1">{candidate.symbol}</div>
              <div className="text-[9px] font-black text-slate-800 text-center uppercase leading-tight">{candidate.name}</div>
              <div className="text-[6px] text-slate-400 mt-2">SR: 8742910</div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="text-xs text-primary-400 font-medium text-center">
        {show
          ? <><span className="tabular-nums font-bold">{secondsLeft}s</span> — slip visible, then sealed in drop box</>
          : 'Cast your vote to see the paper trail'}
      </div>
    </div>
  );
}

/* ── Step 7: Completion ── */
function CompletionStage() {
  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 12 }}
        className="text-9xl"
      >
        🎉
      </motion.div>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-primary-500/20 text-primary-400 px-6 py-2 rounded-full border border-primary-500/30 font-bold uppercase tracking-widest text-sm"
      >
        Voter Duty Completed
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="text-surface-500 text-xs text-center max-w-[200px]"
      >
        Your vote is your voice. Democracy thanks you.
      </motion.div>
    </div>
  );
}
