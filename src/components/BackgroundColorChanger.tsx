import React from 'react';
import { Palette } from 'lucide-react';
import { useApp } from '../context/AppContext';

const backgroundOptions = [
  { name: 'Sky Blue', value: 'skyblue', color: '#ADD8E6' },
  { name: 'Light Steel Blue', value: 'lightsteelblue', color: '#B0C4DE' },
  { name: 'Powder Blue', value: 'powderblue', color: '#B0E0E6' },
  { name: 'Alice Blue', value: 'aliceblue', color: '#F0F8FF' },
  { name: 'Azure', value: 'azure', color: '#F0FFFF' },
  { name: 'Mint Cream', value: 'mintcream', color: '#F5FFFA' },
  { name: 'Lavender Blush', value: 'lavenderblush', color: '#FFF0F5' },
  { name: 'Sea Shell', value: 'seashell', color: '#FFF5EE' },
  { name: 'Light Goldenrod Yellow', value: 'lightgoldenrodyellow', color: '#FAFAD2' },
  { name: 'Pale Green', value: 'palegreen', color: '#98FB98' },
];

export const BackgroundColorChanger: React.FC = () => {
  const { selectedBackgroundColor, setSelectedBackgroundColor } = useApp();

  const handleColorSelect = (colorValue: string) => {
    setSelectedBackgroundColor(colorValue);
  };

  return (
    <div className="mb-6">
      <div className="bg-component rounded-lg p-6 border border-gray-600">
        <div className="flex items-center gap-3 mb-4">
          <Palette className="w-6 h-6 text-primary-500" />
          <h3 className="text-lg font-semibold text-component">Page Background Color</h3>
        </div>
        <div className="grid grid-cols-5 md:grid-cols-10 gap-3">
          {backgroundOptions.map((color) => (
            <button
              key={color.value}
              onClick={() => handleColorSelect(color.value)}
              className={`w-14 h-14 rounded-lg border-3 transition-all hover:scale-105 ${
                selectedBackgroundColor === color.value
                  ? 'border-primary-500 ring-2 ring-primary-500/50 shadow-lg'
                  : 'border-gray-400 hover:border-primary-400'
              }`}
              style={{ backgroundColor: color.color }}
              title={color.name}
            />
          ))}
        </div>
      </div>
    </div>
  );
};