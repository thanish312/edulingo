// src/pages/Quiz.jsx
import React, { useState, useEffect } from "react";
import { useLocation, Navigate, useNavigate } from "react-router-dom";

// Check Icon
const CheckIcon = () => (
  <svg className="w-4 h-4 inline-block ml-1" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
  </svg>
);

const Quiz = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const questionsFromState = location.state?.questions ?? [];
  const subject = location.state?.subject ?? "Unknown Subject";
  const topic = location.state?.topic ?? "Unknown Topic";

  const [hasValidState, setHasValidState] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);

  useEffect(() => {
    if (location.state && Array.isArray(location.state.questions) && location.state.questions.length > 0) {
      setHasValidState(true);
    } else {
      setHasValidState(false);
    }
  }, [location.state]);

  useEffect(() => {
    if (hasValidState) {
      setQuestions(questionsFromState);
      setCurrentQuestionIndex(0);
      setSelectedAnswer(null);
      setScore(0);
      setQuizCompleted(false);
    }
  }, [hasValidState, questionsFromState]);

  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswerSelect = (answerKey) => {
    setSelectedAnswer(answerKey);
  };

  const handleNextQuestion = () => {
    if (!selectedAnswer) return;
    if (currentQuestion && selectedAnswer === currentQuestion.correct?.trim()) {
      setScore((prevScore) => prevScore + 1);
    }
    setSelectedAnswer(null);
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    } else {
      setQuizCompleted(true);
    }
  };

  const handlePlayAgain = () => navigate('/learn');

  const options = currentQuestion
    ? {
        A: currentQuestion.optionA,
        B: currentQuestion.optionB,
        C: currentQuestion.optionC,
        D: currentQuestion.optionD,
      }
    : {};
  const optionsAvailable = Object.values(options).some((text) => !!text);

  if (!hasValidState) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100 p-4">
        <div className="text-center bg-white p-6 rounded-xl shadow-md">
          <p className="font-semibold mb-4 text-gray-600">Loading quiz data or invalid access...</p>
          <button
            onClick={() => navigate("/learn", { replace: true })}
            className="px-5 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg text-white font-semibold"
          >
            Go Back to Topics
          </button>
        </div>
      </div>
    );
  }

  if (!quizCompleted && !currentQuestion) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-100 p-4 text-gray-600">
        <p>Error displaying question.</p>
      </div>
    );
  }

  if (quizCompleted) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 text-gray-800 p-4 font-sans">
        <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full">
          <h2 className="text-3xl font-extrabold mb-3 text-green-600 font-display">Awesome!</h2>
          <p className="text-md mb-2 text-gray-500 font-medium">{subject} - {topic}</p>
          <p className="text-xl font-bold mb-6 text-gray-800">
            Your Score: <span className="text-blue-600">{score}</span> / {questions.length}
          </p>
          <button
            onClick={handlePlayAgain}
            className="w-full px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full shadow transition duration-200 transform hover:scale-105"
          >
            Continue Learning
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-white to-slate-100 text-gray-800 p-4 font-sans">
      <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg w-full max-w-xl space-y-6">

        {/* Header & Progress */}
        <div className="text-center space-y-2">
          <p className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-widest">{subject} - {topic}</p>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question Text */}
        <h1 className="text-xl sm:text-2xl font-bold text-center text-gray-800 font-display">{currentQuestion?.question ?? "Loading question..."}</h1>

        {/* Options */}
        <div className="grid gap-4">
          {optionsAvailable ? (
            Object.entries(options).map(([key, optionText]) =>
              optionText ? (
                <label
                  key={key}
                  className={`block p-4 rounded-full text-center cursor-pointer border-2 transition-all duration-200 ease-in-out transform hover:scale-[1.02] ${
                    selectedAnswer === key
                      ? "bg-blue-100 border-blue-400 text-blue-800 font-semibold"
                      : "bg-gray-100 border-gray-200 text-gray-800 hover:bg-gray-200"
                  }`}
                >
                  <input
                    type="radio"
                    name={`answer-${currentQuestionIndex}`}
                    value={key}
                    checked={selectedAnswer === key}
                    onChange={() => handleAnswerSelect(key)}
                    className="sr-only"
                  />
                  {optionText}
                </label>
              ) : null
            )
          ) : (
            <p className="text-center text-orange-500">No options available for this question.</p>
          )}
        </div>

        {/* Next Button */}
        <button
          onClick={handleNextQuestion}
          disabled={!selectedAnswer}
          className={`w-full py-3 px-5 rounded-full text-white font-bold text-base shadow-sm transition transform focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400 ${
            !selectedAnswer
              ? "bg-gray-300 cursor-not-allowed"
              : "bg-green-500 hover:bg-green-600 hover:scale-[1.02]"
          }`}
        >
          {currentQuestionIndex + 1 < questions.length ? "Check" : "Finish Quiz"}
          {selectedAnswer && <CheckIcon />}
        </button>
      </div>
    </div>
  );
};

export default Quiz;
