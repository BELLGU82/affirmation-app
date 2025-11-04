import { useState } from 'react';
import { useNavigate } from 'react-router';
import GradientBackground from '@/react-app/components/GradientBackground';
import Button from '@/react-app/components/Button';
import { ChevronLeft } from 'lucide-react';

const tones = [
  { id: 'gentle', label: 'Gentle & Nurturing', description: 'Soft and comforting' },
  { id: 'confident', label: 'Confident & Strong', description: 'Bold and empowering' },
  { id: 'peaceful', label: 'Peaceful & Calm', description: 'Serene and tranquil' },
  { id: 'energetic', label: 'Energetic & Uplifting', description: 'Dynamic and motivating' },
  { id: 'wise', label: 'Wise & Reflective', description: 'Thoughtful and insightful' },
  { id: 'playful', label: 'Playful & Light', description: 'Fun and cheerful' }
];

export default function Questions3() {
  const navigate = useNavigate();
  const [selectedTone, setSelectedTone] = useState<string>('');

  const handleContinue = () => {
    if (selectedTone) {
      localStorage.setItem('preferred_tone', selectedTone);
      navigate('/questions/4');
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
              <div className="w-4 h-1 bg-gray-300 rounded-full" />
              <div className="w-16 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full" />
              <div className="w-4 h-1 bg-gray-300 rounded-full" />
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-3">
              What tone resonates with you?
            </h1>
            <p className="text-gray-600">
              Choose the style that feels most supportive to you
            </p>
          </div>

          <div className="space-y-3 mb-8">
            {tones.map((tone) => (
              <button
                key={tone.id}
                onClick={() => setSelectedTone(tone.id)}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left cursor-pointer ${
                  selectedTone === tone.id
                    ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg scale-[1.02]'
                    : 'border-gray-200 bg-white/80 backdrop-blur-sm hover:border-indigo-300 hover:shadow-md active:scale-95'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-800 mb-1">{tone.label}</div>
                    <div className="text-sm text-gray-600">{tone.description}</div>
                  </div>
                  {selectedTone === tone.id && (
                    <span className="text-indigo-600 font-medium text-lg">✓</span>
                  )}
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
            disabled={!selectedTone}
          >
            Continue
          </Button>
          
          <button 
            onClick={() => {
              // Save default if nothing selected
              if (!selectedTone) {
                localStorage.setItem('preferred_tone', 'gentle');
              }
              navigate('/questions/4');
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
