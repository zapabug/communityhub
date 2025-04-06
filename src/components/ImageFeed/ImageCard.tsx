import React, { useState, useEffect } from 'react';
import { CacheService } from '../../services/CacheService';

interface ImageCardProps {
  imageUrl: string;
  eventId: string;
  profileId: string;
}

const ImageCard: React.FC<ImageCardProps> = ({ imageUrl, eventId, profileId }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);
  
  // Get profile data from cache
  const profile = CacheService.getProfile(profileId);
  const profileName = profile?.name || profileId.substring(0, 8);
  const profilePicture = profile?.picture;

  // Pre-load profile images to check if they're valid
  useEffect(() => {
    if (profilePicture) {
      const img = new Image();
      img.onload = () => setIsProfileLoaded(true);
      img.onerror = () => setIsProfileLoaded(false);
      img.src = profilePicture;
    }
  }, [profilePicture]);
  
  // Error handler functions
  const handleImageError = () => {
    console.error(`Failed to load image: ${imageUrl}`);
    setHasError(true);
  };
  
  if (hasError) {
    return null; // Don't show cards with broken images
  }

  return (
    <div className="rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
      <div className="relative pb-[100%]"> {/* 1:1 aspect ratio */}
        {!isLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="animate-pulse w-8 h-8 rounded-full bg-gray-200"></div>
          </div>
        )}
        <img
          src={imageUrl}
          alt={`Image by ${profileName}`}
          loading="lazy"
          className={`absolute inset-0 w-full h-full object-cover ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          onLoad={() => setIsLoaded(true)}
          onError={handleImageError}
        />
      </div>
      
      <div className="p-2 flex items-center">
        {profilePicture && isProfileLoaded ? (
          <img 
            src={profilePicture} 
            alt={profileName}
            className="w-6 h-6 rounded-full mr-2"
            onError={() => setIsProfileLoaded(false)}
          />
        ) : (
          <div className="w-6 h-6 rounded-full bg-purple-500 mr-2 flex items-center justify-center text-white text-xs">
            {profileName.substring(0, 1).toUpperCase()}
          </div>
        )}
        <span className="text-sm font-medium truncate">{profileName}</span>
      </div>
    </div>
  );
};

export default ImageCard; 