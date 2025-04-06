import React from 'react';

export interface ImageCardProps {
  imageUrl: string;
  eventId: string;
  profileId: string;
}

declare const ImageCard: React.FC<ImageCardProps>;

export default ImageCard; 