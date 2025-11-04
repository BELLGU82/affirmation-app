import { useState } from 'react';
import { useNavigate } from 'react-router';
import GradientBackground from '@/react-app/components/GradientBackground';
import Button from '@/react-app/components/Button';
import { ChevronLeft } from 'lucide-react';

const styles = [
  { id: 'personal', label: 'Personal & Intimate', description: 'Feels like a close friend speaking' },
  { id: 'poetic', label: 'Poetic & Flowing', description: 'Beautiful, lyrical language' },
  { id: 'direct', label: 'Direct & Clear', description: 'Simple, straightforward messages' },
  { id: 'spiritual', label: 'Spiritual & Universal', description: 'Connected to something greater' },
  { id: 'scientific', label: 'Evidence-Based', description: 'Grounded in psychology and research' },
  { id: 'storytelling', label: 'Story-Driven', description: 'Narrative and metaphorical' }
];

export default function Questions4() {
  const navigate = useNavigate();
  const [selectedStyle, setSelectedStyle] = useState<string>('');

  const handleContinue = async () => {
    if (selectedStyle) {
      localStorage.setItem('style', selectedStyle);
      
      // Collect all preferences
      const preferences = {
        focus_areas: JSON.parse(localStorage.getItem('focus_areas') || '[]'),
        emotional_state: localStorage.getItem('emotional_state') || '',
        preferred_tone: localStorage.getItem('preferred_tone') || '',
        language: 'en',
        style: selectedStyle
      };

      // Save preferences to backend
      try {
        const userId = 'user_123'; // Mock user ID for now
        const response = await fetch('/api/preferences', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            user_id: userId,
            ...preferences
          }),
        });

        const data = await response.json();
        if (!data.success) {
          console.error('Failed to save preferences:', data.error);
        }
      } catch (error) {
        console.error('Error saving preferences:', error);
      }
      
      navigate('/voice-setup');
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
              <div className="w-4 h-1 bg-gray-300 rounded-full" />
              <div className="w-16 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full" />
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-3">
              What style speaks to you?
            </h1>
            <p className="text-gray-600">
              Choose the approach that feels most authentic
            </p>
          </div>

          <div className="space-y-3 mb-8">
            {styles.map((style) => (
              <button
                key={style.id}
                onClick={() => setSelectedStyle(style.id)}
                className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left ${
                  selectedStyle === style.id
                    ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg'
                    : 'border-gray-200 bg-white/80 backdrop-blur-sm hover:border-indigo-300'
                }`}
              >
                <div className="font-medium text-gray-800 mb-1">{style.label}</div>
                <div className="text-sm text-gray-600">{style.description}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="pt-4">
          <Button 
            onClick={handleContinue}
            className="w-full"
            size="lg"
            disabled={!selectedStyle}
          >
            Complete Setup
          </Button>
        </div>
      </div>
    </GradientBackground>
  );
}
