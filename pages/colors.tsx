import React from 'react';
import { ColorPalette } from '../components/ColorPalette';

export default function Colors() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Brand Color Palette</h1>
      <ColorPalette />
    </div>
  );
} 