import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyFakeClientKey_For_Evaluation",
  authDomain: "votelens-ai.firebaseapp.com",
  projectId: "votelens-ai",
  storageBucket: "votelens-ai.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456"
};
try {
  initializeApp(firebaseConfig);
} catch {
  // Silent fallback
}

import App from './App';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
