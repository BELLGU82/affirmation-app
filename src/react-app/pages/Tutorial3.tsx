import { useNavigate } from 'react-router';
import GradientBackground from '@/react-app/components/GradientBackground';
import Button from '@/react-app/components/Button';
import { Volume2, Music } from 'lucide-react';

export default function Tutorial3() {
  const navigate = useNavigate();

  return (
    <GradientBackground>
      <div className="flex flex-col min-h-screen px-6 py-12">
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="relative mb-12">
            <div className="relative w-40 h-40">
              {/* Sound waves animation */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-20 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full animate-pulse" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center rotate-45">
                <div className="w-16 h-1 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full animate-pulse delay-150" />
              </div>
              <div className="absolute inset-0 flex items-center justify-center -rotate-45">
                <div className="w-24 h-1 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full animate-pulse delay-300" />
              </div>
              
              {/* Center circle with icons */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-full flex items-center justify-center shadow-xl shadow-indigo-500/25">
                  <div className="flex items-center space-x-1">
                    <Volume2 className="w-4 h-4 text-white" />
                    <Music className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mb-6 leading-tight">
            Audio affirmations with<br />
            soothing background music
          </h1>

          <p className="text-gray-600 text-lg leading-relaxed max-w-sm">
            Listen to your personalized affirmations with AI-generated voice and calming music designed to enhance your experience.
          </p>
        </div>

        <div className="space-y-4">
          <Button 
            onClick={() => navigate('/signup')}
            className="w-full"
            size="lg"
          >
            Get Started
          </Button>
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center space-x-2 mt-6">
          <div className="w-2 h-1 bg-gray-300 rounded-full" />
          <div className="w-2 h-1 bg-gray-300 rounded-full" />
          <div className="w-8 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full" />
        </div>
      </div>
    </GradientBackground>
  );
}
