import React, { createContext, useContext, useState, useEffect } from 'react';
import NDK, { NDKEvent, NDKSubscription, NDKFilter } from '@nostr-dev-kit/ndk';
import { Profile, GraphNode, GraphEdge, WebOfTrust, ProfileId } from '../types';
import { CacheService } from '../services/CacheService';

// Augment NDK types to include missing methods
declare module '@nostr-dev-kit/ndk' {
  interface NDKSubscription {
    stop(): void;
  }
}

interface NostrContextType {
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

const NostrContext = createContext<NostrContextType | undefined>(undefined);

export const useNostr = () => {
  const context = useContext(NostrContext);
  if (!context) {
    throw new Error('useNostr must be used within a NostrProvider');
  }
  return context;
};

export const NostrProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [ndk, setNDK] = useState<NDK | null>(null);
  const [wot, setWOT] = useState<WebOfTrust>({ nodes: new Map(), edges: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<ProfileId | null>(null);

  // Core npubs (starting point)
  const corePubkeys = [
    'npub1dxd02kcjhgpkyrx60qnkd6j42kmc72u5lum0rp2ud8x5zfhnk4zscjj6hh', // MADTRIPS
    'npub1funchalx8v747rsee6ahsuyrcd2s3rnxlyrtumfex9lecpmgwars6hq8kc', // FUNCHAL 
    'npub1etgqcj9gc6yaxttuwu9eqgs3ynt2dzaudvwnrssrn2zdt2useaasfj8n6e', // COMMUNITY
    'npub1s0veng2gvfwr62acrxhnqexq76sj6ldg3a5t935jy8e6w3shr5vsnwrmq5'  // SEC
  ];

  useEffect(() => {
    // Listen for nostr-login auth events
    const handleNostrLogin = async (event: any) => {
      if (event.type === 'nlAuth') {
        const npub = event.detail?.npub;
        if (npub) {
          console.log('User authenticated with nostr-login:', npub);
          setIsAuthenticated(true);
          setCurrentUser(npub);
        }
      }
    };

    window.addEventListener('nlAuth', handleNostrLogin);

    const initNDK = async () => {
      // Initialize NDK with relays
      const newNDK = new NDK({
        explicitRelayUrls: [
          'wss://relay.damus.io',
          'wss://relay.nostr.band',
          'wss://nos.lol',
          // Add more relays as needed
        ],
        // Prevent too many concurrent connections
        autoConnectUserRelays: false,
        enableOutboxModel: false // Disable additional features to reduce load
      });

      // Check if window.nostr exists and signer is available (via nostr-login)
      if (typeof window !== 'undefined' && window.nostr) {
        try {
          const pubkey = await window.nostr.getPublicKey();
          if (pubkey) {
            // Configure NDK to use window.nostr as signer
            newNDK.signer = {
              user: () => {
                // Create a proper NDKUser object
                const ndkUser = { pubkey } as any;
                return Promise.resolve(ndkUser);
              },
              nip04: {
                encrypt: async (pubkey: string, plaintext: string) => {
                  if (window.nostr?.nip04) {
                    return await window.nostr.nip04.encrypt(pubkey, plaintext);
                  }
                  throw new Error("NIP-04 not supported by wallet");
                },
                decrypt: async (pubkey: string, ciphertext: string) => {
                  if (window.nostr?.nip04) {
                    return await window.nostr.nip04.decrypt(pubkey, ciphertext);
                  }
                  throw new Error("NIP-04 not supported by wallet");
                }
              },
              signEvent: async (event: any) => {
                if (window.nostr) {
                  const signed = await window.nostr.signEvent(event);
                  return signed.sig;
                }
                throw new Error("Cannot sign event");
              },
              getPublicKey: async () => {
                if (window.nostr) {
                  return await window.nostr.getPublicKey();
                }
                throw new Error("Cannot get public key");
              }
            } as any; // Use type assertion for now

            setIsAuthenticated(true);
            setCurrentUser(pubkey);
          }
        } catch (err) {
          console.log('No authenticated user found:', err);
        }
      }

      try {
        console.log('Connecting to Nostr relays...');
        await newNDK.connect();
        console.log('Connected to Nostr relays successfully');
        setNDK(newNDK);

        // Initialize WOT with core npubs
        const initialWOT: WebOfTrust = {
          nodes: new Map(),
          edges: []
        };

        // Add core nodes
        for (const pubkey of corePubkeys) {
          initialWOT.nodes.set(pubkey, {
            id: pubkey,
            profile: { id: pubkey },
            trustScore: 100, // Core nodes have max trust
            isCoreNode: true
          });
        }

        setWOT(initialWOT);
        await fetchProfilesForCoreNodes(newNDK, initialWOT);
        await buildWebOfTrustFromCoreNodes(newNDK, initialWOT);
      } catch (err) {
        console.error('Error connecting to Nostr relays:', err);
        setIsLoading(false);
      }
    };

    initNDK();

    // Cleanup
    return () => {
      window.removeEventListener('nlAuth', handleNostrLogin);
      if (ndk) {
        console.log('Disconnecting from Nostr relays...');
        // Close all active connections when component unmounts
        try {
          // Manually close any relays that might be connected
          ndk.pool?.relays.forEach(relay => {
            try {
              relay.disconnect();
            } catch (e) {
              console.error('Error disconnecting relay:', e);
            }
          });
        } catch (e) {
          console.error('Error during NDK cleanup:', e);
        }
      }
    };
  }, []);

  const fetchProfilesForCoreNodes = async (ndk: NDK, initialWOT: WebOfTrust) => {
    // Fetch profiles for core nodes
    const filter: NDKFilter = {
      kinds: [0], // Profile metadata
      authors: corePubkeys
    };

    const subscription = ndk.subscribe(filter);

    subscription.on('event', (event: NDKEvent) => {
      try {
        const profile = JSON.parse(event.content);
        const pubkey = event.pubkey;

        const node = initialWOT.nodes.get(pubkey);
        if (node) {
          node.profile = {
            id: pubkey,
            name: profile.name,
            picture: profile.picture,
            about: profile.about,
            nip05: profile.nip05
          };
          initialWOT.nodes.set(pubkey, node);
          setWOT({ ...initialWOT });

          // Cache the profile
          CacheService.cacheProfile(pubkey, node.profile);
        }
      } catch (e) {
        console.error('Error parsing profile:', e);
      }
    });

    // Wait a bit for initial data
    await new Promise(resolve => setTimeout(resolve, 3000));
    subscription.stop();
  };

  const buildWebOfTrustFromCoreNodes = async (ndk: NDK, initialWOT: WebOfTrust) => {
    // For each core node, get its follows (kind 3 events)
    setIsLoading(true);

    // Collect first-degree follows from all core nodes
    const firstDegreeFollows = new Set<string>();
    const followsSubscriptions: NDKSubscription[] = [];

    console.log('⚙️ Building Web of Trust from core nodes:', corePubkeys.length);

    for (const corePubkey of corePubkeys) {
      const filter: NDKFilter = {
        kinds: [3], // Follows
        authors: [corePubkey]
      };

      console.log(`🔍 Fetching follows for core node: ${corePubkey.slice(0, 8)}...`);

      const subscription = ndk.subscribe(filter);
      followsSubscriptions.push(subscription);

      subscription.on('event', (event: NDKEvent) => {
        try {
          // Extract pubkeys from kind 3 event
          const tags = event.tags;
          console.log(`📊 Found ${tags.length} potential connections for ${corePubkey.slice(0, 8)}...`);

          for (const tag of tags) {
            if (tag[0] === 'p') {
              const followedPubkey = tag[1];
              firstDegreeFollows.add(followedPubkey);

              // Add to graph
              if (!initialWOT.nodes.has(followedPubkey)) {
                initialWOT.nodes.set(followedPubkey, {
                  id: followedPubkey,
                  profile: { id: followedPubkey },
                  trustScore: 25, // First degree follows start with lower trust
                  isCoreNode: false
                });
              }

              // Add edge
              initialWOT.edges.push({
                source: corePubkey,
                target: followedPubkey,
                type: 'follows'
              });

              setWOT({ ...initialWOT });
            }
          }
        } catch (e) {
          console.error('Error processing follows:', e);
        }
      });
    }

    // Wait for initial data
    await new Promise(resolve => setTimeout(resolve, 5000));

    console.log(`🔄 Finished loading initial follows - found ${firstDegreeFollows.size} first-degree connections`);

    // Close subscriptions
    for (const sub of followsSubscriptions) {
      sub.stop();
    }

    // Now get profiles for all first-degree follows
    if (firstDegreeFollows.size > 0) {
      const followsArray = Array.from(firstDegreeFollows);
      console.log(`📷 Loading profile data for ${followsArray.length} follows`);

      // Break up large arrays into batches of 50 to avoid overwhelming relays
      const batchSize = 50;
      for (let i = 0; i < followsArray.length; i += batchSize) {
        const batch = followsArray.slice(i, i + batchSize);
        console.log(`🔁 Loading profiles batch ${i / batchSize + 1} (${batch.length} profiles)`);

        const profileFilter: NDKFilter = {
          kinds: [0],  // Profile metadata
          authors: batch
        };

        const profilesSubscription = ndk.subscribe(profileFilter);

        profilesSubscription.on('event', (event: NDKEvent) => {
          try {
            const profile = JSON.parse(event.content);
            const pubkey = event.pubkey;

            // Log successful profile retrieval
            console.log(`✅ Got profile for ${pubkey.slice(0, 8)}... - Name: ${profile.name || 'unnamed'}`);

            const node = initialWOT.nodes.get(pubkey);
            if (node) {
              node.profile = {
                id: pubkey,
                name: profile.name,
                picture: profile.picture,
                about: profile.about,
                nip05: profile.nip05
              };
              initialWOT.nodes.set(pubkey, node);
              setWOT({ ...initialWOT });

              // Cache the profile
              CacheService.cacheProfile(pubkey, node.profile);
            }
          } catch (e) {
            console.error('Error parsing profile:', e);
          }
        });

        // Wait before starting next batch
        await new Promise(resolve => setTimeout(resolve, 3000));
        profilesSubscription.stop();
      }

      // Also check connections between first-degree follows (mutual follows)
      const checkMutualFollowsFilter: NDKFilter = {
        kinds: [3],  // Follows
        authors: followsArray.slice(0, 100) // Limit to first 100 to avoid overwhelming relays
      };

      console.log('🔄 Checking mutual follows to build connections');

      const mutualFollowsSub = ndk.subscribe(checkMutualFollowsFilter);

      mutualFollowsSub.on('event', (event: NDKEvent) => {
        try {
          const sourceId = event.pubkey;

          // Extract follows
          const tags = event.tags;
          for (const tag of tags) {
            if (tag[0] === 'p') {
              const targetId = tag[1];

              // Only add if both source and target are in our graph
              if (initialWOT.nodes.has(sourceId) && initialWOT.nodes.has(targetId)) {
                // Check if we already have this edge
                const existingEdge = initialWOT.edges.find(
                  edge => edge.source === sourceId && edge.target === targetId
                );

                if (!existingEdge) {
                  initialWOT.edges.push({
                    source: sourceId,
                    target: targetId,
                    type: 'follows'
                  });

                  // Check for mutual follows
                  const reverseEdge = initialWOT.edges.find(
                    edge => edge.source === targetId && edge.target === sourceId
                  );

                  if (reverseEdge) {
                    // Update to mutual
                    reverseEdge.type = 'mutual';
                  }

                  setWOT({ ...initialWOT });
                }
              }
            }
          }
        } catch (e) {
          console.error('Error processing mutual follows:', e);
        }
      });

      // Wait for mutual follows data
      await new Promise(resolve => setTimeout(resolve, 5000));
      mutualFollowsSub.stop();
    }

    // Calculate trust scores based on connections
    calculateTrustScores(initialWOT);
    console.log('🎯 WOT building complete with', initialWOT.nodes.size, 'nodes and', initialWOT.edges.length, 'connections');

    setIsLoading(false);
  };

  const calculateTrustScores = (wot: WebOfTrust) => {
    // A simple algorithm: 
    // - Core nodes have 100 trust
    // - Others get 25 per core node that follows them
    wot.nodes.forEach((node, pubkey) => {
      if (node.isCoreNode) return; // Skip core nodes

      let score = 0;
      const followersFromCore = corePubkeys.filter(corePubkey =>
        wot.edges.some(edge =>
          edge.source === corePubkey &&
          edge.target === pubkey
        )
      );

      score = followersFromCore.length * 25;
      node.trustScore = Math.min(score, 100); // Cap at 100
    });
  };

  const getTrustedProfiles = (minTrustScore = 50): Profile[] => {
    const profiles: Profile[] = [];

    wot.nodes.forEach(node => {
      if (node.trustScore >= minTrustScore) {
        profiles.push(node.profile);
      }
    });

    return profiles;
  };

  // Authentication functions
  const login = async (): Promise<void> => {
    // This is handled by nostr-login now
    if (typeof window !== 'undefined' && window.nostr) {
      try {
        const pubkey = await window.nostr.getPublicKey();
        if (pubkey) {
          setIsAuthenticated(true);
          setCurrentUser(pubkey);
        }
      } catch (err) {
        console.error('Error during login:', err);
      }
    }
  };

  const logout = (): void => {
    if (typeof window !== 'undefined') {
      // Try to call nostr-login logout
      try {
        // @ts-ignore - TypeScript doesn't know about nostr-login's logout function
        const nostrLogin = window.nostrLogin || (window as any).nostrLogin;
        if (nostrLogin && typeof nostrLogin.logout === 'function') {
          nostrLogin.logout();
        }
      } catch (e) {
        console.error('Error logging out with nostr-login:', e);
      }
    }

    setIsAuthenticated(false);
    setCurrentUser(null);
  };

  return (
    <NostrContext.Provider value={{
      ndk,
      wot,
      isLoading,
      corePubkeys,
      getTrustedProfiles,
      isAuthenticated,
      login,
      logout,
      currentUser
    }}>
      {children}
    </NostrContext.Provider>
  );
}; 