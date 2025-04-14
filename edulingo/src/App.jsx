// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Learn from './pages/Learn';
import Quiz from './pages/Quiz';
import Mistakes from './pages/Mistakes';
import { AppProvider } from './context/AppContext';
import React from "react";
import Navbar from "./components/Navbar";

function App() {
  return (
    <AppProvider>
      <div className="bg-zinc-900 min-h-screen text-white font-sans">
        <Router>
          {/* Navbar */}
          <Navbar />

          {/* Main Content */}
          <div className="p-6">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/learn" element={<Learn />} />
              <Route path="/quiz" element={<Quiz />} />
              <Route path="/mistakes" element={<Mistakes />} />
            </Routes>
          </div>
        </Router>
      </div>
    </AppProvider>
  );
}

export default App;