import { useState, useEffect } from 'react';
import { useMoodTracking } from '@/react-app/hooks/useMoodTracking';
import { Loader2 } from 'lucide-react';

interface MoodTrackingHistoryProps {
  userId: string;
}

const moodEmojis: Record<string, string> = {
  'very-low': '😔',
  'low': '😞',
  'neutral': '😐',
  'good': '🙂',
  'great': '😊',
  'excellent': '🤩'
};

const moodLabels: Record<string, string> = {
  'very-low': 'Very Low',
  'low': 'Low',
  'neutral': 'Neutral',
  'good': 'Good',
  'great': 'Great',
  'excellent': 'Excellent'
};

export default function MoodTrackingHistory({ userId }: MoodTrackingHistoryProps) {
  const { getMoodHistory, loading } = useMoodTracking();
  const [history, setHistory] = useState<MoodTrackingEntry[]>([]);

  useEffect(() => {
    const loadHistory = async () => {
      const data = await getMoodHistory(userId);
      setHistory(data);
    };
    loadHistory();
  }, [userId, getMoodHistory]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No mood tracking data yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {history.map((entry) => (
        <div
          key={entry.id}
          className="p-4 bg-gray-50 rounded-xl border border-gray-200"
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              {entry.mood_before && (
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{moodEmojis[entry.mood_before] || '😐'}</span>
                  <span className="text-sm text-gray-600">
                    {moodLabels[entry.mood_before] || entry.mood_before}
                  </span>
                </div>
              )}
              {entry.mood_before && entry.mood_after && (
                <span className="text-gray-400">→</span>
              )}
              {entry.mood_after && (
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{moodEmojis[entry.mood_after] || '😐'}</span>
                  <span className="text-sm text-gray-600">
                    {moodLabels[entry.mood_after] || entry.mood_after}
                  </span>
                </div>
              )}
            </div>
            <span className="text-xs text-gray-500">
              {entry.tracked_at ? new Date(entry.tracked_at).toLocaleDateString() : 'Unknown'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

