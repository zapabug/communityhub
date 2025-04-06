import React from 'react';
import { Profile } from '../../types';

interface NodeTooltipProps {
  profile: Profile;
  position: { x: number; y: number };
  onClose: () => void;
}

const NodeTooltip: React.FC<NodeTooltipProps> = ({ profile, position, onClose }) => {
  return (
    <div 
      className="absolute bg-white shadow-lg rounded-md p-3 z-10 max-w-xs w-60"
      style={{
        left: position.x + 10,
        top: position.y - 100,
        transform: 'translateY(-50%)'
      }}
    >
      <button 
        onClick={onClose}
        className="absolute top-1 right-1 text-gray-500 hover:text-gray-700"
      >
        ✕
      </button>
      
      <div className="flex items-center mb-2">
        {profile.picture ? (
          <img 
            src={profile.picture} 
            alt={profile.name || 'Profile'} 
            className="w-10 h-10 rounded-full mr-2 object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
            {(profile.name || profile.id.substring(0, 2)).substring(0, 1).toUpperCase()}
          </div>
        )}
        
        <div>
          <h3 className="font-medium">{profile.name || profile.id.substring(0, 8)}</h3>
          {profile.nip05 && <p className="text-xs text-gray-500">{profile.nip05}</p>}
        </div>
      </div>
      
      {profile.about && (
        <p className="text-sm text-gray-700 line-clamp-3">{profile.about}</p>
      )}
    </div>
  );
};

export default NodeTooltip; 