import { useNavigate } from 'react-router';
import GradientBackground from '@/react-app/components/GradientBackground';
import Button from '@/react-app/components/Button';
import { Heart, Sparkles, Zap } from 'lucide-react';

export default function Tutorial2() {
  const navigate = useNavigate();

  return (
    <GradientBackground>
      <div className="flex flex-col min-h-screen px-6 py-12">
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="relative mb-12">
            <div className="grid grid-cols-2 gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-400 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/25 animate-pulse">
                <Heart className="w-10 h-10 text-white" />
              </div>
              <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/25 animate-pulse delay-150">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
            </div>
            <div className="flex justify-center mt-6">
              <div className="w-24 h-24 bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg shadow-pink-500/25 animate-pulse delay-300">
                <Zap className="w-10 h-10 text-white" />
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mb-6 leading-tight">
            Tailored to your<br />
            emotional needs
          </h1>

          <p className="text-gray-600 text-lg leading-relaxed max-w-sm">
            Our AI understands your current state and creates affirmations that resonate with where you are today.
          </p>
        </div>

        <div className="space-y-4">
          <Button 
            onClick={() => navigate('/tutorial/3')}
            className="w-full"
            size="lg"
          >
            Continue
          </Button>
          
          <button 
            onClick={() => navigate('/signup')}
            className="w-full text-gray-500 text-sm py-2"
          >
            Skip tutorial
          </button>
        </div>

        {/* Progress indicator */}
        <div className="flex justify-center space-x-2 mt-6">
          <div className="w-2 h-1 bg-gray-300 rounded-full" />
          <div className="w-8 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full" />
          <div className="w-2 h-1 bg-gray-300 rounded-full" />
        </div>
      </div>
    </GradientBackground>
  );
}
