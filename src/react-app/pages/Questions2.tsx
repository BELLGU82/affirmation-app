import { useState } from 'react';
import { useNavigate } from 'react-router';
import GradientBackground from '@/react-app/components/GradientBackground';
import Button from '@/react-app/components/Button';
import { ChevronLeft } from 'lucide-react';

const emotionalStates = [
  { id: 'anxious', label: 'Anxious', color: 'from-orange-400 to-red-500' },
  { id: 'stressed', label: 'Stressed', color: 'from-red-400 to-pink-500' },
  { id: 'uncertain', label: 'Uncertain', color: 'from-yellow-400 to-orange-500' },
  { id: 'tired', label: 'Tired', color: 'from-gray-400 to-slate-500' },
  { id: 'neutral', label: 'Neutral', color: 'from-blue-400 to-indigo-500' },
  { id: 'hopeful', label: 'Hopeful', color: 'from-green-400 to-emerald-500' },
  { id: 'motivated', label: 'Motivated', color: 'from-emerald-400 to-teal-500' },
  { id: 'grateful', label: 'Grateful', color: 'from-purple-400 to-pink-500' }
];

export default function Questions2() {
  const navigate = useNavigate();
  const [selectedState, setSelectedState] = useState<string>('');

  const handleContinue = () => {
    if (selectedState) {
      localStorage.setItem('emotional_state', selectedState);
      navigate('/questions/3');
    }
  };

  return (
    <GradientBackground>
      <div className="flex flex-col min-h-screen px-6 py-12">
        <div className="flex items-center mb-8">
          <button 
            onClick={() => navigate(-1)}
            className="p-2 text-gray-600 hover:text-gray-800"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex-1 ml-4">
            <div className="flex space-x-2">
              <div className="w-4 h-1 bg-gray-300 rounded-full" />
              <div className="w-16 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full" />
              <div className="w-4 h-1 bg-gray-300 rounded-full" />
              <div className="w-4 h-1 bg-gray-300 rounded-full" />
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-3">
              How are you feeling today?
            </h1>
            <p className="text-gray-600">
              Choose the emotion that best describes your current state
            </p>
          </div>

          <div className="space-y-3 mb-8">
            {emotionalStates.map((state) => (
              <button
                key={state.id}
                onClick={() => setSelectedState(state.id)}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left flex items-center justify-between cursor-pointer ${
                  selectedState === state.id
                    ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg scale-[1.02]'
                    : 'border-gray-200 bg-white/80 backdrop-blur-sm hover:border-indigo-300 hover:shadow-md active:scale-95'
                }`}
              >
                <span className="font-medium text-gray-800">{state.label}</span>
                <div className="flex items-center gap-2">
                  {selectedState === state.id && (
                    <span className="text-xs text-indigo-600 font-medium">✓</span>
                  )}
                  <div className={`w-6 h-6 rounded-full bg-gradient-to-br ${state.color} shadow-sm`} />
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 space-y-3">
          <Button 
            onClick={handleContinue}
            className="w-full"
            size="lg"
            disabled={!selectedState}
          >
            Continue
          </Button>
          
          <button 
            onClick={() => {
              // Save default if nothing selected
              if (!selectedState) {
                localStorage.setItem('emotional_state', 'neutral');
              }
              navigate('/questions/3');
            }}
            className="w-full text-gray-500 text-sm py-2 hover:text-gray-700 transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>
    </GradientBackground>
  );
}
