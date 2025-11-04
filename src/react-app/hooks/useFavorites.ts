import { useState, useCallback, useEffect } from 'react';
import { Affirmation } from './useAffirmations';

export const useFavorites = () => {
  const [favorites, setFavorites] = useState<Affirmation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'mindfulness' | 'confidence' | 'self-love' | 'motivation' | 'anxiety' | 'success' | 'relationships' | 'health' | 'creativity'>('all');

  const loadFavorites = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const userId = 'user_123'; // Mock user ID for now
      const response = await fetch(`/api/affirmations/${userId}`);
      const data = await response.json();
      
      if (data.success) {
        // Filter only favorites
        const favoriteAffirmations = data.affirmations.filter((aff: Affirmation) => aff.is_favorite);
        setFavorites(favoriteAffirmations);
      } else {
        throw new Error(data.error || 'Failed to load favorites');
      }
    } catch (err) {
      console.error('Error loading favorites:', err);
      setError(err instanceof Error ? err.message : 'Failed to load favorites');
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const toggleFavorite = useCallback(async (affirmationId: number) => {
    try {
      // Get current state of the affirmation
      const favorite = favorites.find(fav => fav.id === affirmationId);
      const newFavoriteState = !favorite?.is_favorite;
      
      const response = await fetch(`/api/affirmations/${affirmationId}/favorite`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ is_favorite: newFavoriteState }),
      });

      if (response.ok) {
        // Update local state immediately
        if (newFavoriteState) {
          // Adding to favorites - would need to reload or add to list
          // For now, just refresh the list
          await loadFavorites();
        } else {
          // Removing from favorites - remove from list
          setFavorites(prev => prev.filter(fav => fav.id !== affirmationId));
        }
      } else {
        throw new Error('Failed to update favorite');
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      setError(err instanceof Error ? err.message : 'Failed to toggle favorite');
    }
  }, [favorites, loadFavorites]);

  const playAffirmation = useCallback((affirmation: Affirmation) => {
    // Store the current affirmation for the player
    localStorage.setItem('currentAffirmation', JSON.stringify(affirmation));
    // Navigate to player
    window.location.href = '/player';
  }, []);

  // Filter favorites based on search and filter selection
  const filteredFavorites = favorites.filter(favorite => {
    const matchesSearch = favorite.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (favorite.focus_area && favorite.focus_area.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = selectedFilter === 'all' || favorite.focus_area === selectedFilter;
    
    return matchesSearch && matchesFilter;
  });

  // Load favorites on mount
  useEffect(() => {
    loadFavorites();
  }, [loadFavorites]);

  return {
    favorites: filteredFavorites,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    selectedFilter,
    setSelectedFilter,
    toggleFavorite,
    playAffirmation,
    refreshFavorites: loadFavorites
  };
};
