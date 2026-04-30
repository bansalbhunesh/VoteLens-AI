import { motion } from 'framer-motion';
import { EVM_CANDIDATES } from '../utils/constants';

export default function EVMachine({ onVote, hasVoted, selectedCandidate, showVVPAT }) {
  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
      {/* EVM Unit */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full glass rounded-2xl p-6 border border-primary-500/20">
        <div className="text-center mb-4">
          <h3 className="text-sm font-bold text-primary-400 uppercase tracking-wider">Electronic Voting Machine</h3>
          <p className="text-xs text-surface-200 mt-1">Ballot Unit</p>
        </div>

        <div className="space-y-2">
          {EVM_CANDIDATES.map((candidate) => {
            const isSelected = selectedCandidate?.id === candidate.id;
            return (
              <motion.div key={candidate.id} className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${isSelected ? 'border-success-500/50 bg-success-500/10' : 'border-white/5 hover:border-primary-500/30 hover:bg-white/[0.02]'}`}>
                <span className="text-lg w-8 text-center">{candidate.id}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{candidate.name}</p>
                  <p className="text-xs text-surface-200">{candidate.party}</p>
                </div>
                <span className="text-2xl w-10 text-center">{candidate.symbol}</span>
                <motion.button
                  onClick={() => !hasVoted && onVote(candidate)}
                  disabled={hasVoted}
                  className={`w-10 h-10 rounded-lg font-bold text-xs transition-all ${isSelected ? 'bg-success-500 text-white glow-success' : hasVoted ? 'bg-surface-700 text-surface-200 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-500 text-white active:scale-90 hover:shadow-lg hover:shadow-blue-500/25'}`}
                  whileTap={!hasVoted ? { scale: 0.85 } : {}}
                  aria-label={`Vote for ${candidate.name}`}
                >
                  {isSelected ? '✓' : '●'}
                </motion.button>
                {isSelected && <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-3 h-3 bg-red-500 rounded-full shadow-lg shadow-red-500/50" title="Red indicator light" />}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* VVPAT */}
      {showVVPAT && selectedCandidate && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full glass rounded-2xl p-4 border border-accent-500/20">
          <p className="text-xs text-accent-400 font-bold uppercase tracking-wider text-center mb-3">VVPAT — Paper Audit Trail</p>
          <div className="bg-white rounded-xl p-4 text-center overflow-hidden h-24 relative">
            <motion.div className="vvpat-slip" initial={{ y: '-100%', opacity: 0 }}>
              <p className="text-black font-bold text-sm">{selectedCandidate.name}</p>
              <p className="text-gray-600 text-xs">{selectedCandidate.party}</p>
              <p className="text-3xl mt-1">{selectedCandidate.symbol}</p>
            </motion.div>
          </div>
          <p className="text-xs text-surface-200 text-center mt-2">The slip is displayed for 7 seconds, then drops into the sealed box.</p>
        </motion.div>
      )}
    </div>
  );
}
