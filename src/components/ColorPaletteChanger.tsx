import React from 'react';
import { Check } from 'lucide-react';
import { useApp } from '../context/AppContext';

interface ColorPaletteChangerProps {
  onClose: () => void;
}

const colorOptions = [
  { name: 'Sky Blue', value: 'skyblue', color: '#0ea5e9' },
  { name: 'Teal', value: 'teal', color: '#14b8a6' },
  { name: 'Green', value: 'green', color: '#22c55e' },
  { name: 'Purple', value: 'purple', color: '#8b5cf6' },
  { name: 'Pink', value: 'pink', color: '#ec4899' },
  { name: 'Red', value: 'red', color: '#ef4444' },
  { name: 'Orange', value: 'orange', color: '#f97316' },
  { name: 'Yellow', value: 'yellow', color: '#eab308' },
  { name: 'Indigo', value: 'indigo', color: '#6366f1' },
  { name: 'Slate', value: 'slate', color: '#64748b' },
];

export const ColorPaletteChanger: React.FC<ColorPaletteChangerProps> = ({ onClose }) => {
  const { selectedColor, setSelectedColor } = useApp();

  const handleColorSelect = (colorValue: string) => {
    setSelectedColor(colorValue);
    onClose();
  };

  return (
    <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-4 min-w-[280px]">
      <h3 className="text-white font-medium mb-3">Choose Color Theme</h3>
      <div className="grid grid-cols-5 gap-2">
        {colorOptions.map((color) => (
          <button
            key={color.value}
            onClick={() => handleColorSelect(color.value)}
            className="relative w-12 h-12 rounded-lg border-2 border-gray-600 hover:border-gray-400 transition-colors group"
            style={{ backgroundColor: color.color }}
            title={color.name}
          >
            {selectedColor === color.value && (
              <Check className="w-6 h-6 text-white absolute inset-0 m-auto drop-shadow-lg" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
};