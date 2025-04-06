import React, { useState } from 'react';

interface GraphControlsProps {
  onTrustScoreChange: (score: number) => void;
  onResetHighlights: () => void;
}

const GraphControls: React.FC<GraphControlsProps> = ({
  onTrustScoreChange,
  onResetHighlights
}) => {
  const [trustScore, setTrustScore] = useState(0);
  
  const handleTrustScoreChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newScore = parseInt(e.target.value);
    setTrustScore(newScore);
    onTrustScoreChange(newScore);
  };
  
  return (
    <div className="p-3 bg-gray-100 border-b flex flex-wrap gap-4 items-center">
      <div className="flex items-center">
        <label htmlFor="trust-slider" className="mr-2 text-sm font-medium">
          Min Trust Score: {trustScore}
        </label>
        <input
          id="trust-slider"
          type="range"
          min="0"
          max="100"
          step="25"
          value={trustScore}
          onChange={handleTrustScoreChange}
          className="w-32"
        />
      </div>
      
      <button
        onClick={onResetHighlights}
        className="px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors"
      >
        Reset View
      </button>
    </div>
  );
};

export default GraphControls; 