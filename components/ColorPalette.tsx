import React from 'react';
import { BRAND_COLORS } from './brandColors';

export const ColorPalette = () => {
  const colorGroups = {
    'Primary Colors': ['bitcoinOrange', 'deepBlue', 'forestGreen'],
    'Ocean Theme': ['blueGreen', 'deepOceanBlue', 'tropicalWater'],
    'Warm Colors': ['darkOrange', 'lightOrange', 'lightSand'],
    'Grayscale': ['darkGray', 'mediumGray', 'lightGray', 'paperWhite'],
    'Status Colors': ['error', 'success']
  };

  return (
    <div className="p-6 space-y-8">
      {Object.entries(colorGroups).map(([groupName, colorKeys]) => (
        <div key={groupName} className="space-y-2">
          <h3 className="text-lg font-semibold">{groupName}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {colorKeys.map(key => {
              const color = BRAND_COLORS[key as keyof typeof BRAND_COLORS];
              const rgb = color.match(/\d+/g);
              return (
                <div key={key} className="flex items-center space-x-4 p-4 border rounded">
                  <div 
                    className="w-16 h-16 rounded shadow-inner" 
                    style={{ 
                      backgroundColor: color,
                      border: '1px solid #000'
                    }} 
                  />
                  <div>
                    <div className="font-medium">{key}</div>
                    <div className="text-sm opacity-75">{color}</div>
                    <div className="text-xs opacity-60">
                      RGB({rgb?.join(', ')})
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}; 