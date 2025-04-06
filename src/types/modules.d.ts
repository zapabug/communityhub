// Declare modules that are having import issues

// ImageCard component
declare module '../../components/ImageFeed/ImageCard' {
    import { FC } from 'react';

    interface ImageCardProps {
        imageUrl: string;
        eventId: string;
        profileId: string;
    }

    const ImageCard: FC<ImageCardProps>;
    export default ImageCard;
}

// Relative import version
declare module './ImageCard' {
    import ImageCard from '../../components/ImageFeed/ImageCard';
    export default ImageCard;
}

// NostrContext
declare module '../context/NostrContext' {
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
} 