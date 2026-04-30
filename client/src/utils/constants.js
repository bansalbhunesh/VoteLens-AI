/**
 * VoteLens AI — Constants
 */

export const SIMULATION_STEPS = [
  {
    id: 1,
    name: 'Preparation',
    title: 'Before You Leave Home',
    icon: '📋',
    description: 'Gather your documents and know your polling station.',
  },
  {
    id: 2,
    name: 'Arriving at the Booth',
    title: 'At the Polling Station',
    icon: '🏛️',
    description: 'What to expect when you arrive.',
  },
  {
    id: 3,
    name: 'Identity Verification',
    title: 'The Officer Checks Your ID',
    icon: '🪪',
    description: 'The polling officer verifies your identity.',
  },
  {
    id: 4,
    name: 'Inking',
    title: 'The Indelible Ink',
    icon: '✍️',
    description: 'Ink is applied to your finger as proof of voting.',
  },
  {
    id: 5,
    name: 'Using the EVM',
    title: 'Cast Your Vote',
    icon: '🗳️',
    description: 'Press the button next to your chosen candidate.',
  },
  {
    id: 6,
    name: 'VVPAT Verification',
    title: 'Verify Your Vote',
    icon: '📄',
    description: 'Check the paper slip to confirm your vote.',
  },
  {
    id: 7,
    name: 'Completion',
    title: 'You Did It!',
    icon: '🎉',
    description: 'Congratulations — you\'ve exercised your democratic right!',
  },
];

export const QUICK_PROMPTS = [
  { text: "I just turned 18 — how do I register?", icon: "🎂" },
  { text: "I moved to a new city — can I vote?", icon: "🏙️" },
  { text: "What if I press the wrong button?", icon: "😰" },
  { text: "Is my vote really secret?", icon: "🤫" },
  { text: "What documents do I need?", icon: "📄" },
  { text: "What is NOTA?", icon: "❌" },
  { text: "Can someone else vote for me?", icon: "👥" },
  { text: "What time do polling stations open?", icon: "⏰" },
];

export const EVM_CANDIDATES = [
  { id: 1, name: 'Candidate A', party: 'National Unity Party', symbol: '🌸' },
  { id: 2, name: 'Candidate B', party: 'Progressive Alliance', symbol: '🌿' },
  { id: 3, name: 'Candidate C', party: 'Democratic Front', symbol: '⭐' },
  { id: 4, name: 'Candidate D', party: 'Peoples Voice', symbol: '🔔' },
  { id: 5, name: 'Candidate E', party: 'Independent', symbol: '🏠' },
  { id: 6, name: 'NOTA', party: 'None of the Above', symbol: '✖️' },
];

export const NAV_ITEMS = [
  { path: '/', label: 'Home', icon: '🏠' },
  { path: '/simulate', label: 'Simulate', icon: '🗳️' },
  { path: '/verify', label: 'Verify', icon: '🔍' },
  { path: '/mentor', label: 'AI Mentor', icon: '💬' },
];
