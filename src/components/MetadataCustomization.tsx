import React, { useEffect } from 'react';
import { Info } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const MetadataCustomization: React.FC = () => {
  const { settings, updateSettings } = useApp();

  // Validation logic to ensure min <= max for each pair
  useEffect(() => {
    const { metadataSettings } = settings;
    let needsUpdate = false;
    const newSettings = { ...metadataSettings };

    // Title validation
    if (metadataSettings.minTitleWords > metadataSettings.maxTitleWords) {
      newSettings.maxTitleWords = metadataSettings.minTitleWords;
      needsUpdate = true;
    }

    // Keywords validation
    if (metadataSettings.minKeywords > metadataSettings.maxKeywords) {
      newSettings.maxKeywords = metadataSettings.minKeywords;
      needsUpdate = true;
    }

    // Description validation
    if (metadataSettings.minDescriptionWords > metadataSettings.maxDescriptionWords) {
      newSettings.maxDescriptionWords = metadataSettings.minDescriptionWords;
      needsUpdate = true;
    }

    if (needsUpdate) {
      updateSettings({ metadataSettings: newSettings });
    }
  }, [settings.metadataSettings, updateSettings]);

  const SingleSlider: React.FC<{
    label: string;
    field: keyof typeof settings.metadataSettings;
    min: number;
    max: number;
    tooltip: string;
  }> = ({ label, field, min, max, tooltip }) => {
    const value = settings.metadataSettings[field];
    
    const handleChange = (newValue: number) => {
      const newSettings = { ...settings.metadataSettings, [field]: newValue };
      
      // Auto-adjust corresponding min/max values
      if (field === 'minTitleWords' && newValue > settings.metadataSettings.maxTitleWords) {
        newSettings.maxTitleWords = newValue;
      } else if (field === 'maxTitleWords' && newValue < settings.metadataSettings.minTitleWords) {
        newSettings.minTitleWords = newValue;
      } else if (field === 'minKeywords' && newValue > settings.metadataSettings.maxKeywords) {
        newSettings.maxKeywords = newValue;
      } else if (field === 'maxKeywords' && newValue < settings.metadataSettings.minKeywords) {
        newSettings.minKeywords = newValue;
      } else if (field === 'minDescriptionWords' && newValue > settings.metadataSettings.maxDescriptionWords) {
        newSettings.maxDescriptionWords = newValue;
      } else if (field === 'maxDescriptionWords' && newValue < settings.metadataSettings.minDescriptionWords) {
        newSettings.minDescriptionWords = newValue;
      }
      
      updateSettings({ metadataSettings: newSettings });
    };
    
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <label className="text-lg font-bold text-component-text">{label}</label>
          <div className="group relative">
            <Info className="w-5 h-5 text-gray-500 cursor-help" />
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-4 py-2 bg-gray-700 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-lg">
              {tooltip}
            </div>
          </div>
          <span className="text-2xl text-primary-500 font-bold ml-auto" id={`${field}Display`}>
            {value}
          </span>
        </div>
        
        <div className="relative">
          <input
            type="range"
            min={min}
            max={max}
            value={value}
            onChange={(e) => handleChange(parseInt(e.target.value))}
            className="w-full h-4 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>
        
        <div className="flex justify-between text-sm text-gray-500 font-medium">
          <span>{min}</span>
          <span>{max}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="mb-6">
      <div className="bg-component rounded-xl shadow-xl border border-gray-200">
        <div className="bg-primary-500 text-white px-8 py-4 rounded-t-xl font-bold text-xl">
          Metadata Length Constraints (Global Min/Max: 5-50)
        </div>
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <SingleSlider
              label="Min Title Words"
              field="minTitleWords"
              min={5}
              max={50}
              tooltip="Minimum words for title (default: 8)."
            />
            <SingleSlider
              label="Max Title Words"
              field="maxTitleWords"
              min={5}
              max={50}
              tooltip="Maximum words for title (default: 15)."
            />
            <SingleSlider
              label="Min Keywords"
              field="minKeywords"
              min={5}
              max={50}
              tooltip="Minimum number of keywords (default: 40)."
            />
            <SingleSlider
              label="Max Keywords"
              field="maxKeywords"
              min={5}
              max={50}
              tooltip="Maximum number of keywords (default: 45)."
            />
            <SingleSlider
              label="Min Description Words"
              field="minDescriptionWords"
              min={5}
              max={50}
              tooltip="Minimum words for description (default: 10)."
            />
            <SingleSlider
              label="Max Description Words"
              field="maxDescriptionWords"
              min={5}
              max={50}
              tooltip="Maximum words for description (default: 20)."
            />
          </div>
        </div>
      </div>
    </div>
  );
};