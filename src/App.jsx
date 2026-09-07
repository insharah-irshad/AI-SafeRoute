import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Survey from './pages/Survey.jsx';
import MapView from './pages/MapView.jsx';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<MapView />} />
          <Route path="/report" element={<Survey />} />
        </Routes>
      </main>
    </div>
  );
}