import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useApp } from '../context/AppContext'; // Import useApp context hook

// Check Icon
const CheckIcon = () => (
    <svg className="w-4 h-4 inline-block ml-1" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path>
    </svg>
);

const Quiz = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { addQuizResult } = useApp(); // Get context function

    // --- State from Navigation ---
    const questionsFromState = location.state?.questions ?? [];
    const gradeFromState = location.state?.grade ?? "N/A";
    const examTypeFromState = location.state?.examType ?? "N/A";
    const subjectFromState = location.state?.subject ?? "Unknown Subject";
    const topicFromState = location.state?.topic ?? "Unknown Topic";

    // --- Component State ---
    const [hasValidState, setHasValidState] = useState(false);
    const [questions, setQuestions] = useState([]);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [score, setScore] = useState(0);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [isAnswerChecked, setIsAnswerChecked] = useState(false);
    const [isCorrect, setIsCorrect] = useState(null);

    // --- Ref to prevent double submission ---
    const hasSubmittedResult = useRef(false);

    // --- Effects ---

    // Validate navigation state
    useEffect(() => {
        if (location.state && Array.isArray(location.state.questions) && location.state.questions.length > 0) {
            setHasValidState(true);
            // Reset submission flag when new valid state arrives
            hasSubmittedResult.current = false;
        } else {
            console.warn("Quiz component accessed without valid questions in location.state.");
            setHasValidState(false);
        }
    }, [location.state]);

    // Initialize or reset quiz state
    useEffect(() => {
        if (hasValidState) {
            setQuestions(questionsFromState);
            setCurrentQuestionIndex(0);
            setSelectedAnswer(null);
            setScore(0);
            setQuizCompleted(false);
            setIsAnswerChecked(false);
            setIsCorrect(null);
            // Ensure ref is reset if state becomes valid after being invalid
            hasSubmittedResult.current = false;
        }
    }, [hasValidState, questionsFromState]);


    // --- Derived State & Data ---
    const currentQuestion = questions[currentQuestionIndex];
    const options = currentQuestion ? { A: currentQuestion.optionA, B: currentQuestion.optionB, C: currentQuestion.optionC, D: currentQuestion.optionD } : {};
    const optionsAvailable = Object.values(options).some((text) => !!text);

    // --- Event Handlers ---

    const handleAnswerSelect = (answerKey) => {
        if (isAnswerChecked) return;
        setSelectedAnswer(answerKey);
        setIsCorrect(null);
    };

    const handleCheckAnswer = () => {
        if (!selectedAnswer || !currentQuestion || isAnswerChecked) return;

        const correctAnswerLetter = currentQuestion.correct?.trim();
        const correct = selectedAnswer === correctAnswerLetter;

        setIsCorrect(correct);
        setIsAnswerChecked(true);

        if (correct) {
            setScore((prevScore) => prevScore + 1);
        }
    };

    const handleProceed = () => {
        if (!isAnswerChecked) return; // Should not proceed before checking

        // Check if it's the last question
        const isLastQuestion = currentQuestionIndex + 1 >= questions.length;

        if (isLastQuestion) {
            setQuizCompleted(true);
            // <<< Submit result to context >>>
            if (!hasSubmittedResult.current && questions.length > 0) {
                const result = {
                    grade: gradeFromState,
                    examType: examTypeFromState,
                    subject: subjectFromState,
                    topic: topicFromState,
                    score: score, // Use the final score state
                    total: questions.length,
                    date: new Date().toISOString()
                };
                addQuizResult(result); // Call context function
                hasSubmittedResult.current = true; // Mark as submitted
                console.log("Quiz result submitted:", result);
            }
        } else {
            // Move to next question: Reset state for the next question
            setSelectedAnswer(null);
            setIsAnswerChecked(false);
            setIsCorrect(null);
            setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
        }
    };

    const handlePlayAgain = () => navigate('/learn');

    // --- Conditional Rendering ---

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
        return ( <div className="flex items-center justify-center min-h-screen bg-slate-100 p-4 text-gray-600"> <p>Error displaying question.</p> </div> );
    }

    // --- Quiz Completed Screen ---
    if (quizCompleted) {
        const totalQuestions = questions.length;
        const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

        let resultTitle = "Quiz Complete!";
        let resultTitleColor = "text-gray-800";
        let resultMessage = `You scored ${score} out of ${totalQuestions}.`;

        if (totalQuestions > 0) {
            if (percentage === 100) { resultTitle = "Perfect Score!"; resultTitleColor = "text-yellow-500"; resultMessage = `Amazing! You got all ${totalQuestions} questions right!`; }
            else if (percentage >= 80) { resultTitle = "Excellent Work!"; resultTitleColor = "text-green-600"; resultMessage = `Great job! You scored ${score}/${totalQuestions} (${percentage}%).`; }
            else if (percentage >= 60) { resultTitle = "Good Job!"; resultTitleColor = "text-blue-600"; resultMessage = `Nice effort! You scored ${score}/${totalQuestions} (${percentage}%).`; }
            else if (percentage >= 40) { resultTitle = "Keep Practicing!"; resultTitleColor = "text-orange-500"; resultMessage = `You scored ${score}/${totalQuestions} (${percentage}%). Keep reviewing!`; }
            else { resultTitle = "Needs Review"; resultTitleColor = "text-red-500"; resultMessage = `You scored ${score}/${totalQuestions} (${percentage}%). Review this topic again.`; }
        } else {
             resultTitle = "No Questions Found"; resultTitleColor = "text-gray-500"; resultMessage = "There were no questions in this quiz.";
        }

        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 text-gray-800 p-4 font-sans">
                <div className="bg-white p-8 rounded-xl shadow-lg text-center max-w-md w-full">
                    <h2 className={`text-3xl font-extrabold mb-3 ${resultTitleColor} font-display`}>{resultTitle}</h2>
                    <p className="text-md mb-1 text-gray-500 font-medium">{subjectFromState} - {topicFromState}</p>
                     <p className="text-xs mb-4 text-gray-400 font-medium">({examTypeFromState}, {gradeFromState})</p>
                    <p className="text-lg mb-6 text-gray-700">{resultMessage}</p>
                    <button
                        onClick={handlePlayAgain}
                        className="w-full px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full shadow transition duration-200 transform hover:scale-105"
                    >
                        {percentage >= 60 ? "Continue Learning" : "Back to Topics"}
                    </button>
                </div>
            </div>
        );
    }

    // --- Main Quiz View ---
    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-white to-slate-100 text-gray-800 p-4 font-sans">
            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg w-full max-w-xl space-y-6">
                {/* Header & Progress */}
                <div className="text-center space-y-2">
                    <p className="text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-widest">{subjectFromState} - {topicFromState}</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-green-500 h-2 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${((currentQuestionIndex + 1) / questions.length) * 100}%` }}
                        ></div>
                    </div>
                     <p className="text-xs text-gray-400">({examTypeFromState}, {gradeFromState})</p>
                </div>

                {/* Question Text */}
                <h1 className="text-xl sm:text-2xl font-bold text-center text-gray-800 font-display">{currentQuestion?.question ?? "Loading question..."}</h1>

                {/* Options */}
                <div className="grid gap-4">
                    {optionsAvailable ? (
                        Object.entries(options).map(([key, optionText]) => {
                            if (!optionText) return null;

                            let optionStyle = "bg-gray-100 border-gray-200 text-gray-800 hover:bg-gray-200";
                            const isDisabled = isAnswerChecked;

                            if (isAnswerChecked) {
                                const isThisCorrectAnswer = key === currentQuestion.correct?.trim();
                                const isThisSelectedAnswer = key === selectedAnswer;
                                if (isThisCorrectAnswer) optionStyle = "bg-green-100 border-green-400 text-green-800 font-semibold";
                                else if (isThisSelectedAnswer) optionStyle = "bg-red-100 border-red-400 text-red-800 font-semibold";
                                else optionStyle = "bg-gray-50 border-gray-200 text-gray-500 opacity-60 cursor-default";
                            } else if (selectedAnswer === key) {
                                optionStyle = "bg-blue-100 border-blue-400 text-blue-800 font-semibold";
                            }

                            return (
                                <label
                                    key={key}
                                    className={`block p-4 rounded-lg text-center border-2 transition-all duration-200 ease-in-out ${optionStyle} ${!isDisabled ? 'cursor-pointer transform hover:scale-[1.02]' : 'cursor-default'}`}
                                >
                                    <input
                                        type="radio" name={`answer-${currentQuestionIndex}`} value={key} checked={selectedAnswer === key}
                                        onChange={() => handleAnswerSelect(key)} className="sr-only" disabled={isDisabled}
                                    />
                                    {optionText}
                                </label>
                            );
                        })
                    ) : ( <p className="text-center text-orange-500">No options available.</p> )}
                </div>

                {/* Feedback Section */}
                {isAnswerChecked && (
                    <div className={`p-4 rounded-lg mt-4 text-center font-semibold ${ isCorrect ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300' }`}>
                        {isCorrect ? "Correct!" : (
                            <> Incorrect. The correct answer was: <span className="font-bold block mt-1"> {options[currentQuestion.correct?.trim()] ?? 'N/A'} </span> </>
                        )}
                    </div>
                )}

                {/* Action Button */}
                <button
                    onClick={isAnswerChecked ? handleProceed : handleCheckAnswer}
                    disabled={!isAnswerChecked && !selectedAnswer}
                    className={`w-full py-3 px-5 rounded-full text-white font-bold text-base shadow-sm transition transform focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                        isAnswerChecked
                            ? 'bg-green-500 hover:bg-green-600 hover:scale-[1.02] focus:ring-green-400 cursor-pointer'
                            : selectedAnswer
                                ? 'bg-blue-500 hover:bg-blue-600 hover:scale-[1.02] focus:ring-blue-400 cursor-pointer'
                                : 'bg-gray-300 cursor-not-allowed focus:ring-gray-400'
                    }`}
                >
                    {isAnswerChecked
                        ? (currentQuestionIndex + 1 < questions.length ? "Next Question" : "Finish Quiz")
                        : "Check"}
                    {!isAnswerChecked && selectedAnswer && <CheckIcon />}
                </button>
            </div>
        </div>
    );
};

export default Quiz;