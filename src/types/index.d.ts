// Import global declarations
/// <reference path="./global.d.ts" />

// Import types from index.ts
export * from './index';

// Re-export important interfaces here for easier access
export type ProfileId = string;

export interface Profile {
  id: ProfileId;
  name?: string;
  picture?: string;
  about?: string;
  nip05?: string;
}

export interface GraphNode {
  id: string;
  profile: Profile;
  trustScore: number;
  isCoreNode: boolean;
  highlighted?: boolean;
}

export interface GraphEdge {
  source: string;
  target: string;
  type: 'follows' | 'mutual';
}

export interface WebOfTrust {
  nodes: Map<string, GraphNode>;
  edges: GraphEdge[];
}

export interface Note {
  id: string;
  pubkey: string;
  content: string;
  created_at: number;
  tags: string[][];
}

export interface ImageNote {
  id: string;
  imageUrl: string;
  pubkey: string;
} 