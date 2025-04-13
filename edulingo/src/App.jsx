// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Learn from './pages/Learn';
import Quiz from './pages/Quiz';
import Mistakes from './pages/Mistakes';
import { AppProvider } from './context/AppContext';

function App() {
  return (
    <AppProvider>
      {/* Added a wrapper div for testing */}
      <div className="bg-red-500 min-h-screen"> {/* <-- ADD TEST CLASSES HERE */}
        <Router>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/learn" element={<Learn />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/mistakes" element={<Mistakes />} />
          </Routes>
        </Router>
      </div> {/* Close the wrapper div */}
    </AppProvider>
  );
}

export default App;