import { Profile, ProfileId, Note } from '../types';

type CacheType = 'memory' | 'localStorage';

class ProfileCache {
  private static memoryCache: Map<ProfileId, Profile> = new Map();
  
  static cacheProfile(id: ProfileId, profile: Profile, useLocalStorage: boolean = true): void {
    this.memoryCache.set(id, profile);
    
    if (useLocalStorage) {
      const profiles = this.getStoredProfiles();
      profiles[id] = profile;
      localStorage.setItem('nostr_profiles', JSON.stringify(profiles));
    }
  }

  static getProfile(id: ProfileId, useLocalStorage: boolean = true): Profile | undefined {
    // First check memory cache
    const memoryProfile = this.memoryCache.get(id);
    if (memoryProfile) return memoryProfile;
    
    // Then check localStorage if enabled
    if (useLocalStorage) {
      const profiles = this.getStoredProfiles();
      return profiles[id];
    }
    
    return undefined;
  }

  private static getStoredProfiles(): Record<ProfileId, Profile> {
    const storedProfiles = localStorage.getItem('nostr_profiles');
    return storedProfiles ? JSON.parse(storedProfiles) : {};
  }
  
  static clear(): void {
    this.memoryCache.clear();
    localStorage.removeItem('nostr_profiles');
  }
}

class PostCache {
  private static memoryCache: Map<string, Note> = new Map();
  
  static cacheNote(note: Note, useLocalStorage: boolean = true): void {
    this.memoryCache.set(note.id, note);
    
    if (useLocalStorage) {
      const notes = this.getStoredNotes();
      notes[note.id] = note;
      localStorage.setItem('nostr_notes', JSON.stringify(notes));
    }
  }

  static getNote(id: string, useLocalStorage: boolean = true): Note | undefined {
    // First check memory cache
    const memoryNote = this.memoryCache.get(id);
    if (memoryNote) return memoryNote;
    
    // Then check localStorage if enabled
    if (useLocalStorage) {
      const notes = this.getStoredNotes();
      return notes[id];
    }
    
    return undefined;
  }

  private static getStoredNotes(): Record<string, Note> {
    const storedNotes = localStorage.getItem('nostr_notes');
    return storedNotes ? JSON.parse(storedNotes) : {};
  }
  
  static getNotesByAuthor(authorId: string): Note[] {
    const notes: Note[] = [];
    
    // Check memory cache first
    this.memoryCache.forEach(note => {
      if (note.pubkey === authorId) {
        notes.push(note);
      }
    });
    
    // Then check localStorage
    const storedNotes = this.getStoredNotes();
    Object.values(storedNotes).forEach(note => {
      if (note.pubkey === authorId && !notes.some(n => n.id === note.id)) {
        notes.push(note);
      }
    });
    
    return notes;
  }
  
  static clear(): void {
    this.memoryCache.clear();
    localStorage.removeItem('nostr_notes');
  }
}

class ImageCache {
  private static memoryCache: Map<string, string> = new Map(); // noteId to imageUrl
  
  static cacheImage(noteId: string, imageUrl: string, useLocalStorage: boolean = true): void {
    this.memoryCache.set(noteId, imageUrl);
    
    if (useLocalStorage) {
      const images = this.getStoredImages();
      images[noteId] = imageUrl;
      localStorage.setItem('nostr_images', JSON.stringify(images));
    }
  }

  static getImageUrl(noteId: string, useLocalStorage: boolean = true): string | undefined {
    // First check memory cache
    const memoryImage = this.memoryCache.get(noteId);
    if (memoryImage) return memoryImage;
    
    // Then check localStorage if enabled
    if (useLocalStorage) {
      const images = this.getStoredImages();
      return images[noteId];
    }
    
    return undefined;
  }

  private static getStoredImages(): Record<string, string> {
    const storedImages = localStorage.getItem('nostr_images');
    return storedImages ? JSON.parse(storedImages) : {};
  }
  
  static extractImageUrls(content: string): string[] {
    const urlRegex = /(https?:\/\/.*\.(?:png|jpg|jpeg|gif|webp))/gi;
    return content.match(urlRegex) || [];
  }
  
  static clear(): void {
    this.memoryCache.clear();
    localStorage.removeItem('nostr_images');
  }
}

class GraphCache {
  private static memoryCache: {
    nodes: Map<string, any>;
    edges: any[];
  } = {
    nodes: new Map(),
    edges: []
  };
  
  static cacheGraph(graph: any, useLocalStorage: boolean = true): void {
    // Store nodes and edges in memory
    this.memoryCache = {
      nodes: new Map(graph.nodes),
      edges: [...graph.edges]
    };
    
    if (useLocalStorage) {
      // For localStorage we need to convert Map to an object
      const serializedNodes: Record<string, any> = {};
      graph.nodes.forEach((value: any, key: string) => {
        serializedNodes[key] = value;
      });
      
      localStorage.setItem('nostr_graph_nodes', JSON.stringify(serializedNodes));
      localStorage.setItem('nostr_graph_edges', JSON.stringify(graph.edges));
    }
  }

  static getGraph(useLocalStorage: boolean = true): { nodes: Map<string, any>; edges: any[] } {
    // If we have memory cache, use it
    if (this.memoryCache.nodes.size > 0 || this.memoryCache.edges.length > 0) {
      return { ...this.memoryCache };
    }
    
    // Otherwise try localStorage
    if (useLocalStorage) {
      const nodesJson = localStorage.getItem('nostr_graph_nodes');
      const edgesJson = localStorage.getItem('nostr_graph_edges');
      
      if (nodesJson && edgesJson) {
        const nodes = new Map(Object.entries(JSON.parse(nodesJson)));
        const edges = JSON.parse(edgesJson);
        return { nodes, edges };
      }
    }
    
    // Return empty graph if nothing found
    return { nodes: new Map(), edges: [] };
  }
  
  static clear(): void {
    this.memoryCache = { nodes: new Map(), edges: [] };
    localStorage.removeItem('nostr_graph_nodes');
    localStorage.removeItem('nostr_graph_edges');
  }
}

export class CacheService {
  static ProfileCache = ProfileCache;
  static PostCache = PostCache;
  static ImageCache = ImageCache;
  static GraphCache = GraphCache;
  
  private static cacheType: CacheType = 'localStorage';

  static setCacheType(type: CacheType): void {
    this.cacheType = type;
  }

  // Convenience methods that delegate to subcaches
  static cacheProfile(id: ProfileId, profile: Profile): void {
    ProfileCache.cacheProfile(id, profile, this.cacheType === 'localStorage');
  }

  static getProfile(id: ProfileId): Profile | undefined {
    return ProfileCache.getProfile(id, this.cacheType === 'localStorage');
  }

  static cacheNote(note: Note): void {
    PostCache.cacheNote(note, this.cacheType === 'localStorage');
    
    // Extract image URLs from content
    const imgUrls = ImageCache.extractImageUrls(note.content);
    if (imgUrls.length > 0) {
      ImageCache.cacheImage(note.id, imgUrls[0], this.cacheType === 'localStorage');
    }
  }

  static getNote(id: string): Note | undefined {
    return PostCache.getNote(id, this.cacheType === 'localStorage');
  }

  static getImageUrl(noteId: string): string | undefined {
    return ImageCache.getImageUrl(noteId, this.cacheType === 'localStorage');
  }

  // Get notes with images and hashtag
  static getImageNotesWithHashtag(hashtag: string, authorIds?: string[]): { id: string, imageUrl: string, pubkey: string }[] {
    const results: { id: string, imageUrl: string, pubkey: string }[] = [];
    const useLocalStorage = this.cacheType === 'localStorage';
    
    // Get all notes from memory cache
    PostCache['memoryCache'].forEach((note, id) => {
      // Check if note has the hashtag
      const hasHashtag = note.tags.some(tag => 
        tag[0] === 't' && tag[1].toLowerCase() === hashtag.toLowerCase()
      );
      
      // Check if note has an image
      const imageUrl = ImageCache.getImageUrl(id, useLocalStorage);
      
      // Check if note author is in the allowed list (if provided)
      const authorMatch = !authorIds || authorIds.includes(note.pubkey);
      
      if (hasHashtag && imageUrl && authorMatch) {
        results.push({ id, imageUrl, pubkey: note.pubkey });
      }
    });
    
    // If using localStorage, also check stored notes
    if (useLocalStorage) {
      const storedNotes = PostCache['getStoredNotes']();
      
      Object.entries(storedNotes).forEach(([id, note]) => {
        // Skip notes we already found in memory
        if (results.some(result => result.id === id)) return;
        
        // Check if note has the hashtag
        const hasHashtag = note.tags.some(tag => 
          tag[0] === 't' && tag[1].toLowerCase() === hashtag.toLowerCase()
        );
        
        // Check if note has an image
        const imageUrl = ImageCache.getImageUrl(id, true);
        
        // Check if note author is in the allowed list (if provided)
        const authorMatch = !authorIds || authorIds.includes(note.pubkey);
        
        if (hasHashtag && imageUrl && authorMatch) {
          results.push({ id, imageUrl, pubkey: note.pubkey });
        }
      });
    }
    
    return results;
  }

  static clearAll(): void {
    ProfileCache.clear();
    PostCache.clear();
    ImageCache.clear();
    GraphCache.clear();
  }
} 