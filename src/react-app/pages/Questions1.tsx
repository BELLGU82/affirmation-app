import { useState } from 'react';
import { useNavigate } from 'react-router';
import GradientBackground from '@/react-app/components/GradientBackground';
import Button from '@/react-app/components/Button';
import { ChevronLeft } from 'lucide-react';

const focusAreas = [
  { id: 'confidence', label: 'Confidence', emoji: '💪' },
  { id: 'anxiety', label: 'Anxiety Relief', emoji: '🧘' },
  { id: 'motivation', label: 'Motivation', emoji: '🚀' },
  { id: 'self-love', label: 'Self-Love', emoji: '💖' },
  { id: 'success', label: 'Success', emoji: '🏆' },
  { id: 'relationships', label: 'Relationships', emoji: '🤝' },
  { id: 'health', label: 'Health & Wellness', emoji: '🌱' },
  { id: 'creativity', label: 'Creativity', emoji: '🎨' }
];

export default function Questions1() {
  const navigate = useNavigate();
  const [selectedAreas, setSelectedAreas] = useState<string[]>([]);

  const toggleArea = (areaId: string) => {
    setSelectedAreas(prev => 
      prev.includes(areaId) 
        ? prev.filter(id => id !== areaId)
        : [...prev, areaId]
    );
  };

  const handleContinue = () => {
    if (selectedAreas.length > 0) {
      // Store in localStorage for now
      localStorage.setItem('focus_areas', JSON.stringify(selectedAreas));
      navigate('/questions/2');
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
              <div className="w-16 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full" />
              <div className="w-4 h-1 bg-gray-300 rounded-full" />
              <div className="w-4 h-1 bg-gray-300 rounded-full" />
              <div className="w-4 h-1 bg-gray-300 rounded-full" />
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-3">
              What areas of your life would you like to focus on?
            </h1>
            <p className="text-gray-600">
              Select all that resonate with you right now
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 mb-8">
            {focusAreas.map((area) => (
              <button
                key={area.id}
                onClick={() => toggleArea(area.id)}
                className={`p-4 rounded-xl border-2 transition-all duration-300 text-left cursor-pointer ${
                  selectedAreas.includes(area.id)
                    ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg scale-105'
                    : 'border-gray-200 bg-white/80 backdrop-blur-sm hover:border-indigo-300 hover:shadow-md active:scale-95'
                }`}
              >
                <div className="text-2xl mb-2">{area.emoji}</div>
                <div className="font-medium text-gray-800 text-sm">{area.label}</div>
                {selectedAreas.includes(area.id) && (
                  <div className="mt-2 text-xs text-indigo-600 font-medium">Selected ✓</div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4 space-y-3">
          <Button 
            onClick={handleContinue}
            className="w-full"
            size="lg"
            disabled={selectedAreas.length === 0}
          >
            Continue ({selectedAreas.length} selected)
          </Button>
          
          <button 
            onClick={() => {
              // Save default if nothing selected
              if (selectedAreas.length === 0) {
                localStorage.setItem('focus_areas', JSON.stringify(['mindfulness']));
              }
              navigate('/questions/2');
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
