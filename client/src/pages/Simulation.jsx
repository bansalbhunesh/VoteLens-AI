import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSimulation } from '../hooks/useSimulation';
import { SIMULATION_STEPS } from '../utils/constants';
import EVMachine from '../components/EVMachine';

export default function Simulation() {
  const sim = useSimulation();
  const step = SIMULATION_STEPS.find((s) => s.id === sim.currentStep);

  useEffect(() => {
    if (sim.currentStep > 0 && sim.currentStep !== 5) {
      sim.fetchNarration(sim.currentStep);
    }
  }, [sim.currentStep]);

  if (sim.currentStep === 0) {
    return (
      <div className="min-h-[calc(100vh-8rem)] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-lg">
          <div className="text-6xl mb-6">🗳️</div>
          <h1 className="text-3xl sm:text-4xl font-black mb-4">Virtual Polling Booth</h1>
          <p className="text-surface-200 mb-8">Experience the complete voting process step by step — from arriving at the booth to casting your vote on the EVM.</p>
          <motion.button onClick={sim.startSimulation} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="px-8 py-4 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-semibold rounded-2xl text-lg shadow-xl shadow-primary-500/25" id="start-simulation-btn">
            Begin Your Voting Journey
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-3">
          <h1 className="text-xl font-bold">Voting Simulation</h1>
          <span className="text-sm text-surface-200">Step {sim.currentStep} of {sim.totalSteps}</span>
        </div>
        <div className="flex gap-1.5" role="progressbar" aria-valuenow={sim.currentStep} aria-valuemin={1} aria-valuemax={sim.totalSteps}>
          {SIMULATION_STEPS.map((s) => (
            <div key={s.id} className={`h-2 flex-1 rounded-full transition-all duration-500 ${s.id <= sim.currentStep ? 'bg-gradient-to-r from-primary-500 to-primary-400' : s.id <= sim.currentStep ? 'bg-primary-500/30' : 'bg-surface-700'} ${sim.completedSteps.has(s.id) ? 'bg-success-500' : ''}`} />
          ))}
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div key={sim.currentStep} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.3 }}>
          {step && (
            <div className="glass rounded-2xl p-6 sm:p-8 mb-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-2xl">{step.icon}</div>
                <div>
                  <p className="text-xs text-primary-400 uppercase tracking-wider font-bold">Step {step.id}</p>
                  <h2 className="text-2xl font-bold">{step.title}</h2>
                </div>
              </div>

              {/* EVM interaction for step 5 */}
              {sim.currentStep === 5 ? (
                <div>
                  <p className="text-surface-200 mb-6">Find your chosen candidate's name and symbol on the ballot unit. Press the blue button next to their name to cast your vote.</p>
                  <EVMachine onVote={sim.castVote} hasVoted={sim.hasVoted} selectedCandidate={sim.selectedCandidate} showVVPAT={sim.showVVPAT} />
                  {sim.hasVoted && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} className="mt-6 text-center">
                      <p className="text-success-400 font-medium">✅ Your vote has been recorded!</p>
                      <p className="text-xs text-surface-200 mt-1">The red light confirms your selection. Check the VVPAT slip below.</p>
                    </motion.div>
                  )}
                </div>
              ) : (
                /* Narration */
                <div className="min-h-[120px]">
                  {sim.narration ? (
                    <div className="markdown-content text-surface-200 leading-relaxed">{sim.narration}</div>
                  ) : sim.isNarrating ? (
                    <div className="flex items-center gap-3 text-surface-200">
                      <div className="w-5 h-5 border-2 border-primary-400/30 border-t-primary-400 rounded-full animate-spin" />
                      <span className="text-sm">AI is narrating this step...</span>
                    </div>
                  ) : (
                    <p className="text-surface-200">{step.description}</p>
                  )}
                  {sim.isNarrating && sim.narration && <span className="inline-block w-1 h-4 bg-primary-400 animate-pulse align-middle ml-0.5" />}
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Buttons */}
      <div className="flex items-center justify-between">
        <button onClick={sim.prevStep} disabled={sim.currentStep <= 1} className="px-6 py-3 rounded-xl glass text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white/5 transition-colors" id="sim-prev-btn">
          ← Previous
        </button>

        {sim.currentStep === sim.totalSteps ? (
          <motion.button onClick={sim.resetSimulation} whileHover={{ scale: 1.05 }} className="px-6 py-3 rounded-xl bg-gradient-to-r from-success-500 to-success-400 text-white font-medium text-sm shadow-lg shadow-success-500/20" id="sim-restart-btn">
            🎉 Complete — Start Over
          </motion.button>
        ) : (
          <button onClick={sim.nextStep} disabled={sim.currentStep === 5 && !sim.hasVoted} className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-primary-600 text-white text-sm font-medium disabled:opacity-30 disabled:cursor-not-allowed hover:shadow-lg hover:shadow-primary-500/25 transition-all" id="sim-next-btn">
            Next Step →
          </button>
        )}
      </div>

      {/* Step thumbnails */}
      <div className="mt-8 grid grid-cols-7 gap-2">
        {SIMULATION_STEPS.map((s) => (
          <button key={s.id} onClick={() => { /* allow click on completed steps */ }} className={`py-2 rounded-lg text-center text-xs transition-all ${s.id === sim.currentStep ? 'glass border-primary-500/30 text-primary-300' : sim.completedSteps.has(s.id) ? 'bg-success-500/10 text-success-400' : 'bg-white/[0.02] text-surface-200'}`} aria-label={`Step ${s.id}: ${s.name}`}>
            <span className="text-lg block">{s.icon}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
