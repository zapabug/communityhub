import NDK from '@nostr-dev-kit/ndk';
import { Profile, WebOfTrust, ProfileId } from '../types';

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