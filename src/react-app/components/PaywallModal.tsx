import Button from './Button';
import { X, Crown, Sparkles, Volume2, Heart } from 'lucide-react';

interface PaywallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade: () => void;
}

const features = [
  { icon: Sparkles, text: 'Unlimited affirmation generations' },
  { icon: Volume2, text: 'Premium voice selection' },
  { icon: Heart, text: 'Advanced mood tracking' },
  { icon: Crown, text: 'Priority customer support' }
];

export default function PaywallModal({ isOpen, onClose, onUpgrade }: PaywallModalProps) {
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
            <Crown className="w-8 h-8 text-white" />
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800 mb-2">
            Upgrade to Premium
          </h2>
          <p className="text-gray-600">
            Unlock unlimited personalized affirmations
          </p>
        </div>

        {/* Features */}
        <div className="space-y-4 mb-8">
          {features.map((feature, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-lg flex items-center justify-center">
                <feature.icon size={16} className="text-indigo-600" />
              </div>
              <span className="text-gray-800">{feature.text}</span>
            </div>
          ))}
        </div>

        {/* Pricing */}
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 mb-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-gray-800 mb-1">
              $9.99
              <span className="text-lg font-normal text-gray-600">/month</span>
            </div>
            <div className="text-sm text-gray-600">
              Cancel anytime • 7-day free trial
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Button onClick={onUpgrade} className="w-full" size="lg">
            Start Free Trial
          </Button>
          
          <button 
            onClick={onClose}
            className="w-full text-gray-600 text-sm py-2 hover:text-gray-800 transition-colors"
          >
            Maybe later
          </button>
        </div>

        {/* Fine print */}
        <p className="text-xs text-gray-500 text-center mt-4 leading-relaxed">
          By continuing, you agree to our Terms of Service and Privacy Policy. 
          Subscription automatically renews unless cancelled.
        </p>
      </div>
    </div>
  );
}
