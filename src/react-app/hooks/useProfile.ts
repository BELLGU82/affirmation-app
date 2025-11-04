import { useState, useCallback, useEffect } from 'react';

export interface UserProfile {
  id?: number;
  email?: string;
  name?: string;
  age?: number;
  gender?: string;
  profession?: string;
  is_premium?: boolean;
  onboarding_completed?: boolean;
  voice_setup_completed?: boolean;
}

export interface UserPreferencesData {
  focus_areas: string[];
  emotional_state: string;
  preferred_tone: string;
  language: string;
  style: string;
  selected_voice?: string;
  interests?: string[];
}

const DEFAULT_PROFILE: UserProfile = {
  name: 'User',
  email: 'user@example.com',
  is_premium: false,
  onboarding_completed: true,
  voice_setup_completed: false
};

const DEFAULT_PREFERENCES: UserPreferencesData = {
  focus_areas: ['mindfulness'],
  emotional_state: 'neutral',
  preferred_tone: 'gentle',
  language: 'en',
  style: 'inspirational'
};

export const useProfile = () => {
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [preferences, setPreferences] = useState<UserPreferencesData>(DEFAULT_PREFERENCES);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const userId = 'user_123'; // Mock user ID for now
      
      // Load user profile
      const userResponse = await fetch(`/api/users/${userId}`);
      const userData = await userResponse.json();
      
      if (userData.success && userData.user) {
        setProfile({
          id: userData.user.id,
          email: userData.user.email,
          name: userData.user.name,
          age: userData.user.age,
          gender: userData.user.gender,
          profession: userData.user.profession,
          is_premium: userData.user.is_premium,
          onboarding_completed: userData.user.onboarding_completed,
          voice_setup_completed: userData.user.voice_setup_completed
        });
      } else {
        // Fallback to default if user doesn't exist
        setProfile(DEFAULT_PROFILE);
      }
      
      // Load preferences
      const prefsResponse = await fetch(`/api/preferences/${userId}`);
      const prefsData = await prefsResponse.json();
      
      if (prefsData.success) {
        setPreferences(prefsData.preferences);
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to load profile');
      // Fallback to defaults on error
      setProfile(DEFAULT_PROFILE);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (updatedProfile: Partial<UserProfile>) => {
    setLoading(true);
    setError(null);
    
    try {
      const userId = 'user_123'; // Mock user ID for now
      
      const response = await fetch(`/api/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedProfile),
      });

      const data = await response.json();
      
      if (data.success) {
        // Update local state
        setProfile(prev => ({ ...prev, ...updatedProfile }));
      } else {
        throw new Error(data.error || 'Failed to update profile');
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      setError(err instanceof Error ? err.message : 'Failed to update profile');
      throw err; // Re-throw to allow UI to handle
    } finally {
      setLoading(false);
    }
  }, []);

  const updatePreferences = useCallback(async (updatedPreferences: Partial<UserPreferencesData>) => {
    setLoading(true);
    setError(null);
    
    try {
      const userId = 'user_123'; // Mock user ID for now
      const newPreferences = { ...preferences, ...updatedPreferences };
      
      const response = await fetch('/api/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          ...newPreferences
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setPreferences(newPreferences);
      } else {
        throw new Error(data.error || 'Failed to update preferences');
      }
    } catch (err) {
      console.error('Error updating preferences:', err);
      setError(err instanceof Error ? err.message : 'Failed to update preferences');
    } finally {
      setLoading(false);
    }
  }, [preferences]);

  // Load profile on mount
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  return {
    profile,
    preferences,
    loading,
    error,
    updateProfile,
    updatePreferences,
    refreshProfile: loadProfile
  };
};
