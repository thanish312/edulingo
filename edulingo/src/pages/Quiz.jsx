import React, { useState, useEffect } from "react";
// Assuming fetchAIQuestions.js is in the same directory (src/pages)
import { fetchAIQuestions } from "../ai/fetchQuestions";

const Quiz = ({ subject = "Geography", topic = "Capitals" }) => { // Example: Get subject/topic as props, with defaults
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Added loading state
  const [error, setError] = useState(null);       // Added error state

  useEffect(() => {
    const loadQuestions = async () => {
      setIsLoading(true); // Start loading
      setError(null);     // Clear previous errors
      try {
        // --- FIX: Call the correct imported function ---
        // --- FIX: Pass required arguments (using props or state) ---
        const fetchedQuestions = await fetchAIQuestions(subject, topic);

        // --- Ensure fetchedQuestions is an array ---
        if (Array.isArray(fetchedQuestions)) {
            setQuestions(fetchedQuestions);
        } else {
            console.error("Fetched data is not an array:", fetchedQuestions);
            throw new Error("Invalid data format received.");
        }

      } catch (err) {
        console.error("Error fetching questions:", err);
        setError(err); // Set error state
        setQuestions([]); // Clear questions on error
      } finally {
        setIsLoading(false); // Stop loading regardless of success/failure
      }
    };

    loadQuestions();
    // Add subject and topic to dependency array if they can change
  }, [subject, topic]);

  const handleAnswerSelect = (answerKey) => {
    setSelectedAnswer(answerKey);
  };

  const handleNextQuestion = () => {
    if (!selectedAnswer) return;

    const currentQuestion = questions[currentQuestionIndex];
    // Ensure currentQuestion and correct property exist before comparing
    if (currentQuestion && selectedAnswer === currentQuestion.correct) {
      setScore((prevScore) => prevScore + 1);
    }

    setSelectedAnswer(null);

    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    } else {
      setQuizCompleted(true);
    }
  };

  // --- Loading State ---
  if (isLoading) {
    return <div>Loading questions...</div>;
  }

  // --- Error State ---
  if (error) {
    return <div>Error loading questions: {error.message}. Please try again later.</div>;
  }

  // --- No Questions State (after loading) ---
   if (!questions || questions.length === 0) {
    return <div>No questions available for this topic.</div>;
  }

  // --- Quiz Completed State ---
  if (quizCompleted) {
    return (
      <div>
        <h2>Quiz Completed!</h2>
        <p>Your Score: {score} / {questions.length}</p>
        {/* Add a button to restart or go back? */}
      </div>
    );
  }

  // --- Active Quiz State ---
  const currentQuestion = questions[currentQuestionIndex];

  // Defensive check in case indexing goes wrong somehow
  if (!currentQuestion) {
     console.error(`Attempted to access question at index ${currentQuestionIndex}, but it's undefined.`);
     return <div>An unexpected error occurred. Please refresh.</div>;
  }

  // Check if the 'options' object exists AND has keys before trying Object.entries
  const optionsExist = currentQuestion.options && typeof currentQuestion.options === 'object' && Object.keys(currentQuestion.options).length > 0;

  return (
    <div className="quiz-container">
      <h2>Question {currentQuestionIndex + 1} / {questions.length}</h2>
      <p>{currentQuestion?.question ?? 'Question text missing.'}</p>

      {/* --- FIX: Render options based on the nested structure --- */}
      {optionsExist ? (
        Object.entries(currentQuestion.options).map(([key, optionText]) => (
          <div key={key}>
            <label>
              <input
                type="radio"
                // --- FIX: Unique name per question ---
                name={`answer-${currentQuestionIndex}`}
                value={key} // 'A', 'B', 'C', or 'D'
                checked={selectedAnswer === key}
                onChange={() => handleAnswerSelect(key)}
              />
              {optionText ?? 'Option text missing'}
            </label>
          </div>
        ))
      ) : (
        // This message shows if currentQuestion.options is missing, null, or empty
        <p style={{ color: "orange" }}>No options available for this question.</p>
      )}

      <button onClick={handleNextQuestion} disabled={!selectedAnswer}>
        {currentQuestionIndex + 1 < questions.length ? "Next" : "Finish"}
      </button>
    </div>
  );
};

export default Quiz;