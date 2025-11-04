import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import GradientBackground from '@/react-app/components/GradientBackground';
import Button from '@/react-app/components/Button';
import VoiceRecorder from '@/react-app/components/VoiceRecorder';
import { useVoiceSamples } from '@/react-app/hooks/useVoiceSamples';
import { Volume2, Play, Pause, Mic, Loader2 } from 'lucide-react';

// Voice options with Google TTS mapping
const voiceOptions = [
  { 
    id: 'sarah', 
    name: 'Sarah', 
    description: 'Warm and nurturing', 
    gender: 'female',
    previewText: 'I am worthy of love and respect. My voice matters.'
  },
  { 
    id: 'alex', 
    name: 'Alex', 
    description: 'Confident and clear', 
    gender: 'male',
    previewText: 'I am capable of achieving my goals. I trust my abilities.'
  },
  { 
    id: 'maya', 
    name: 'Maya', 
    description: 'Gentle and soothing', 
    gender: 'female',
    previewText: 'I am gentle with myself. I choose peace and understanding.'
  },
  { 
    id: 'james', 
    name: 'James', 
    description: 'Deep and calming', 
    gender: 'male',
    previewText: 'I am calm and centered. I navigate challenges with wisdom.'
  },
  { 
    id: 'luna', 
    name: 'Luna', 
    description: 'Peaceful and wise', 
    gender: 'female',
    previewText: 'I am peaceful and wise. I trust the journey ahead.'
  }
];

export default function VoiceSetup() {
  const navigate = useNavigate();
  const [selectedVoice, setSelectedVoice] = useState<string>('');
  const [showRecorder, setShowRecorder] = useState(false);
  interface CustomVoice {
    id: number;
    voice_type: string;
    original_filename?: string;
    is_active: boolean;
    created_at?: string;
  }
  
  const [customVoices, setCustomVoices] = useState<CustomVoice[]>([]);
  const [uploading, setUploading] = useState(false);
  
  const { playingVoice, loading, playVoiceSample } = useVoiceSamples();

  // Load existing custom voices on component mount
  useEffect(() => {
    const loadCustomVoices = async () => {
      try {
        const response = await fetch('/api/user-voices');
        if (response.ok) {
          const voices = await response.json();
          setCustomVoices(voices);
        }
      } catch (error) {
        console.error('Failed to load custom voices:', error);
      }
    };
    
    loadCustomVoices();
  }, []);

  const handleVoiceRecorded = async (audioBlob: Blob, filename: string) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, filename);
      
      const response = await fetch('/api/user-voices/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const newVoice = await response.json();
        setCustomVoices(prev => [...prev, newVoice]);
        setSelectedVoice(`custom_${newVoice.id}`);
        setShowRecorder(false);
      } else {
        console.error('Failed to upload voice');
      }
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleContinue = () => {
    if (selectedVoice) {
      localStorage.setItem('selected_voice', selectedVoice);
      navigate('/home');
    }
  };

  return (
    <GradientBackground>
      <div className="flex flex-col min-h-screen px-6 py-12">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-500/25">
            <Volume2 className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-800 mb-3">
            Choose Your Voice
          </h1>
          <p className="text-gray-600">
            Select the voice that resonates with you most
          </p>
        </div>

        <div className="flex-1">
          <div className="space-y-3 mb-8">
            {voiceOptions.map((voice) => (
              <div
                key={voice.id}
                className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                  selectedVoice === voice.id
                    ? 'border-indigo-500 bg-gradient-to-br from-indigo-50 to-purple-50 shadow-lg'
                    : 'border-gray-200 bg-white/80 backdrop-blur-sm'
                }`}
              >
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setSelectedVoice(voice.id)}
                    className="flex-1 text-left"
                  >
                    <div className="font-medium text-gray-800 mb-1">{voice.name}</div>
                    <div className="text-sm text-gray-600">{voice.description}</div>
                  </button>
                  
                  <button
                    onClick={async () => {
                      try {
                        // Generate preview audio URL using Google TTS
                        const previewUrl = `/api/text-to-speech/preview`;
                        const response = await fetch(previewUrl, {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                          },
                          body: JSON.stringify({
                            text: voice.previewText,
                            voiceName: voice.id,
                            language: 'en',
                          }),
                        });

                        if (response.ok) {
                          // Create blob URL from response
                          const audioBlob = await response.blob();
                          const blobUrl = URL.createObjectURL(audioBlob);
                          await playVoiceSample(voice.id, blobUrl);
                        } else {
                          console.error('Failed to generate preview');
                        }
                      } catch (error) {
                        console.error('Failed to play voice:', error);
                      }
                    }}
                    disabled={loading}
                    className="ml-4 w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50"
                    title={playingVoice === voice.id ? 'Click to stop' : 'Click to preview'}
                  >
                    {loading && playingVoice === voice.id ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : playingVoice === voice.id ? (
                      <Pause size={16} />
                    ) : (
                      <Play size={16} />
                    )}
                  </button>
                </div>
              </div>
            ))}
            
            {/* Custom voices */}
            {customVoices.map((voice) => (
              <div
                key={`custom_${voice.id}`}
                className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                  selectedVoice === `custom_${voice.id}`
                    ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 shadow-lg'
                    : 'border-gray-200 bg-white/80 backdrop-blur-sm'
                }`}
              >
                <div className="flex items-center justify-between">
                  <button
                    onClick={() => setSelectedVoice(`custom_${voice.id}`)}
                    className="flex-1 text-left"
                  >
                    <div className="font-medium text-gray-800 mb-1 flex items-center gap-2">
                      <Mic size={16} className="text-green-600" />
                      My Voice
                    </div>
                    <div className="text-sm text-gray-600">Your personalized voice</div>
                  </button>
                  
                  <button
                    onClick={() => playVoiceSample(`custom_${voice.id}`, `/api/user-voices/${voice.id}/audio`)}
                    disabled={loading}
                    className="ml-4 w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-shadow disabled:opacity-50"
                  >
                    {loading && playingVoice === `custom_${voice.id}` ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : playingVoice === `custom_${voice.id}` ? (
                      <Pause size={16} />
                    ) : (
                      <Play size={16} />
                    )}
                  </button>
                </div>
              </div>
            ))}
            
            {/* Add custom voice button */}
            <button
              onClick={() => setShowRecorder(true)}
              className="w-full p-4 rounded-xl border-2 border-dashed border-gray-300 bg-white/80 backdrop-blur-sm hover:border-indigo-400 hover:bg-indigo-50/50 transition-all duration-300"
            >
              <div className="flex items-center justify-center gap-3 text-gray-600 hover:text-indigo-600">
                <Mic size={20} />
                <span className="font-medium">Record My Voice</span>
              </div>
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <Button 
            onClick={handleContinue}
            className="w-full"
            size="lg"
            disabled={!selectedVoice || uploading}
          >
            {uploading ? (
              <div className="flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                Saving Voice...
              </div>
            ) : (
              'Start My Journey'
            )}
          </Button>
          
          <button 
            onClick={() => navigate('/home')}
            className="w-full text-gray-500 text-sm py-2"
          >
            Skip for now
          </button>
        </div>
      </div>
      
      {/* Voice Recorder Modal */}
      {showRecorder && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <VoiceRecorder
            onVoiceRecorded={handleVoiceRecorded}
            onCancel={() => setShowRecorder(false)}
          />
        </div>
      )}
    </GradientBackground>
  );
}
