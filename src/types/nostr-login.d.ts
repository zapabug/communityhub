declare module 'nostr-login' {
    export interface NostrLoginOptions {
        perms?: string[];
        theme?: 'dark' | 'light';
        darkMode?: boolean;
        startScreen?: string;
        bunkers?: string[];
        devOverrideBunkerOrigin?: string;
        onAuth?: (npub: string, options: any) => void;
        noBanner?: boolean;
        isSignInWithExtension?: boolean;
    }

    export function init(options?: NostrLoginOptions): void;
    export function launch(options?: { startScreen?: string }): void;
    export function logout(): void;
} 