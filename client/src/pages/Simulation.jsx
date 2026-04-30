import { useEffect } from 'react';
import { useSimulation } from '../hooks/useSimulation';
import SimulationStage from '../components/SimulationStage';
import MarkdownText from '../components/MarkdownText';
import { SIMULATION_STEPS } from '../utils/constants';
import { motion, AnimatePresence } from 'framer-motion';

export default function Simulation() {
  const {
    currentStep,
    narration,
    isNarrating,
    completedSteps,
    hasVoted,
    selectedCandidate,
    showVVPAT,
    totalSteps,
    startSimulation,
    fetchNarration,
    nextStep,
    prevStep,
    castVote,
    resetSimulation,
  } = useSimulation();

  useEffect(() => {
    if (currentStep > 0 && !narration && !isNarrating) {
      fetchNarration(currentStep);
    }
  }, [currentStep, narration, isNarrating, fetchNarration]);

  const stepData = SIMULATION_STEPS.find((s) => s.id === currentStep);

  if (currentStep === 0) {
    return (
      <div className="pt-24 pb-12 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-[48px] p-16 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500/10 blur-[100px] rounded-full" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-500/10 blur-[100px] rounded-full" />
            
            <div className="relative z-10">
              <span className="inline-block px-4 py-1.5 rounded-full bg-primary-500/10 text-primary-400 text-xs font-bold uppercase tracking-widest mb-6">
                Interactive Learning
              </span>
              <h1 className="text-5xl font-black mb-6 leading-tight">
                Experience the <span className="gradient-text">Poll Day</span>
              </h1>
              <p className="text-surface-400 text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
                Step into a virtual polling booth. We've combined real-world ECI protocols with 
                vivid AI narration to prepare you for your democratic duty.
              </p>
              <button
                onClick={startSimulation}
                className="group relative px-10 py-5 bg-primary-500 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-primary-500/40 hover:scale-105 transition-all"
              >
                Begin Your Journey
                <span className="ml-2 group-hover:translate-x-1 transition-transform inline-block">→</span>
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-24 pb-20 px-6">
      <div className="max-w-5xl mx-auto">
        {/* Progress Header */}
        <div className="flex justify-between items-center mb-12">
          <button
            onClick={resetSimulation}
            className="text-surface-500 hover:text-white transition-colors text-sm font-medium flex items-center gap-2"
          >
            ← Exit Simulation
          </button>
          
          <div className="flex gap-2">
            {SIMULATION_STEPS.map((s) => (
              <div
                key={s.id}
                className={`h-1.5 w-12 rounded-full transition-all duration-500 ${
                  s.id === currentStep
                    ? 'bg-primary-500 w-16'
                    : completedSteps.has(s.id)
                    ? 'bg-primary-500/40'
                    : 'bg-surface-800'
                }`}
              />
            ))}
          </div>
          
          <div className="text-surface-500 text-sm font-bold tabular-nums">
            STEP {currentStep} <span className="text-surface-700">/ {totalSteps}</span>
          </div>
        </div>

        {/* Interactive Stage */}
        <SimulationStage 
          step={currentStep} 
          onAction={(type, payload) => type === 'vote' && castVote(payload)}
          data={{ hasVoted, selectedCandidate, showVVPAT }}
        />

        {/* Narration Card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass rounded-3xl p-10 min-h-[250px] relative"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-primary-500/20 rounded-2xl flex items-center justify-center text-2xl">
                  {stepData.icon}
                </div>
                <h2 className="text-3xl font-black gradient-text tracking-tight">{stepData.title}</h2>
              </div>
              
              <div className="text-surface-200 text-lg leading-relaxed mb-8">
                {isNarrating && !narration ? (
                  <div className="flex gap-2 items-center py-4 text-primary-400">
                    <span className="w-2 h-2 bg-primary-500 rounded-full animate-bounce" />
                    <span className="w-2 h-2 bg-primary-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 bg-primary-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                    <span className="ml-2 text-sm font-medium">AI Narrator is speaking...</span>
                  </div>
                ) : narration ? (
                  <MarkdownText content={narration} />
                ) : (
                  <p className="text-surface-200 text-lg leading-relaxed">{stepData.description}</p>
                )}
              </div>

              <div className="flex gap-4">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="px-6 py-3 rounded-xl border border-white/10 text-surface-400 hover:bg-white/5 disabled:opacity-0 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={nextStep}
                  disabled={(currentStep === 5 && !hasVoted) || (currentStep === 6 && !showVVPAT)}
                  className="flex-1 px-6 py-4 bg-primary-500 hover:bg-primary-400 text-white rounded-xl font-bold shadow-xl shadow-primary-500/20 transition-all flex items-center justify-center gap-2 group"
                >
                  {currentStep === totalSteps ? 'Complete Process' : 'Continue Journey'}
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </button>
              </div>
            </motion.div>
          </div>

          {/* Facts Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass rounded-3xl p-8 border-l-4 border-accent-500 h-full"
            >
              <div className="flex items-center gap-2 mb-6">
                <span className="text-accent-500 text-lg">✅</span>
                <h3 className="text-accent-500 font-bold uppercase tracking-widest text-[10px]">Verified ECI Facts</h3>
              </div>
              <ul className="space-y-4">
                {stepData.facts.map((fact, i) => (
                  <li key={i} className="flex gap-3 text-sm text-surface-400 leading-snug">
                    <span className="text-accent-500/50 shrink-0">•</span>
                    {fact}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
