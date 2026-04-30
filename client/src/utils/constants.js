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
    facts: [
      'You must carry your original EPIC (Voter ID card) or one of the 12 ECI-approved photo identity documents (like Aadhaar, PAN card, Driving License).',
      'Mobile phones, cameras, and any other electronic gadgets are strictly prohibited inside the polling booth.',
      'You can check your name on the electoral roll and find your polling booth using the Voter Helpline App or the ECI website.'
    ]
  },
  {
    id: 2,
    name: 'Arriving at the Booth',
    title: 'At the Polling Station',
    icon: '🏛️',
    description: 'What to expect when you arrive.',
    facts: [
      'Polling stations are typically located in government schools or public buildings within 2 km of your residence.',
      'There are separate queues for men and women. Senior citizens and persons with disabilities are given priority access.',
      'A "Voter Assistance Booth" is available outside to help you find your serial number on the electoral roll.'
    ]
  },
  {
    id: 3,
    name: 'Identity Verification',
    title: 'The Officer Checks Your ID',
    icon: '🪪',
    description: 'The polling officer verifies your identity.',
    facts: [
      'The First Polling Officer will check your name on the electoral roll and verify your ID document.',
      'They will call out your name and serial number aloud so polling agents from political parties can verify it.',
      'Once verified, the Second Polling Officer will ask you to sign or provide a thumb impression in the register (Form 17A).'
    ]
  },
  {
    id: 4,
    name: 'Inking',
    title: 'The Indelible Ink',
    icon: '✍️',
    description: 'Ink is applied to your finger as proof of voting.',
    facts: [
      'The Second Polling Officer applies indelible ink on the nail and skin of your left forefinger.',
      'This special ink, produced by Mysore Paints and Varnish Limited, contains silver nitrate and cannot be washed off for weeks.',
      'It acts as a visible safeguard to prevent multiple voting (electoral fraud) by the same individual.'
    ]
  },
  {
    id: 5,
    name: 'Using the EVM',
    title: 'Cast Your Vote',
    icon: '🗳️',
    description: 'Press the button next to your chosen candidate.',
    facts: [
      'Inside the voting compartment, you will find the Ballot Unit. Secrecy of voting is guaranteed by law.',
      'Press the blue button next to the name and symbol of your chosen candidate. You can only press one button.',
      'If you do not wish to vote for any candidate, you can press the NOTA (None Of The Above) button, typically the last option.',
      'When you press the button, a red light will glow next to the candidate\'s name, and you will hear a loud beep confirming your vote.'
    ]
  },
  {
    id: 6,
    name: 'VVPAT Verification',
    title: 'Verify Your Vote',
    icon: '📄',
    description: 'Check the paper slip to confirm your vote.',
    facts: [
      'Next to the EVM is the VVPAT (Voter Verifiable Paper Audit Trail) machine with a transparent window.',
      'A printed slip containing the serial number, name, and symbol of your chosen candidate will appear in the window.',
      'The slip remains visible for exactly 7 seconds before automatically cutting and falling into a sealed drop box below.',
      'Do not attempt to touch or remove the slip. It is for visual verification only.'
    ]
  },
  {
    id: 7,
    name: 'Completion',
    title: 'You Did It!',
    icon: '🎉',
    description: 'Congratulations — you\'ve exercised your democratic right!',
    facts: [
      'You must immediately leave the polling station after casting your vote to maintain the smooth flow of the queue.',
      'By voting, you actively participate in the democratic process and have a say in choosing the government.',
      'Your vote is entirely secret, and no one can find out who you voted for through the EVM or VVPAT.'
    ]
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
  { path: '/mentor', label: 'Mentor', icon: '💬' },
  { path: '/quiz', label: 'Quiz', icon: '🧠' },
];

export const QUIZ_TOPICS = [
  { id: 'voter-registration', label: 'Voter Registration', icon: '📝', desc: 'How to register, update, and check your name on the electoral roll' },
  { id: 'evm-voting', label: 'EVM & Voting', icon: '🗳️', desc: 'How the Electronic Voting Machine works and how to cast your vote' },
  { id: 'documents', label: 'Valid Documents', icon: '📄', desc: 'Which IDs are accepted, and what to do if you forget them' },
  { id: 'rights-laws', label: 'Voter Rights & Laws', icon: '⚖️', desc: 'Your constitutional rights, Model Code of Conduct, and RPA 1951' },
  { id: 'eci-process', label: 'ECI & Process', icon: '🏛️', desc: 'How the Election Commission of India works and election timelines' },
  { id: 'vvpat-security', label: 'VVPAT & Security', icon: '🔒', desc: 'Paper audit trail, EVM security features, and anti-fraud measures' },
];
