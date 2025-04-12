import { createContext, useContext, useState } from 'react';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [xp, setXp] = useState(0);
  const [streak, setStreak] = useState(3);
  const [mistakes, setMistakes] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(null);

  const addMistake = (topic) => {
    if (!mistakes.includes(topic)) {
      setMistakes([...mistakes, topic]);
    }
  };

  return (
    <AppContext.Provider value={{
      xp, setXp,
      streak, setStreak,
      mistakes, addMistake,
      currentQuestion, setCurrentQuestion
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => useContext(AppContext);
