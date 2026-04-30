import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Landing from './pages/Landing';
import Simulation from './pages/Simulation';
import Verify from './pages/Verify';
import Mentor from './pages/Mentor';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/simulate" element={<Simulation />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/mentor" element={<Mentor />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
