import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Learn from './pages/Learn';
import TopicSelector from './pages/TopicSelector'; // Import the TopicSelector
import Quiz from './pages/Quiz';
import Mistakes from './pages/Mistakes';
import { AppProvider } from './context/AppContext';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/learn" element={<Learn />} />
          <Route path="/quiz" element={<TopicSelector />} /> {/* Change this to TopicSelector */}
          <Route path="/mistakes" element={<Mistakes />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;