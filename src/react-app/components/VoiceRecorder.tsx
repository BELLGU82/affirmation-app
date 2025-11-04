import { useState, useRef, useCallback } from 'react';
import { Mic, Square, Play, Pause, Upload, Trash2 } from 'lucide-react';
import Button from './Button';

interface VoiceRecorderProps {
  onVoiceRecorded: (audioBlob: Blob, filename: string) => void;
  onCancel: () => void;
}

export default function VoiceRecorder({ onVoiceRecorded, onCancel }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  const startRecording = useCallback(async () => {
    setError(null);
    setRecordedBlob(null); // Clear previous recording
    
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        } 
      });
      
      // Determine best mime type
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/mp4';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = ''; // Use default
          }
        }
      }
      
      const options: MediaRecorderOptions = mimeType ? { mimeType } : {};
      const mediaRecorder = new MediaRecorder(stream, options);
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setError('Recording error occurred. Please try again.');
      };
      
      mediaRecorder.onstop = () => {
        if (chunksRef.current.length > 0) {
          const blobType = mimeType || 'audio/webm';
          const blob = new Blob(chunksRef.current, { type: blobType });
          setRecordedBlob(blob);
        } else {
          setError('No audio data recorded. Please try again.');
        }
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => {
          track.stop();
        });
      };
      
      // Start recording with timeslice for better reliability
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setDuration(0);
      
      // Start timer
      timerRef.current = window.setInterval(() => {
        setDuration(prev => prev + 0.1);
      }, 100);
      
    } catch (err: unknown) {
      console.error('Error starting recording:', err);
      const error = err as { name?: string; message?: string };
      if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
        setError('Microphone permission denied. Please enable microphone access in your browser settings.');
      } else if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
        setError('No microphone found. Please connect a microphone and try again.');
      } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
        setError('Microphone is being used by another application. Please close it and try again.');
      } else {
        setError(`Failed to access microphone: ${error.message || 'Unknown error'}. Please check permissions and try again.`);
      }
      setIsRecording(false);
    }
  }, []);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      try {
        if (mediaRecorderRef.current.state !== 'inactive') {
          mediaRecorderRef.current.stop();
        }
      } catch (err) {
        console.error('Error stopping recording:', err);
      }
      
      setIsRecording(false);
      
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  }, [isRecording]);

  const playRecording = useCallback(async () => {
    if (!recordedBlob) return;
    
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
      return;
    }
    
    try {
      if (!audioRef.current) {
        audioRef.current = new Audio();
      }
      
      const audioUrl = URL.createObjectURL(recordedBlob);
      audioRef.current.src = audioUrl;
      
      audioRef.current.onended = () => {
        setIsPlaying(false);
        URL.revokeObjectURL(audioUrl);
      };
      
      await audioRef.current.play();
      setIsPlaying(true);
      
    } catch (err) {
      console.error('Error playing recording:', err);
      setError('Failed to play recording');
    }
  }, [recordedBlob, isPlaying]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setRecordedBlob(file);
      setError(null);
    } else {
      setError('Please select a valid audio file');
    }
    event.target.value = '';
  }, []);

  const handleSave = useCallback(() => {
    if (recordedBlob) {
      const timestamp = new Date().getTime();
      const filename = `voice_${timestamp}.webm`;
      onVoiceRecorded(recordedBlob, filename);
    }
  }, [recordedBlob, onVoiceRecorded]);

  const clearRecording = useCallback(() => {
    setRecordedBlob(null);
    setIsPlaying(false);
    setDuration(0);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
    }
  }, []);

  return (
    <div className="p-6 bg-white rounded-2xl shadow-xl max-w-md mx-auto">
      <h3 className="text-xl font-semibold text-gray-800 mb-6 text-center">
        Record Your Voice
      </h3>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
      
      <div className="text-center mb-6">
        {!recordedBlob ? (
          <div>
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-20 h-20 rounded-full flex items-center justify-center text-white shadow-lg transition-all ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600 animate-pulse' 
                  : 'bg-gradient-to-br from-indigo-500 to-purple-600 hover:shadow-xl'
              }`}
            >
              {isRecording ? <Square size={24} /> : <Mic size={24} />}
            </button>
            
            <p className="text-gray-600 mt-3 text-sm">
              {isRecording ? 'Recording...' : 'Tap to start recording'}
            </p>
            
            {isRecording && (
              <p className="text-lg font-mono text-indigo-600 mt-2">
                {duration.toFixed(1)}s
              </p>
            )}
          </div>
        ) : (
          <div>
            <button
              onClick={playRecording}
              className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-shadow"
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} />}
            </button>
            
            <p className="text-gray-600 mt-3 text-sm">
              Recording ready • {duration.toFixed(1)}s
            </p>
            
            <div className="flex justify-center gap-2 mt-3">
              <button
                onClick={clearRecording}
                className="p-2 text-gray-500 hover:text-red-600 transition-colors"
              >
                <Trash2 size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="mb-6">
        <div className="border-t border-gray-200 pt-4 text-center">
          <p className="text-gray-500 text-sm mb-3">Or upload an audio file</p>
          <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg cursor-pointer hover:bg-gray-200 transition-colors">
            <Upload size={16} />
            <span className="text-sm">Choose File</span>
            <input
              type="file"
              accept="audio/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>
      
      <div className="flex gap-3">
        <Button
          onClick={onCancel}
          variant="outline"
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          disabled={!recordedBlob}
          className="flex-1"
        >
          Save Voice
        </Button>
      </div>
    </div>
  );
}
