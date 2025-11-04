import React, { useEffect, useState } from 'react';
import { Sparkles, Wand2, Volume2, Music } from 'lucide-react';

interface GeneratingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

const steps = [
  { icon: Wand2, label: 'Analyzing your preferences', duration: 2000 },
  { icon: Sparkles, label: 'Generating personalized affirmation', duration: 3000 },
  { icon: Volume2, label: 'Creating audio narration', duration: 2500 },
  { icon: Music, label: 'Adding background music', duration: 2000 }
];

export default function GeneratingModal({ isOpen, onComplete }: GeneratingModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!isOpen) {
      setCurrentStep(0);
      setProgress(0);
      return;
    }

    const totalDuration = steps.reduce((acc, step) => acc + step.duration, 0);
    let elapsed = 0;

    const progressInterval = setInterval(() => {
      elapsed += 100;
      setProgress((elapsed / totalDuration) * 100);

      if (elapsed >= totalDuration) {
        clearInterval(progressInterval);
        onComplete();
      }
    }, 100);

    // Update current step
    let stepElapsed = 0;
    steps.forEach((step, index) => {
      setTimeout(() => {
        setCurrentStep(index);
      }, stepElapsed);
      stepElapsed += step.duration;
    });

    return () => clearInterval(progressInterval);
  }, [isOpen, onComplete]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-6">
      <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl">
        {/* Animated Icon */}
        <div className="relative mb-8">
          <div className="w-24 h-24 bg-gradient-to-br from-indigo-500/20 to-purple-600/20 rounded-full mx-auto animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-full flex items-center justify-center shadow-xl shadow-indigo-500/30 animate-bounce">
              {React.createElement(steps[currentStep]?.icon || Sparkles, { 
                size: 24, 
                className: "text-white" 
              })}
            </div>
          </div>
        </div>

        {/* Progress */}
        <div className="mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-2">Creating Your Affirmation</h3>
          <p className="text-gray-600 mb-4">{steps[currentStep]?.label}</p>
          
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          <div className="text-sm text-gray-500 mt-2">
            {Math.round(progress)}% complete
          </div>
        </div>

        {/* Steps Indicator */}
        <div className="flex justify-center space-x-2">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors duration-300 ${
                index <= currentStep 
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-600' 
                  : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
