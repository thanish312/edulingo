// src/components/QuizSetup.jsx
import React, { useState } from 'react';
import { useQuizGenerator } from '../hooks/useQuizGenerator'; // Adjust path

function QuizSetup() {
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const { questions, isLoading, error, generateQuiz, clearQuiz } = useQuizGenerator();

  const handleGenerateClick = (event) => {
    event.preventDefault(); // Prevent default form submission if used in a form
    if (!subject || !topic) {
      alert("Please enter both subject and topic.");
      return;
    }
    // Call the hook's function to start the process
    generateQuiz(subject, topic, 5); // Request 5 questions
  };

  const handleClearClick = () => {
      clearQuiz();
      // Optionally clear subject/topic inputs too
      // setSubject('');
      // setTopic('');
  }

  return (
    <div>
      <h2>Generate AI Quiz</h2>

      {/* Input Section */}
      <form onSubmit={handleGenerateClick}>
        <div>
          <label htmlFor="subject">Subject:</label>
          <input
            type="text"
            id="subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>
        <div>
          <label htmlFor="topic">Topic:</label>
          <input
            type="text"
            id="topic"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            disabled={isLoading}
            required
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Generating...' : 'Generate Quiz'}
        </button>
         {/* Add a clear button if needed */}
         {(questions || error || isLoading) && (
            <button type="button" onClick={handleClearClick} disabled={isLoading} style={{ marginLeft: '10px' }}>
                Clear / Reset
            </button>
         )}
      </form>

      {/* Status/Result Section */}
      {isLoading && <p>⏳ Loading questions...</p>}

      {error && <p style={{ color: 'red' }}>❌ Error: {error}</p>}

      {questions && questions.length > 0 && (
        <div>
          <h3>Generated Questions ({questions.length}):</h3>
          {/* Render the questions here - Example: */}
          <ul>
            {questions.map((q, index) => (
              <li key={index}>
                <strong>{index + 1}. {q.question}</strong>
                <ul>
                  <li>A: {q.optionA}</li>
                  <li>B: {q.optionB}</li>
                  <li>C: {q.optionC}</li>
                  <li>D: {q.optionD}</li>
                  <li><em>Correct: {q.correct}</em></li>
                   <li><em>Topic: {q.topic}</em></li>
                </ul>
              </li>
            ))}
          </ul>
        </div>
      )}
       {questions && questions.length === 0 && !isLoading && (
           <p>No questions were generated or parsed correctly.</p>
       )}

    </div>
  );
}

export default QuizSetup;