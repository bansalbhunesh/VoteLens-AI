import { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import Orchestrator from './components/Orchestrator';
import { GlobalContextProvider } from './hooks/useGlobalContext';

const Landing    = lazy(() => import('./pages/Landing'));
const Simulation = lazy(() => import('./pages/Simulation'));
const Verify     = lazy(() => import('./pages/Verify'));
const Mentor     = lazy(() => import('./pages/Mentor'));
const Quiz       = lazy(() => import('./pages/Quiz'));
const NotFound   = lazy(() => import('./pages/NotFound'));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="flex flex-col items-center gap-4">
        <div className="w-10 h-10 rounded-full border-4 border-white/5 border-t-primary-500 animate-spin" />
        <span className="text-xs text-surface-500 tracking-widest uppercase">Loading</span>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <GlobalContextProvider>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/"         element={<Landing />} />
                <Route path="/simulate" element={<Simulation />} />
                <Route path="/verify"   element={<Verify />} />
                <Route path="/mentor"   element={<Mentor />} />
                <Route path="/quiz"     element={<Quiz />} />
                <Route path="*"         element={<NotFound />} />
              </Route>
            </Routes>
          </Suspense>
          <Orchestrator />
        </GlobalContextProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
