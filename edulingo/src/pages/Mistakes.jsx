import { useApp } from '../context/AppContext';
import { Link } from 'react-router-dom';

export default function Mistakes() {
  const { mistakes } = useApp();

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-4">🛠️ Weak Areas</h1>
      {mistakes.length === 0 ? (
        <p>You did great! No mistakes logged 🎉</p>
      ) : (
        <ul className="list-disc pl-6 space-y-2">
          {mistakes.map((topic, i) => (
            <li key={i}>{topic}</li>
          ))}
        </ul>
      )}
      <Link to="/learn">
        <button className="mt-6 bg-blue-600 px-4 py-2 rounded-xl hover:bg-blue-700">
          🔁 Practice Again
        </button>
      </Link>
    </div>
  );
}
