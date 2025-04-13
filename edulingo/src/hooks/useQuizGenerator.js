// src/hooks/useQuizGenerator.js
import { useState, useCallback } from 'react';
import { fetchAIQuestions } from '../ai/fetchQuestions'; // Adjust path if needed

export const useQuizGenerator = () => {
  const [questions, setQuestions] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Modified generateQuiz function
  const generateQuiz = useCallback(async (grade, examType, subject, topic, numberOfQuestions = 5) => {
    setIsLoading(true);
    setError(null);
    setQuestions(null); // Clear previous questions
    console.log(`Hook: Generating quiz for Grade: ${grade}, Exam: ${examType}, Subject: ${subject}, Topic: ${topic}`);
    try {
      // Pass all relevant details to the fetch function
      const fetchedQuestions = await fetchAIQuestions(grade, examType, subject, topic, numberOfQuestions);
      setQuestions(fetchedQuestions);
    } catch (err) {
      console.error("Hook: Error fetching questions:", err);
      setError(err.message || 'Failed to fetch questions');
      setQuestions(null); // Ensure questions are null on error
    } finally {
      setIsLoading(false);
    }
  }, []); // Dependencies remain empty as it defines the function structure

  const clearQuiz = useCallback(() => {
    setQuestions(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return { questions, isLoading, error, generateQuiz, clearQuiz };
};