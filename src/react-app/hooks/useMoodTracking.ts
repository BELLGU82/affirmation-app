import { useState, useCallback } from 'react';

export interface MoodTrackingData {
  id?: number;
  user_id: string;
  mood_before?: string;
  mood_after?: string;
  affirmation_id?: number;
  tracked_at?: string;
}

export const useMoodTracking = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const saveMoodTracking = useCallback(async (data: Omit<MoodTrackingData, 'id' | 'tracked_at'>) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/mood-tracking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to save mood tracking');
      }

      return result.id;
    } catch (err) {
      console.error('Error saving mood tracking:', err);
      setError(err instanceof Error ? err.message : 'Failed to save mood tracking');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getMoodHistory = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/mood-tracking/${userId}`);
      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch mood history');
      }

      return result.mood_tracking;
    } catch (err) {
      console.error('Error fetching mood history:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch mood history');
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    saveMoodTracking,
    getMoodHistory,
  };
};

