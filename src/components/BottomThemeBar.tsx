import React from 'react';
import { Palette, Brush } from 'lucide-react';
import { useApp } from '../context/AppContext';

const backgroundOptions = [
  { name: 'Deep Ocean Blue', value: 'deepoceanblue', color: '#004D66' },
  { name: 'Steel Blue', value: 'steelblue', color: '#4682B4' },
  { name: 'Cadet Blue', value: 'cadetblue', color: '#5F9EA0' },
  { name: 'Dark Midnight Blue', value: 'darkmidnightblue', color: '#003366' },
  { name: 'Charcoal Blue', value: 'charcoalblue', color: '#2E4053' },
  { name: 'Deep Purple', value: 'deeppurple', color: '#4A235A' },
  { name: 'Rich Purple', value: 'richpurple', color: '#6C3483' },
  { name: 'Forest Green', value: 'forestgreen', color: '#145A32' },
  { name: 'Dark Slate Gray', value: 'darkslategray', color: '#4D5656' },
  { name: 'Deep Maroon', value: 'deepmaroon', color: '#78281F' },
];

const accentOptions = [
  { name: 'Coral Orange', value: 'coralorange', color: '#FF7F50' },
  { name: 'Bright Orange', value: 'brightorange', color: '#FF6B35' },
  { name: 'Electric Blue', value: 'electricblue', color: '#007FFF' },
  { name: 'Lime Green', value: 'limegreen', color: '#32CD32' },
  { name: 'Deep Pink', value: 'deeppink', color: '#FF1493' },
  { name: 'Golden Yellow', value: 'goldenyellow', color: '#FFD700' },
  { name: 'Royal Purple', value: 'royalpurple', color: '#7851A9' },
  { name: 'Crimson Red', value: 'crimsonred', color: '#DC143C' },
  { name: 'Ocean Blue', value: 'oceanblue', color: '#006994' },
  { name: 'Emerald Green', value: 'emeraldgreen', color: '#50C878' },
];

export const BottomThemeBar: React.FC = () => {
  const { selectedBackgroundColor, setSelectedBackgroundColor, selectedAccentColor, setSelectedAccentColor } = useApp();

  const handleBackgroundSelect = (colorValue: string) => {
    setSelectedBackgroundColor(colorValue);
  };

  const handleAccentSelect = (colorValue: string) => {
    setSelectedAccentColor(colorValue);
    // Update CSS custom properties for accent colors
    const root = document.documentElement;
    const selectedColor = accentOptions.find(c => c.value === colorValue);
    if (selectedColor) {
      // Convert hex to RGB for CSS custom properties
      const hex = selectedColor.color;
      const r = parseInt(hex.slice(1, 3), 16);
      const g = parseInt(hex.slice(3, 5), 16);
      const b = parseInt(hex.slice(5, 7), 16);
      
      root.style.setProperty('--color-primary-500', `${r} ${g} ${b}`);
      root.style.setProperty('--color-primary-600', `${Math.max(0, r-20)} ${Math.max(0, g-20)} ${Math.max(0, b-20)}`);
      root.style.setProperty('--color-primary-400', `${Math.min(255, r+20)} ${Math.min(255, g+20)} ${Math.min(255, b+20)}`);
      root.style.setProperty('--color-primary-100', `${Math.min(255, r+100)} ${Math.min(255, g+100)} ${Math.min(255, b+100)}`);
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-header-bg border-t-2 border-primary-500 shadow-2xl z-30">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Background Color Section */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Palette className="w-6 h-6 text-white" />
              <span className="text-lg font-bold text-white">Page BG:</span>
            </div>
            <div className="flex gap-3">
              {backgroundOptions.slice(0, 5).map((color) => (
                <button
                  key={color.value}
                  onClick={() => handleBackgroundSelect(color.value)}
                  className={`w-12 h-12 rounded-full border-3 transition-all hover:scale-115 ${
                    selectedBackgroundColor === color.value
                      ? 'border-white ring-2 ring-white/50 shadow-xl'
                      : 'border-gray-400 hover:border-white'
                  }`}
                  style={{ backgroundColor: color.color }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Accent Color Section */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Brush className="w-6 h-6 text-white" />
              <span className="text-lg font-bold text-white">Accent:</span>
            </div>
            <div className="flex gap-3">
              {accentOptions.slice(0, 5).map((color) => (
                <button
                  key={color.value}
                  onClick={() => handleAccentSelect(color.value)}
                  className={`w-12 h-12 rounded-full border-3 transition-all hover:scale-115 ${
                    selectedAccentColor === color.value
                      ? 'border-white ring-2 ring-white/50 shadow-xl'
                      : 'border-gray-400 hover:border-white'
                  }`}
                  style={{ backgroundColor: color.color }}
                  title={color.name}
                />
              ))}
            </div>
          </div>

          {/* Credit Text with Custom Font */}
          <div 
            className="text-white font-normal text-xl tracking-wider font-higher-jump" 
            style={{ 
              textShadow: '2px 2px 4px rgba(0,0,0,0.7)'
            }}
          >
            THIS WEBSITE IS MADE BY RAFIJUR RAHMAN (ZUBORAJ)
          </div>
        </div>
      </div>
    </div>
  );
};