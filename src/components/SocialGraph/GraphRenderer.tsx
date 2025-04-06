import React, { forwardRef, RefObject } from 'react';
import ForceGraph2D from 'react-force-graph-2d';

interface GraphRendererProps {
  graphData: {
    nodes: any[];
    links: any[];
  };
  onNodeClick: (node: any) => void;
  onNodeHover: (node: any, prevNode: any) => void;
}

// Since we don't have @types for this library, use any
type ForceGraphRef = any;

const GraphRenderer = forwardRef<ForceGraphRef, GraphRendererProps>(
  ({ graphData, onNodeClick, onNodeHover }, ref) => {
    // Create image cache for profile pictures
    const nodeImages = new Map<string, HTMLImageElement>();
    
    // Preload images for nodes
    React.useEffect(() => {
      graphData.nodes.forEach(node => {
        if (node.profile?.picture && !nodeImages.has(node.id)) {
          const img = new Image();
          img.src = node.profile.picture;
          img.onload = () => {
            nodeImages.set(node.id, img);
          };
          img.onerror = () => {
            // If loading fails, remove from cache so we don't try again
            nodeImages.delete(node.id);
          };
        }
      });
    }, [graphData]);
    
    return (
      <ForceGraph2D
        ref={ref as any}
        graphData={graphData}
        nodeLabel={(node: any) => `${node.name || 'Unknown'}\nTrust: ${node.val * 10}`}
        nodeRelSize={5}
        nodeCanvasObject={(node: any, ctx: CanvasRenderingContext2D, globalScale: number) => {
          const size = node.val;
          const nodeRadius = size;
          
          // Check if we have a profile image
          const profileImg = nodeImages.get(node.id);
          
          if (profileImg) {
            // Draw circular profile image
            ctx.save();
            ctx.beginPath();
            ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI, false);
            ctx.clip();
            
            // Draw the image
            try {
              ctx.drawImage(
                profileImg,
                node.x - nodeRadius,
                node.y - nodeRadius,
                nodeRadius * 2,
                nodeRadius * 2
              );
            } catch (e) {
              // Fallback if image drawing fails
              ctx.beginPath();
              ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI);
              ctx.fillStyle = node.color;
              ctx.fill();
            }
            
            // Restore context
            ctx.restore();
            
            // Draw border around profile image
            ctx.beginPath();
            ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI);
            ctx.strokeStyle = node.highlighted ? '#ffffff' : (node.isCoreNode ? '#ff6600' : '#666666');
            ctx.lineWidth = node.highlighted ? 2 : 1;
            ctx.stroke();
          } else {
            // No profile image, draw regular node
            ctx.beginPath();
            ctx.arc(node.x, node.y, nodeRadius, 0, 2 * Math.PI);
            ctx.fillStyle = node.color;
            ctx.fill();
            
            // Draw border for highlighted nodes
            if (node.highlighted) {
              ctx.strokeStyle = '#ffffff';
              ctx.lineWidth = 2;
              ctx.stroke();
            }
          }
          
          // Draw label if zoomed in enough
          if (globalScale >= 1.2) {
            const label = node.name || node.id.substring(0, 8);
            ctx.font = `${10/globalScale}px Sans-Serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = 'white';
            ctx.fillText(label, node.x, node.y + nodeRadius + 3);
          }
        }}
        linkWidth={(link: any) => link.type === 'mutual' ? 2 : 1}
        linkDirectionalArrowLength={3}
        linkColor={(link: any) => link.color}
        onNodeClick={onNodeClick}
        onNodeHover={onNodeHover}
        cooldownTicks={100}
      />
    );
  }
);

GraphRenderer.displayName = 'GraphRenderer';

export default GraphRenderer; 