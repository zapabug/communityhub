// Declare modules that don't have type definitions

// Declare NostrContext
declare module '../context/NostrContext' {
  import NDK from '@nostr-dev-kit/ndk';
  import { Profile, WebOfTrust, ProfileId } from '.';

  export interface NostrContextType {
    ndk: NDK | null;
    wot: WebOfTrust;
    isLoading: boolean;
    corePubkeys: string[];
    getTrustedProfiles: (minTrustScore?: number) => Profile[];
    isAuthenticated: boolean;
    login: () => Promise<void>;
    logout: () => void;
    currentUser: ProfileId | null;
  }

  export function useNostr(): NostrContextType;

  export interface NostrProviderProps {
    children: React.ReactNode;
  }

  export const NostrProvider: React.FC<NostrProviderProps>;
}

// Declare ImageCard
declare module '../components/ImageFeed/ImageCard' {
  import React from 'react';

  export interface ImageCardProps {
    imageUrl: string;
    eventId: string;
    profileId: string;
  }

  const ImageCard: React.FC<ImageCardProps>;
  export default ImageCard;
}

// Also declare specific path for the component
declare module './ImageCard' {
  import { ImageCardProps } from '../components/ImageFeed/ImageCard';

  const ImageCard: React.FC<ImageCardProps>;
  export default ImageCard;
}

interface Window {
  nostr?: {
    getPublicKey(): Promise<string>;
    signEvent(event: any): Promise<{ sig: string }>;
    nip04?: {
      encrypt(pubkey: string, plaintext: string): Promise<string>;
      decrypt(pubkey: string, ciphertext: string): Promise<string>;
    };
  };
  nostrLogin?: {
    logout(): void;
  };
} 