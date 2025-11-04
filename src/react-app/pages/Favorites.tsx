import { useState } from 'react';
import GradientBackground from '@/react-app/components/GradientBackground';
import BottomNavigation from '@/react-app/components/BottomNavigation';
import Button from '@/react-app/components/Button';
import { Heart, Play, Search, Filter, ChevronDown, Loader2 } from 'lucide-react';
import { useFavorites } from '@/react-app/hooks/useFavorites';

export default function Favorites() {
  const {
    favorites,
    loading,
    error,
    searchQuery,
    setSearchQuery,
    selectedFilter,
    setSelectedFilter,
    toggleFavorite,
    playAffirmation
  } = useFavorites();
  
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);

  const filterOptions = [
    { value: 'all', label: 'All Categories' },
    { value: 'confidence', label: 'Confidence' },
    { value: 'anxiety', label: 'Anxiety Relief' },
    { value: 'motivation', label: 'Motivation' },
    { value: 'self-love', label: 'Self Love' },
    { value: 'success', label: 'Success' },
    { value: 'relationships', label: 'Relationships' },
    { value: 'health', label: 'Health & Wellness' },
    { value: 'creativity', label: 'Creativity' },
    { value: 'mindfulness', label: 'Mindfulness' }
  ];

  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 text-center">
      <div className="w-24 h-24 bg-gradient-to-br from-pink-100 to-rose-100 rounded-full flex items-center justify-center mb-6">
        <Heart className="w-12 h-12 text-pink-400" />
      </div>
      
      <h2 className="text-xl font-bold text-gray-800 mb-3">
        No favorites yet
      </h2>
      <p className="text-gray-600 mb-8 leading-relaxed">
        Heart affirmations you love to save them here for easy access.
      </p>
      
      <Button onClick={() => window.location.href = '/home'} size="lg">
        Discover Affirmations
      </Button>
    </div>
  );

  if (loading) {
    return (
      <GradientBackground>
        <div className="min-h-screen pb-20 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
            <p className="text-gray-600">Loading your favorites...</p>
          </div>
          <BottomNavigation />
        </div>
      </GradientBackground>
    );
  }

  if (favorites.length === 0) {
    return (
      <GradientBackground>
        <div className="min-h-screen pb-20">
          <EmptyState />
          <BottomNavigation />
        </div>
      </GradientBackground>
    );
  }

  return (
    <GradientBackground>
      <div className="min-h-screen pb-20">
        {/* Header */}
        <div className="px-6 pt-12 pb-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Favorites</h1>
              <p className="text-gray-600">{favorites.length} saved affirmations</p>
            </div>
            
            <div className="relative">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              >
                <Filter size={20} />
                <ChevronDown size={16} className="ml-1" />
              </Button>
              
              {showFilterDropdown && (
                <div className="absolute right-0 top-12 bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-xl shadow-lg z-50 min-w-48">
                  {filterOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setSelectedFilter(option.value as typeof selectedFilter);
                        setShowFilterDropdown(false);
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl transition-colors ${
                        selectedFilter === option.value ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'
                      }`}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search your favorites..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-transparent text-gray-800 placeholder-gray-500"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="px-6 mb-4">
            <div className="bg-red-50 border border-red-200 rounded-2xl p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Favorites List */}
        <div className="px-6 space-y-4">
          {favorites.map((favorite) => (
            <div
              key={favorite.id}
              className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg shadow-indigo-500/5 border border-gray-200/50"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <p className="text-gray-800 leading-relaxed font-medium mb-3">
                    "{favorite.text}"
                  </p>
                  
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
                    <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded-lg capitalize">
                      {favorite.focus_area}
                    </span>
                    <span className="capitalize">{favorite.tone}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Saved on {favorite.created_at ? new Date(favorite.created_at).toLocaleDateString() : 'Unknown date'}
                </span>
                
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => playAffirmation(favorite)}
                  >
                    <Play size={16} />
                    Play
                  </Button>
                  
                  <button 
                    onClick={() => toggleFavorite(favorite.id!)}
                    className="w-8 h-8 bg-pink-50 border border-pink-200 rounded-lg flex items-center justify-center text-pink-500 hover:bg-pink-100 transition-colors"
                  >
                    <Heart size={16} fill="currentColor" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {favorites.length === 0 && searchQuery && (
            <div className="text-center py-12">
              <div className="text-gray-500 mb-2">No results found for "{searchQuery}"</div>
              <button 
                onClick={() => setSearchQuery('')}
                className="text-indigo-600 hover:text-indigo-700 text-sm"
              >
                Clear search
              </button>
            </div>
          )}
        </div>

        <BottomNavigation />
      </div>
    </GradientBackground>
  );
}
