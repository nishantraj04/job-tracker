import { Routes, Route } from 'react-router-dom';
import { Dashboard } from './components/Dashboard';
import { PublicProfile } from './components/PublicProfile';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/p/:username" element={<PublicProfile />} />
    </Routes>
  );
}

export default App;