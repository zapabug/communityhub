import { useState, useEffect, useCallback } from 'react';
import NDK, { NDKEvent, NDKFilter, NDKSubscription } from '@nostr-dev-kit/ndk';
import { useNostr } from '../context/NostrContext';
import { CacheService } from '../services/CacheService';
import { Note, ImageNote, Profile } from '../types';

interface UseNostrFeedOptions {
  hashtag?: string;
  minTrustScore?: number;
  imagesOnly?: boolean;
  limit?: number;
}

interface UseNostrFeedReturn {
  notes: Note[];
  imageNotes: ImageNote[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export const useNostrFeed = (options: UseNostrFeedOptions = {}): UseNostrFeedReturn => {
  const { 
    hashtag, 
    minTrustScore,
    imagesOnly = false,
    limit = 50
  } = options;
  
  const { ndk, getTrustedProfiles, isLoading: isNostrLoading } = useNostr();
  const [notes, setNotes] = useState<Note[]>([]);
  const [imageNotes, setImageNotes] = useState<ImageNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<NDKSubscription | null>(null);
  const [isUnmounted, setIsUnmounted] = useState(false);
  const [timeoutId, setTimeoutId] = useState<number | null>(null);

  // Function to close any existing subscription
  const closeSubscription = useCallback(() => {
    if (subscription) {
      try {
        subscription.stop();
        console.log('Closed subscription successfully');
      } catch (e) {
        console.error('Error closing subscription:', e);
      }
      setSubscription(null);
    }
    
    // Clear any existing timeout
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
      setTimeoutId(null);
    }
  }, [subscription, timeoutId]);

  // Main function to load notes
  const loadNotes = useCallback(async () => {
    if (!ndk || isNostrLoading || isUnmounted) {
      return;
    }

    setIsLoading(true);
    setError(null);
    closeSubscription();

    try {
      // Get authors to filter by
      let authorFilter: string[] = [];
      
      // Only filter by trust score if minTrustScore is provided
      if (minTrustScore !== undefined) {
        const trustedProfiles = getTrustedProfiles(minTrustScore);
        authorFilter = trustedProfiles.map((profile: Profile) => profile.id);
        
        if (authorFilter.length === 0) {
          console.warn(`No trusted profiles found with minimum trust score: ${minTrustScore}`);
          // Continue without author filter instead of returning early
        }
      }

      // Check cache first
      let cachedNotes: Note[] = [];
      if (imagesOnly && hashtag) {
        // Pass author filter only if we have it
        const cachedImageNotes = CacheService.getImageNotesWithHashtag(
          hashtag, 
          authorFilter.length > 0 ? authorFilter : undefined
        );
        console.log(`Found ${cachedImageNotes.length} cached image notes with hashtag: ${hashtag}`);
        if (!isUnmounted) {
          setImageNotes(cachedImageNotes);
        }
        
        // Get full notes for these images
        cachedNotes = cachedImageNotes.map(img => {
          const note = CacheService.getNote(img.id);
          return note || {
            id: img.id,
            pubkey: img.pubkey,
            content: '',
            created_at: 0,
            tags: []
          };
        }).filter(note => note.content !== ''); // Filter out placeholder notes
      }

      if (cachedNotes.length > 0 && !isUnmounted) {
        console.log(`Using ${cachedNotes.length} cached notes`);
        setNotes(cachedNotes);
      }

      // Build filter for subscription
      const filter: NDKFilter = {
        kinds: [1], // Text notes
        limit
      };
      
      // Add author filter only if we have trusted profiles
      if (authorFilter.length > 0) {
        filter.authors = authorFilter;
      }

      // Add hashtag filter if specified
      if (hashtag) {
        filter['#t'] = [hashtag];
      }

      // Limit subscription duration to prevent memory leaks
      const maxSubscriptionTime = 20000; // 20 seconds max for subscriptions
      
      // Subscribe to events
      const newSubscription = ndk.subscribe(filter, { closeOnEose: true });
      
      // Set timeout to close the subscription after max time
      const newTimeoutId = window.setTimeout(() => {
        console.log(`Max subscription time reached (${maxSubscriptionTime}ms), closing subscription`);
        if (newSubscription) {
          try {
            newSubscription.stop();
            if (!isUnmounted) {
              setSubscription(null);
              setIsLoading(false);
            }
          } catch (e) {
            console.error('Error closing subscription on timeout:', e);
          }
        }
      }, maxSubscriptionTime);
      
      setTimeoutId(newTimeoutId);
      
      if (!isUnmounted) {
        setSubscription(newSubscription);
      }

      const processedNoteIds = new Set<string>(cachedNotes.map(note => note.id));
      const newNotes: Note[] = [...cachedNotes];
      const newImageNotes: ImageNote[] = [...imageNotes];

      newSubscription.on('event', (event: NDKEvent) => {
        if (isUnmounted) return;
        
        try {
          // Skip if we already have this note
          if (processedNoteIds.has(event.id)) return;
          processedNoteIds.add(event.id);

          console.log(`Processing event ${event.id.substring(0, 8)}...`);

          // Process the event
          const note: Note = {
            id: event.id,
            pubkey: event.pubkey,
            content: event.content,
            created_at: event.created_at || 0,
            tags: event.tags
          };

          // Cache the note
          CacheService.cacheNote(note);

          // If we only want images, check if note has an image
          if (imagesOnly) {
            const imageUrl = CacheService.getImageUrl(note.id);
            if (imageUrl) {
              console.log(`Found image URL: ${imageUrl.substring(0, 30)}...`);
              if (!isUnmounted) {
                setImageNotes(prev => {
                  // Avoid duplicates
                  if (prev.some(img => img.id === note.id)) return prev;
                  const newList = [...prev, { id: note.id, imageUrl, pubkey: note.pubkey }];
                  
                  // Sort only a subset of notes for performance
                  if (newList.length > 100) {
                    // If we have too many notes, just append without sorting
                    return newList;
                  }
                  
                  return newList.sort((a, b) => {
                    const noteA = newNotes.find(n => n.id === a.id);
                    const noteB = newNotes.find(n => n.id === b.id);
                    return (noteB?.created_at || 0) - (noteA?.created_at || 0);
                  });
                });
              }
              
              newNotes.push(note);
              if (!isUnmounted) {
                // Skip sorting for very large arrays
                if (newNotes.length < 100) {
                  setNotes([...newNotes].sort((a, b) => b.created_at - a.created_at));
                } else {
                  setNotes(prev => [...prev, note]);
                }
              }
            }
          } else {
            // Add to notes list (sorted by created_at)
            newNotes.push(note);
            if (!isUnmounted) {
              // Skip sorting for very large arrays
              if (newNotes.length < 100) {
                setNotes([...newNotes].sort((a, b) => b.created_at - a.created_at));
              } else {
                setNotes(prev => [...prev, note]);
              }
            }
          }
        } catch (e) {
          console.error('Error processing event:', e);
        }
      });

      // Set a shorter timeout to update loading state
      const loadingTimeoutId = window.setTimeout(() => {
        if (!isUnmounted) {
          console.log(`Feed loading timeout reached. Found ${newImageNotes.length} images.`);
          setIsLoading(false);
        }
      }, 5000);

      // Make sure we clear this timeout when unmounting
      return () => {
        clearTimeout(loadingTimeoutId);
      };
    } catch (err) {
      if (!isUnmounted) {
        setError('Error fetching notes: ' + (err instanceof Error ? err.message : String(err)));
        setIsLoading(false);
      }
    }
  }, [ndk, isNostrLoading, minTrustScore, hashtag, imagesOnly, limit, closeSubscription, getTrustedProfiles, imageNotes, isUnmounted, timeoutId]);

  // Load notes when dependencies change
  useEffect(() => {
    loadNotes();
    
    // Set unmounted flag and cleanup on component unmount
    return () => {
      setIsUnmounted(true);
      closeSubscription();
    };
  }, [loadNotes, closeSubscription]);

  // Function to manually refresh the feed
  const refresh = useCallback(async () => {
    if (!isUnmounted) {
      await loadNotes();
    }
  }, [loadNotes, isUnmounted]);

  return {
    notes,
    imageNotes,
    isLoading,
    error,
    refresh
  };
}; 