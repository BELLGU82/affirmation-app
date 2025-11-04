import { useNavigate } from 'react-router';
import GradientBackground from '@/react-app/components/GradientBackground';
import Button from '@/react-app/components/Button';

export default function Tutorial1() {
  const navigate = useNavigate();

  return (
    <GradientBackground>
      <div className="flex flex-col min-h-screen px-6 py-12">
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <div className="relative mb-12">
            {/* Animated microphone illustration */}
            <div className="relative w-40 h-40">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-400/20 to-purple-500/20 rounded-full animate-pulse" />
              <div className="absolute inset-4 bg-gradient-to-br from-indigo-500/30 to-purple-600/30 rounded-full animate-pulse delay-150" />
              <div className="absolute inset-8 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-full flex items-center justify-center shadow-xl shadow-indigo-500/25">
                <img 
                  src="https://mocha-cdn.com/019a3fa6-c7d9-7206-8da1-fb9db5ce726d/record.png" 
                  alt="Microphone" 
                  className="w-16 h-16 opacity-90"
                />
              </div>
            </div>
          </div>

          <h1 className="text-3xl font-bold text-gray-800 mb-6 leading-tight">
            AI-generated affirmation<br />
            customized for you today.
          </h1>

          <p className="text-gray-600 text-lg leading-relaxed max-w-sm">
            Discover personalized affirmations that adapt to your emotional state and personal journey.
          </p>
        </div>

        <div className="space-y-4">
          <Button 
            onClick={() => navigate('/tutorial/2')}
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
          <div className="w-8 h-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full" />
          <div className="w-2 h-1 bg-gray-300 rounded-full" />
          <div className="w-2 h-1 bg-gray-300 rounded-full" />
        </div>
      </div>
    </GradientBackground>
  );
}
