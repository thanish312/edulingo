import React, { useState } from 'react';
import { fetchAIQuestions } from '../ai/fetchQuestions'; // Adjust the import path as necessary
import Quiz from './Quiz';

const TopicSelector = () => {
  const [subject, setSubject] = useState('');
  const [topic, setTopic] = useState('');
  const [questions, setQuestions] = useState([]);
  const [quizStarted, setQuizStarted] = useState(false);

  const handleStartQuiz = async () => {
    try {
      const fetchedQuestions = await fetchAIQuestions(subject, topic);
      setQuestions(fetchedQuestions);
      setQuizStarted(true);
    } catch (error) {
      console.error('Error fetching questions:', error);
      alert('Failed to fetch questions. Please try again.');
    }
  };

  if (quizStarted) {
    return <Quiz questions={questions} />;
  }

  return (
    <div>
      <h2>Select Subject and Topic</h2>
      <select onChange={(e) => setSubject(e.target.value)}>
        <option value="">Select Subject</option>
        <option value="Math">Math</option>
        <option value="Science">Science</option>
        {/* Add more subjects as needed */}
      </select>
      <select onChange={(e) => setTopic(e.target.value)}>
        <option value="">Select Topic</option>
        <option value="Algebra">Algebra</option>
        <option value="Geometry">Geometry</option>
        {/* Add more topics as needed */}
      </select>
      <button onClick={handleStartQuiz}>Start Quiz</button>
    </div>
  );
};

export default TopicSelector;