import { useState, useEffect, useCallback } from 'react';
import { useNostr } from '../context/NostrContext';
import { CacheService } from '../services/CacheService';
import { GraphNode, GraphEdge, WebOfTrust } from '../types';

interface UseSocialGraphReturn {
  nodes: GraphNode[];
  edges: GraphEdge[];
  isLoading: boolean;
  filterByTrustScore: (minScore: number) => void;
  highlightConnections: (nodeId: string | null) => void;
  resetHighlights: () => void;
}

export const useSocialGraph = (): UseSocialGraphReturn => {
  const { wot, isLoading: isWotLoading } = useNostr();
  const [filteredNodes, setFilteredNodes] = useState<GraphNode[]>([]);
  const [filteredEdges, setFilteredEdges] = useState<GraphEdge[]>([]);
  const [minTrustScore, setMinTrustScore] = useState(0);
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Process the WOT data into a format that can be displayed
  const processWotData = useCallback(() => {
    if (isWotLoading) {
      setIsLoading(true);
      return;
    }

    // Convert nodes Map to array
    const nodesArray = Array.from(wot.nodes.values()) as GraphNode[];
    
    // Apply trust score filter if set
    const filteredNodesArray = nodesArray.filter(
      (node: GraphNode) => node.trustScore >= minTrustScore
    );
    
    // Filter edges to only include connections between visible nodes
    const visibleNodeIds = new Set(filteredNodesArray.map((node: GraphNode) => node.id));
    const filteredEdgesArray = wot.edges.filter(
      (edge: GraphEdge) => visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)
    );
    
    // Apply highlighting if a node is selected
    if (highlightedNodeId) {
      // Find all edges connected to the highlighted node
      const connectedEdges = filteredEdgesArray.filter(
        (edge: GraphEdge) => edge.source === highlightedNodeId || edge.target === highlightedNodeId
      );
      
      // Get the IDs of all connected nodes
      const connectedNodeIds = new Set<string>();
      connectedNodeIds.add(highlightedNodeId);
      
      connectedEdges.forEach((edge: GraphEdge) => {
        connectedNodeIds.add(edge.source);
        connectedNodeIds.add(edge.target);
      });
      
      // Update the nodes with highlighted state
      const highlightedNodes = filteredNodesArray.map((node: GraphNode) => ({
        ...node,
        highlighted: connectedNodeIds.has(node.id)
      }));
      
      setFilteredNodes(highlightedNodes);
      setFilteredEdges(connectedEdges);
    } else {
      // No highlighting, just use filtered nodes and edges
      setFilteredNodes(filteredNodesArray);
      setFilteredEdges(filteredEdgesArray);
    }
    
    // Cache the processed graph data
    CacheService.GraphCache.cacheGraph({
      nodes: new Map(filteredNodesArray.map((node: GraphNode) => [node.id, node])),
      edges: filteredEdgesArray
    });
    
    setIsLoading(false);
  }, [wot, isWotLoading, minTrustScore, highlightedNodeId]);

  // Apply initial processing when WOT data changes
  useEffect(() => {
    processWotData();
  }, [processWotData]);

  // Filter nodes by trust score
  const filterByTrustScore = useCallback((score: number) => {
    setMinTrustScore(score);
  }, []);

  // Highlight connections for a specific node
  const highlightConnections = useCallback((nodeId: string | null) => {
    setHighlightedNodeId(nodeId);
  }, []);

  // Reset highlights
  const resetHighlights = useCallback(() => {
    setHighlightedNodeId(null);
  }, []);

  return {
    nodes: filteredNodes,
    edges: filteredEdges,
    isLoading,
    filterByTrustScore,
    highlightConnections,
    resetHighlights
  };
}; 