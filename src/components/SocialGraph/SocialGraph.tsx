import React, { useRef, useEffect, useState } from 'react';
import { useNostr } from '../../context/NostrContext';
import ForceGraph2D from 'react-force-graph-2d';
import GraphControls from './GraphControls';
import GraphRenderer from './GraphRenderer';
import NodeTooltip from './NodeTooltip';
import { CacheService } from '../../services/CacheService';
import { Profile } from '../../types';

interface GraphNode {
  id: string;
  name?: string;
  picture?: string;
  color?: string;
  size?: number;
  isCoreNode?: boolean;
}

interface GraphLink {
  source: string;
  target: string;
  type: string;
}

const SocialGraph: React.FC = () => {
  const { wot, isLoading, corePubkeys } = useNostr();
  const containerRef = useRef<HTMLDivElement>(null);
  const [graphData, setGraphData] = useState<{ nodes: GraphNode[], links: GraphLink[] }>({
    nodes: [],
    links: []
  });
  const [dimensions, setDimensions] = useState({ width: 300, height: 400 });
  const [selectedNode, setSelectedNode] = React.useState<null | { id: string; profile: Profile }>(null);
  const [tooltipPosition, setTooltipPosition] = React.useState({ x: 0, y: 0 });

  // Update dimensions on container resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const { width, height } = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: Math.max(width, 300),
          height: Math.max(height, 400)
        });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  // Transform Web of Trust data into graph format
  useEffect(() => {
    if (isLoading) return;

    const nodes: GraphNode[] = [];
    const links: GraphLink[] = [];

    // Convert wot nodes to graph nodes
    wot.nodes.forEach((node, id) => {
      nodes.push({
        id,
        name: node.profile.name || id.slice(0, 8),
        picture: node.profile.picture,
        color: node.isCoreNode ? '#d946ef' : '#60a5fa',
        size: node.isCoreNode ? 10 : 5
      });
    });

    // Convert wot edges to graph links
    wot.edges.forEach(edge => {
      links.push({
        source: edge.source,
        target: edge.target,
        type: edge.type
      });
    });

    setGraphData({ nodes, links });
  }, [wot, isLoading]);

  const handleNodeClick = (node: any) => {
    if (node) {
      setSelectedNode({
        id: node.id,
        profile: node.profile
      });
    } else {
      setSelectedNode(null);
    }
  };

  const handleNodeHover = (node: any, prevNode: any) => {
    if (node) {
      // Show tooltip
      setTooltipPosition({
        x: node.x || 0,
        y: node.y || 0
      });
    }
  };

  // If loading, return loading indicator
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center bg-gray-100 rounded-lg p-6 h-96">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-purple-500 mb-4"></div>
        <p className="text-gray-600">Loading social graph...</p>
      </div>
    );
  }

  // If no data, display message
  if (graphData.nodes.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center bg-gray-100 rounded-lg p-6 h-96">
        <p className="text-gray-600 mb-4">No social graph data available</p>
        <p className="text-sm text-gray-500">This could be because the network connection failed or no data is available yet.</p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="h-96 bg-gray-100 rounded-lg">
      <ForceGraph2D
        graphData={graphData}
        width={dimensions.width}
        height={dimensions.height}
        nodeLabel={(node: any) => node.name || node.id}
        nodeColor={(node: any) => node.color}
        nodeVal={(node: any) => node.size}
        linkDirectionalArrowLength={3}
        linkDirectionalArrowRelPos={1}
        linkCurvature={0.25}
        cooldownTicks={100}
        nodeRelSize={6}
        nodeCanvasObject={(node: any, ctx, globalScale) => {
          // Draw node as circle
          const size = (node.size || 5) * (globalScale < 1 ? 1 : 1 / Math.sqrt(globalScale));
          ctx.beginPath();
          ctx.arc(node.x, node.y, size, 0, 2 * Math.PI);
          ctx.fillStyle = node.color || '#60a5fa';
          ctx.fill();

          if (node.isCoreNode) {
            ctx.strokeStyle = '#d946ef';
            ctx.lineWidth = 2;
            ctx.stroke();
          }

          // Draw node label if zoomed in
          if (globalScale > 1) {
            const label = node.name || node.id.slice(0, 8);
            ctx.font = '6px Sans-Serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = '#333';
            ctx.fillText(label, node.x, node.y + size + 6);
          }
        }}
      />

      {selectedNode && (
        <NodeTooltip
          profile={selectedNode.profile}
          position={tooltipPosition}
          onClose={() => {
            setSelectedNode(null);
          }}
        />
      )}
    </div>
  );
};

export default SocialGraph; 