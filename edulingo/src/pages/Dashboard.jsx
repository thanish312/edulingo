import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function Dashboard() {
  const { xp, streak } = useApp();

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-6 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">👋 Welcome back, Thanish</h1>
        <div className="bg-zinc-800 p-4 rounded-xl mb-6">
          <p>🔥 Streak: {streak} days</p>
          <div className="mt-2 w-full bg-zinc-700 h-4 rounded-full">
            <div className="bg-green-400 h-4 rounded-full" style={{ width: `${(xp % 1000) / 10}%` }} />
          </div>
          <p className="text-sm mt-1">XP: {xp}/1000</p>
        </div>
        <Link to="/learn">
          <button className="bg-blue-600 px-4 py-2 rounded-xl hover:bg-blue-700">🚀 Continue Learning</button>
        </Link>
      </div>
    </div>
  );
}

