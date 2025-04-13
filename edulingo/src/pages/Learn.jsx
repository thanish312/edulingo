// src/pages/Learn.jsx (or wherever Learn.jsx is)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// Remove AppContext usage if not needed for this specific action anymore
// import { useApp } from '../context/AppContext';
import { useQuizGenerator } from '../hooks/useQuizGenerator'; // Import the hook

const subjects = {
  Physics: ['Kinematics', 'Thermodynamics', 'Optics'],
  Chemistry: ['Organic', 'Inorganic', 'Physical'],
  Math: ['Algebra', 'Calculus', 'Probability'],
  GS: ['Polity', 'Economy', 'Geography', 'Capitals'], // Added Capitals for testing
};

export default function Learn() {
  const navigate = useNavigate();
  // const { setCurrentQuestion } = useApp(); // Keep if used elsewhere, remove if only for quiz start

  // Use the custom hook to manage fetching state
  const { questions, isLoading, error, generateQuiz, clearQuiz } = useQuizGenerator();

  // State to track which topic is currently being loaded
  const [loadingTopic, setLoadingTopic] = useState(null); // e.g., "Algebra"
  const [fetchError, setFetchError] = useState(null); // Local error state for UI feedback

  // This effect runs when 'questions' state from the hook updates
  useEffect(() => {
    // If loading finished, questions are available, and there's no error...
    if (!isLoading && questions && !error && loadingTopic) {
      console.log("Questions fetched successfully, navigating to quiz:", questions);
      // Navigate to the quiz route, passing data via location state
      navigate('/quiz', {
        state: {
          questions: questions, // Pass the fetched questions
          subject: Object.keys(subjects).find(subj => subjects[subj].includes(loadingTopic)), // Find subject for context
          topic: loadingTopic, // Pass the topic
        }
      });
      // Reset loading topic after navigation attempt
      setLoadingTopic(null);
      // Optionally clear the hook's state if you want Learn page fresh on return
      // clearQuiz();
    } else if (!isLoading && error && loadingTopic) {
        // Handle fetch error state locally if needed for UI
        console.error("Fetch error detected by useEffect:", error);
        setFetchError(`Failed to load quiz for ${loadingTopic}: ${error}`);
        // Clear loading topic so user can try again
        setLoadingTopic(null);
    }
  }, [questions, isLoading, error, navigate, loadingTopic, clearQuiz]); // Dependencies


  // Function called when a topic button is clicked
  const handleStartQuiz = async (subject, topic) => {
    // Prevent starting a new fetch if one is already in progress
    if (isLoading) {
      console.log("Already loading another topic, please wait.");
      return;
    }
    console.log(`Attempting to start quiz for Subject: ${subject}, Topic: ${topic}`);
    setLoadingTopic(topic); // Set which topic we are currently loading
    setFetchError(null); // Clear previous errors before starting

    try {
      // Call the hook's function to fetch questions
      await generateQuiz(subject, topic, 5); // Request 5 questions
      // Navigation will happen in the useEffect when questions state updates
    } catch (err) {
       // Error is already logged in the hook, potentially update local state if needed
       console.error(`Error caught in handleStartQuiz for ${topic}:`, err);
       // Error state is set in the hook, useEffect will pick it up.
       // No need to set fetchError here unless useEffect misses it.
       setLoadingTopic(null); // Reset loading topic on immediate failure
       alert(`Failed to start quiz for ${topic}. Please check console/try again.`); // Simple user feedback
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-4">📚 Choose a topic to practice</h1>

      {/* Display general loading state */}
      {isLoading && loadingTopic && <p>Loading quiz for {loadingTopic}...</p>}

      {/* Display fetch error */}
      {fetchError && !isLoading && <p className="text-red-500 mb-4">Error: {fetchError}</p>}


      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {Object.entries(subjects).map(([subject, topics]) => (
          <div key={subject} className="bg-zinc-800 p-4 rounded-xl">
            <h2 className="text-xl font-semibold mb-2">{subject}</h2>
            <div className="flex flex-col gap-2">
              {topics.map((topic) => (
                <button
                  key={topic}
                  onClick={() => handleStartQuiz(subject, topic)}
                  // Disable button if any quiz is loading
                  disabled={isLoading}
                  className={`px-3 py-1 rounded ${
                    isLoading
                      ? 'bg-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {/* Show specific loading state on the button */}
                  {isLoading && loadingTopic === topic ? 'Loading...' : topic}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}