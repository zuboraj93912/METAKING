import React from 'react';
import { useApp } from '../context/AppContext';

export const PlatformSelector: React.FC = () => {
  const { settings, updateSettings } = useApp();

  const platforms = [
    { value: 'AdobeStock', label: 'Adobe Stock', icon: '🅰️' },
    { value: 'Freepik', label: 'Freepik', icon: '🎨' },
    { value: 'Shutterstock', label: 'Shutterstock', icon: '📸' },
  ] as const;

  return (
    <div className="mb-6">
      <div className="bg-component rounded-xl shadow-lg border border-gray-200">
        <div className="bg-accent-500 text-white px-6 py-4 rounded-t-xl font-bold text-xl">
          ACTIVE PLATFORM:
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {platforms.map((platform) => (
              <button
                key={platform.value}
                onClick={() => updateSettings({ selectedPlatform: platform.value })}
                className={`flex items-center gap-4 px-8 py-6 rounded-xl font-bold transition-all text-lg ${
                  settings.selectedPlatform === platform.value
                    ? 'bg-primary-500 text-white shadow-xl scale-105'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-102'
                }`}
              >
                <span className="text-3xl">{platform.icon}</span>
                <span className="text-xl font-bold">{platform.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};