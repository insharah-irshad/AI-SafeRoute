import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Survey from './pages/Survey.jsx';
import MapView from './pages/MapView.jsx';
import Compare from './pages/Compare.jsx';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Survey />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/compare" element={<Compare />} />
        </Routes>
      </main>
    </div>
  );
}
