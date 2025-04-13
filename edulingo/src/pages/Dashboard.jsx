import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext'; // Import useApp

function Dashboard() {
    const navigate = useNavigate();
    // Get ALL relevant data from context
    const { xp, streak, lastPracticed, quizHistory, stats, isInitialized } = useApp();

    const handleContinueLearning = () => {
        if (lastPracticed) {
            // Simple navigation back to the learn page
            navigate('/learn');
        }
    }

    // Sort history for display (newest first), handle potential non-array state during init
    const recentHistory = Array.isArray(quizHistory) ? [...quizHistory].slice(-5).reverse() : [];

    // Show loading state until context is initialized
    if (!isInitialized) {
         return (
             <div className="min-h-screen bg-zinc-900 text-white p-6 flex items-center justify-center">
                 <p>Loading Dashboard...</p>
             </div>
         );
    }

    return (
        <div className="min-h-screen bg-zinc-900 text-white p-4 md:p-8 font-sans">
            <h1 className="text-3xl font-bold mb-8 text-blue-300 text-center">Dashboard</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">

                {/* Column 1: Welcome & Actions */}
                <div className="lg:col-span-1 bg-zinc-800 p-6 rounded-xl shadow-lg flex flex-col justify-between">
                    <div>
                        <h2 className="text-2xl font-semibold mb-4 text-blue-400">Welcome Back!</h2>
                        {/* Streak Display */}
                        <p className="text-lg mb-4"><span className="text-xl">🔥</span> Streak: <span className="font-bold text-orange-400">{streak}</span> days</p>

                        {/* XP Progress Bar */}
                        <div className="mb-6">
                            <div className="flex justify-between text-sm mb-1 text-zinc-400">
                                <span>Level Progress</span>
                                <span>XP: {xp} / 1000</span> {/* Adjust max XP if needed */}
                            </div>
                            <div className="w-full bg-zinc-700 h-4 rounded-full overflow-hidden">
                                <div className="bg-green-500 h-4 transition-all duration-500 ease-out" style={{ width: `${Math.min(100, (xp % 1000) / 10)}%` }} /> {/* Cap width at 100% */}
                            </div>
                        </div>

                        {/* Last Practiced Info */}
                        {lastPracticed ? (
                            <div className="mt-4 pt-4 border-t border-zinc-700">
                                <p className="text-zinc-400 mb-1 text-sm">Continue where you left off?</p>
                                <p className="text-zinc-200 font-medium">
                                    {lastPracticed.subject} - {lastPracticed.topic}
                                </p>
                                <p className="text-zinc-500 text-xs">({lastPracticed.examType}, {lastPracticed.grade})</p>
                            </div>
                        ) : (
                            <p className="text-zinc-400 mt-4 pt-4 border-t border-zinc-700">Ready to start learning?</p>
                        )}
                    </div>
                    <div className="mt-6 space-y-3">
                        {lastPracticed && (
                            <button
                                onClick={handleContinueLearning}
                                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg transition duration-150 text-base"
                            >
                                Go to Learn Page
                            </button>
                        )}
                        <Link to="/learn" className="w-full block text-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition duration-150 text-base">
                            {lastPracticed ? 'Start New Session' : 'Start Learning'}
                        </Link>
                    </div>
                </div>

                {/* Column 2: Stats & Recent Activity */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Overall Stats */}
                    <div className="bg-zinc-800 p-6 rounded-xl shadow-lg">
                        <h2 className="text-xl font-semibold mb-4 text-blue-400">Overall Progress</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div className="bg-zinc-700/50 p-4 rounded-lg text-center">
                               <div className="text-zinc-400 text-sm mb-1">Quizzes Completed</div>
                               <div className="text-3xl font-bold text-blue-300">{stats.completed}</div>
                           </div>
                            {stats.completed > 0 ? (
                               <div className="bg-zinc-700/50 p-4 rounded-lg text-center">
                                   <div className="text-zinc-400 text-sm mb-1">Average Score</div>
                                   <div className={`text-3xl font-bold ${stats.averageScore >= 80 ? 'text-green-400' : stats.averageScore >= 50 ? 'text-yellow-400' : 'text-red-400'}`}>
                                        {stats.averageScore}%
                                    </div>
                               </div>
                            ) : (
                                <div className="bg-zinc-700/50 p-4 rounded-lg text-center flex items-center justify-center">
                                    <p className="text-zinc-500">No quiz data yet.</p>
                                </div>
                            )}
                            {/* Add more stats here if needed */}
                        </div>
                    </div>

                    {/* Recent Activity List */}
                    {recentHistory.length > 0 ? (
                        <div className="bg-zinc-800 p-6 rounded-xl shadow-lg">
                            <h2 className="text-xl font-semibold mb-4 text-blue-400">Recent Quizzes</h2>
                            <ul className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar"> {/* Adjust max-h */}
                                {recentHistory.map((item, index) => (
                                    <li key={index} className="text-sm bg-zinc-700/50 p-3 rounded-lg flex justify-between items-center transition hover:bg-zinc-700">
                                        <div>
                                            <span className="font-medium text-zinc-200 block">{item.subject} - {item.topic}</span>
                                            <span className="text-xs text-zinc-400 block">{new Date(item.date).toLocaleDateString()} ({item.examType}, {item.grade})</span>
                                        </div>
                                        <span className={`font-bold text-lg ${item.score / item.total >= 0.8 ? 'text-green-400' : item.score / item.total >= 0.5 ? 'text-yellow-400' : 'text-red-400'}`}>
                                            {item.score}/{item.total}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                            {quizHistory.length > 5 && (
                                <p className="text-xs text-center text-zinc-500 mt-3">Showing last 5 quizzes.</p>
                            )}
                        </div>
                    ) : (
                         <div className="bg-zinc-800 p-6 rounded-xl shadow-lg flex items-center justify-center min-h-[150px]">
                            <p className="text-zinc-500 text-center">Complete your first quiz to see your history here!</p>
                         </div>
                    )}
                </div>

            </div>
        </div>
    );
}

export default Dashboard;