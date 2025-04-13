// src/hooks/useQuizGenerator.js
import { useState, useCallback } from 'react';
import { fetchAIQuestions } from '../ai/fetchQuestions'; // Adjust path as needed

export function useQuizGenerator() {
  const [questions, setQuestions] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const generateQuiz = useCallback(async (subject, topic, numberOfQuestions = 5) => {
    if (isLoading) {
      console.warn("Quiz generation already in progress.");
      return; // Return null or some indicator that it didn't run
    }
    console.log(`✨ Starting quiz generation for Subject: ${subject}, Topic: ${topic}`);
    setIsLoading(true);
    setError(null);
    setQuestions(null); // Clear previous questions

    try {
      const fetchedQuestions = await fetchAIQuestions(subject, topic, numberOfQuestions);
      setQuestions(fetchedQuestions);
      // Indicate success or return questions if needed by the caller
      return fetchedQuestions;
    } catch (err) {
      console.error("Hook caught error during quiz generation:", err);
      setError(err.message || "An unknown error occurred while generating the quiz.");
      setQuestions(null);
      throw err; // Re-throw the error so the caller component knows it failed
    } finally {
      setIsLoading(false);
      console.log("🏁 Quiz generation process finished.");
    }
  }, [isLoading]); // Dependency: isLoading

  const clearQuiz = useCallback(() => {
    setQuestions(null);
    setError(null);
    setIsLoading(false);
  }, []);

  return {
    questions,
    isLoading,
    error,
    generateQuiz,
    clearQuiz,
  };
}