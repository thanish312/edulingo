import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';

// Helper function to get start of day
const getStartOfDay = (date = new Date()) => {
    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    return start.getTime(); // Return timestamp for easier comparison
};

const AppContext = createContext();

export const AppProvider = ({ children }) => {
    // --- State ---
    const [xp, setXp] = useState(0);
    const [streak, setStreak] = useState(0);
    const [lastPracticed, setLastPracticed] = useState(null);
    const [quizHistory, setQuizHistory] = useState([]);
    const [isInitialized, setIsInitialized] = useState(false); // Flag to prevent premature updates

    // --- Load Initial State from localStorage ---
    useEffect(() => {
        console.log("AppContext: Initializing state from localStorage...");
        try {
            const storedXp = localStorage.getItem('edulingo_userXp');
            if (storedXp) setXp(parseInt(storedXp, 10));

            const storedLastPracticed = localStorage.getItem('edulingo_lastPracticed');
            if (storedLastPracticed) setLastPracticed(JSON.parse(storedLastPracticed));

            const storedHistory = localStorage.getItem('edulingo_quizHistory');
            if (storedHistory) setQuizHistory(JSON.parse(storedHistory));

            // Initialize Streak (needs history to be loaded first)
            const storedStreak = localStorage.getItem('edulingo_userStreak');
            const storedLastDate = localStorage.getItem('edulingo_lastPracticeDate');
            let initialStreak = 0;
            if (storedStreak && storedLastDate) {
                const todayStart = getStartOfDay();
                const lastPracticeStart = getStartOfDay(new Date(storedLastDate));
                const oneDay = 24 * 60 * 60 * 1000;

                // Check if the last practice was yesterday or today
                if (todayStart === lastPracticeStart || todayStart === lastPracticeStart + oneDay) {
                    initialStreak = parseInt(storedStreak, 10);
                } else {
                    initialStreak = 0; // Streak broken if last practice wasn't yesterday or today
                }
            }
             setStreak(initialStreak);
             console.log("AppContext: Initial streak calculated:", initialStreak);


        } catch (e) {
            console.error("AppContext: Failed to load data from localStorage:", e);
            // Consider clearing localStorage if parsing fails badly
            // localStorage.removeItem('edulingo_userXp'); // etc.
        } finally {
             setIsInitialized(true); // Mark initialization complete
             console.log("AppContext: Initialization complete.");
        }
    }, []); // Empty dependency array ensures this runs only once on mount


    // --- Update Functions (Memoized with useCallback) ---

    // Function to add XP
    const addXpInternal = useCallback((amount) => {
        if (!isInitialized) return; // Prevent updates before initialization
        setXp(prevXp => {
            const newXp = prevXp + amount;
            try {
                localStorage.setItem('edulingo_userXp', newXp.toString());
            } catch (e) { console.error("AppContext: Failed to save XP:", e); }
            return newXp;
        });
    }, [isInitialized]);

    // Function to update streak and last practice date
    const updateStreakInternal = useCallback(() => {
        if (!isInitialized) return; // Prevent updates before initialization
        console.log("AppContext: Updating streak...");

        const todayStart = getStartOfDay();
        const lastDateStr = localStorage.getItem('edulingo_lastPracticeDate');
        let currentStreak = streak; // Start with current streak from state
        let lastPracticeStart = null;

        if (lastDateStr) {
            lastPracticeStart = getStartOfDay(new Date(lastDateStr));
        }

        const oneDay = 24 * 60 * 60 * 1000;

        if (lastPracticeStart && todayStart === lastPracticeStart + oneDay) {
            // Last practice was yesterday, increment streak
            currentStreak++;
            console.log("AppContext: Streak incremented to", currentStreak);
        } else if (!lastPracticeStart || todayStart > lastPracticeStart + oneDay) {
            // First practice ever, or missed one or more days
            currentStreak = 1;
             console.log("AppContext: Streak reset/started at 1");
        } else if (todayStart === lastPracticeStart) {
            // Already practiced today, streak stays the same
            console.log("AppContext: Already practiced today, streak remains", currentStreak);
        }
        // No 'else' needed - currentStreak retains existing value if today === lastPracticeStart


        // Update state only if streak changed OR it's the first practice of the day
        if (currentStreak !== streak || todayStart !== lastPracticeStart) {
             setStreak(currentStreak);
             try {
                localStorage.setItem('edulingo_userStreak', currentStreak.toString());
                // Always store today's date as the last practice date after a successful quiz
                localStorage.setItem('edulingo_lastPracticeDate', new Date().toISOString());
                 console.log("AppContext: Saved streak:", currentStreak, "and updated last practice date.");
             } catch (e) { console.error("AppContext: Failed to save streak data:", e); }
        }

    }, [streak, isInitialized]);


    // Function to set the last topic practiced (called from Learn page)
    const recordLastPractice = useCallback((details) => {
        if (!isInitialized) return;
        setLastPracticed(details);
        try {
            localStorage.setItem('edulingo_lastPracticed', JSON.stringify(details));
        } catch (e) { console.error("AppContext: Failed to save last practiced:", e); }
    }, [isInitialized]);


    // Function to add a result to history (called from Quiz page)
    const addQuizResult = useCallback((result) => {
        if (!isInitialized) return;
        console.log("AppContext: Adding quiz result:", result);
        // Update History
        setQuizHistory(prevHistory => {
            const newHistory = [...prevHistory, result];
            // Optional: Limit history size
            const limitedHistory = newHistory.slice(-50); // Keep last 50 results
            try {
                localStorage.setItem('edulingo_quizHistory', JSON.stringify(limitedHistory));
            } catch (e) { console.error("AppContext: Failed to save history:", e); }
            return limitedHistory;
        });

        // --- Update XP and Streak after adding result ---
        const xpGained = (result.score || 0) * 10; // Example: 10 XP per correct answer
        if (xpGained > 0) {
             addXpInternal(xpGained);
        }
        updateStreakInternal(); // Check and update streak

    }, [addXpInternal, updateStreakInternal, isInitialized]);


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
            averageScore: average
        };
    }, [quizHistory]); // Recalculate when history changes


    // Value provided to consuming components
    const value = {
        xp,
        streak,
        lastPracticed,
        quizHistory,
        stats: calculateStats(), // Provide calculated stats
        // Provide action functions
        recordLastPractice,
        addQuizResult,
        isInitialized // Expose initialization status if needed elsewhere
    };

    // Render provider only after initialization to avoid state inconsistencies?
    // Or rely on the isInitialized checks within update functions.
    // If we wait to render children, the initial UI might flash or be delayed.
    // It's usually better to render immediately and guard updates.
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