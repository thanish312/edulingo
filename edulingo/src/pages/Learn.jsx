import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

const subjects = {
  Physics: ['Kinematics', 'Thermodynamics', 'Optics'],
  Chemistry: ['Organic', 'Inorganic', 'Physical'],
  Math: ['Algebra', 'Calculus', 'Probability'],
  GS: ['Polity', 'Economy', 'Geography'],
};

export default function Learn() {
  const navigate = useNavigate();
  const { setCurrentQuestion } = useApp();

  const startQuiz = (topic) => {
    // You could pull real data here. For now, mock
    setCurrentQuestion({ topic });
    navigate('/quiz');
  };

  return (
    <div className="min-h-screen bg-zinc-900 text-white p-6">
      <h1 className="text-2xl font-bold mb-4">📚 Choose a topic to practice</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {Object.entries(subjects).map(([subject, topics]) => (
          <div key={subject} className="bg-zinc-800 p-4 rounded-xl">
            <h2 className="text-xl font-semibold mb-2">{subject}</h2>
            <div className="flex flex-col gap-2">
              {topics.map((topic) => (
                <button
                  key={topic}
                  onClick={() => startQuiz(topic)}
                  className="bg-blue-600 hover:bg-blue-700 px-3 py-1 rounded"
                >
                  {topic}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
