import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

// Helper function to get start of day
const getStartOfDay = (date = new Date()) => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    return start.getTime(); // Return timestamp for easier comparison
};

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    const { user, isAuthenticated } = useAuth0(); // Auth0 integration
    const [xp, setXp] = useState(0);
    const [streak, setStreak] = useState(0);
    const [lastPracticed, setLastPracticed] = useState(null);
    const [quizHistory, setQuizHistory] = useState([]);
    const [isInitialized, setIsInitialized] = useState(false);

    // --- Load Initial State from localStorage ---
    useEffect(() => {
        console.log("AppContext: Initializing state from localStorage...");
        try {
            const userKey = isAuthenticated && user ? `edulingo_${user.email}` : 'edulingo_default';

            const storedXp = localStorage.getItem(`${userKey}_userXp`);
            if (storedXp) setXp(parseInt(storedXp, 10));

            const storedLastPracticed = localStorage.getItem(`${userKey}_lastPracticed`);
            if (storedLastPracticed) setLastPracticed(JSON.parse(storedLastPracticed));

            const storedHistory = localStorage.getItem(`${userKey}_quizHistory`);
            if (storedHistory) setQuizHistory(JSON.parse(storedHistory));

            const storedStreak = localStorage.getItem(`${userKey}_userStreak`);
            const storedLastDate = localStorage.getItem(`${userKey}_lastPracticeDate`);
            let initialStreak = 0;
            if (storedStreak && storedLastDate) {
                const todayStart = getStartOfDay();
                const lastPracticeStart = getStartOfDay(new Date(storedLastDate));
                const oneDay = 24 * 60 * 60 * 1000;

                if (todayStart === lastPracticeStart || todayStart === lastPracticeStart + oneDay) {
                    initialStreak = parseInt(storedStreak, 10);
                } else {
                    initialStreak = 0; // Streak broken
                }
            }
            setStreak(initialStreak);
        } catch (e) {
            console.error("AppContext: Failed to load data from localStorage:", e);
        } finally {
            setIsInitialized(true);
        }
    }, [isAuthenticated, user]);

    // --- Save Data to localStorage ---
    const saveToLocalStorage = useCallback((key, value) => {
        try {
            const userKey = isAuthenticated && user ? `edulingo_${user.email}` : 'edulingo_default';
            localStorage.setItem(`${userKey}_${key}`, JSON.stringify(value));
        } catch (e) {
            console.error(`AppContext: Failed to save ${key} to localStorage:`, e);
        }
    }, [isAuthenticated, user]);

    // --- Update Functions ---
    const addXp = useCallback((amount) => {
        if (!isInitialized) return;
        setXp((prevXp) => {
            const newXp = prevXp + amount;
            saveToLocalStorage('userXp', newXp);
            return newXp;
        });
    }, [isInitialized, saveToLocalStorage]);

    const updateStreak = useCallback(() => {
        if (!isInitialized) return;
        const todayStart = getStartOfDay();
        const userKey = isAuthenticated && user ? `edulingo_${user.email}` : 'edulingo_default';
        const lastDateStr = localStorage.getItem(`${userKey}_lastPracticeDate`);
        let currentStreak = streak;
        let lastPracticeStart = null;

        if (lastDateStr) {
            lastPracticeStart = getStartOfDay(new Date(lastDateStr));
        }

        const oneDay = 24 * 60 * 60 * 1000;

        if (lastPracticeStart && todayStart === lastPracticeStart + oneDay) {
            currentStreak++;
        } else if (!lastPracticeStart || todayStart > lastPracticeStart + oneDay) {
            currentStreak = 1;
        }

        if (currentStreak !== streak || todayStart !== lastPracticeStart) {
            setStreak(currentStreak);
            saveToLocalStorage('userStreak', currentStreak);
            saveToLocalStorage('lastPracticeDate', new Date().toISOString());
        }
    }, [streak, isInitialized, saveToLocalStorage, isAuthenticated, user]);

    const recordLastPractice = useCallback((details) => {
        if (!isInitialized) return;
        setLastPracticed(details);
        saveToLocalStorage('lastPracticed', details);
    }, [isInitialized, saveToLocalStorage]);

    const addQuizResult = useCallback((result) => {
        if (!isInitialized) return;
        setQuizHistory((prevHistory) => {
            const newHistory = [...prevHistory, result];
            const limitedHistory = newHistory.slice(-50);
            saveToLocalStorage('quizHistory', limitedHistory);
            return limitedHistory;
        });
        addXp((result.score || 0) * 10);
        updateStreak();
    }, [isInitialized, addXp, updateStreak, saveToLocalStorage]);

    // --- Derived State: Stats ---
    const calculateStats = useCallback(() => {
        if (quizHistory.length === 0) {
            return { completed: 0, averageScore: 0 };
        }
        const totalScore = quizHistory.reduce((sum, item) => sum + (item.score || 0), 0);
        const totalPossible = quizHistory.reduce((sum, item) => sum + (item.total || 0), 0);
        const average = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
        return {
            completed: quizHistory.length,
            averageScore: average,
        };
    }, [quizHistory]);

    // --- Context Value ---
    const value = {
        xp,
        streak,
        lastPracticed,
        quizHistory,
        stats: calculateStats(),
        recordLastPractice,
        addQuizResult,
        isInitialized,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

// Hook to use the context
export const useApp = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};