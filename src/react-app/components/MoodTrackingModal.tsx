import { useState } from 'react';
import Button from './Button';
import { X, Heart } from 'lucide-react';

interface MoodTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (moodBefore: string, moodAfter?: string) => void;
  type: 'before' | 'after';
}

const moods = [
  { id: 'very-low', emoji: '😔', label: 'Very Low', color: 'from-red-400 to-red-500' },
  { id: 'low', emoji: '😞', label: 'Low', color: 'from-orange-400 to-red-400' },
  { id: 'neutral', emoji: '😐', label: 'Neutral', color: 'from-yellow-400 to-orange-400' },
  { id: 'good', emoji: '🙂', label: 'Good', color: 'from-green-400 to-yellow-400' },
  { id: 'great', emoji: '😊', label: 'Great', color: 'from-emerald-400 to-green-400' },
  { id: 'excellent', emoji: '🤩', label: 'Excellent', color: 'from-purple-400 to-emerald-400' }
];

export default function MoodTrackingModal({ isOpen, onClose, onSubmit, type }: MoodTrackingModalProps) {
  const [selectedMood, setSelectedMood] = useState<string>('');

  const handleSubmit = () => {
    if (selectedMood) {
      if (type === 'before') {
        onSubmit(selectedMood);
      } else {
        onSubmit('', selectedMood);
      }
      setSelectedMood('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-gray-600 hover:bg-gray-200 transition-colors"
        >
          <X size={16} />
        </button>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-xl shadow-indigo-500/30">
            <Heart className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            {type === 'before' ? 'How are you feeling?' : 'How do you feel now?'}
          </h2>
          <p className="text-gray-600">
            {type === 'before' 
              ? 'Let us know your current mood before we start'
              : 'Track how the affirmation made you feel'
            }
          </p>
        </div>

        {/* Mood Options */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {moods.map((mood) => (
            <button
              key={mood.id}
              onClick={() => setSelectedMood(mood.id)}
              className={`p-4 rounded-2xl border-2 transition-all duration-300 text-center ${
                selectedMood === mood.id
                  ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg'
                  : 'border-gray-200 bg-white/80 hover:border-indigo-300'
              }`}
            >
              <div className="text-2xl mb-2">{mood.emoji}</div>
              <div className="text-xs font-medium text-gray-800">{mood.label}</div>
            </button>
          ))}
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button 
            onClick={handleSubmit}
            className="w-full" 
            size="lg"
            disabled={!selectedMood}
          >
            Continue
          </Button>
          
          <button 
            onClick={onClose}
            className="w-full text-gray-600 text-sm py-2 hover:text-gray-800 transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
}
