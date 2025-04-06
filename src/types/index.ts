export type ProfileId = string; // npub

export interface Profile {
  id: ProfileId;
  name?: string;
  picture?: string;
  about?: string;
  nip05?: string;
  // other profile data
}

export interface GraphNode {
  id: ProfileId;
  profile: Profile;
  trustScore: number;  // calculated based on connections to core npubs
  isCoreNode: boolean;
  highlighted?: boolean; // For graph visualization
}

export interface GraphEdge {
  source: ProfileId;
  target: ProfileId;
  type: 'follows' | 'followedBy' | 'mutual';
}

export interface WebOfTrust {
  nodes: Map<ProfileId, GraphNode>;
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