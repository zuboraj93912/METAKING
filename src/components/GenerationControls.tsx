import React from 'react';
import { Heart as Gears, FileText, Trash, Download } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../hooks/useToast';

export const GenerationControls: React.FC = () => {
  const { files, settings, updateSettings, clearFiles } = useApp();
  const { success, info } = useToast();

  const handleClearAll = () => {
    clearFiles();
    info('All files cleared.');
  };

  const handleExportCSV = () => {
    const resultsWithData = files.filter(f => f.result);
    
    if (resultsWithData.length === 0) {
      info('No results to export. Generate some content first.');
      return;
    }

    let csvContent = '';
    let filename = '';

    if (settings.mode === 'prompt') {
      csvContent = 'filename,prompt\n' + 
        resultsWithData.map(f => `"${f.name}","${f.result?.prompt || ''}"`).join('\n');
      filename = 'metaking_export_prompts.csv';
    } else {
      csvContent = 'filename,title,keywords\n' + 
        resultsWithData.map(f => 
          `"${f.name}","${f.result?.title || ''}","${f.result?.keywords?.join(', ') || ''}"`
        ).join('\n');
      filename = 'metaking_export_metadata.csv';
    }

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);

    success(`Exported ${resultsWithData.length} results to ${filename}`);
  };

  const handleGenerateAll = async () => {
    info('Bulk generation feature coming soon!');
  };

  if (files.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 mb-8 border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Generation Controls
      </h2>

      <div className="space-y-6">
        {/* Toggle Switches */}
        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.whiteBackground}
              onChange={(e) => updateSettings({ whiteBackground: e.target.checked })}
              className="sr-only"
            />
            <div className={`w-12 h-6 rounded-full transition-colors ${
              settings.whiteBackground ? 'bg-teal-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                settings.whiteBackground ? 'translate-x-6' : 'translate-x-0.5'
              } mt-0.5`} />
            </div>
            <span className="text-gray-900 dark:text-white">White Background Image</span>
          </label>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.cameraParameters}
              onChange={(e) => updateSettings({ cameraParameters: e.target.checked })}
              className="sr-only"
            />
            <div className={`w-12 h-6 rounded-full transition-colors ${
              settings.cameraParameters ? 'bg-teal-500' : 'bg-gray-300 dark:bg-gray-600'
            }`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow-sm transition-transform ${
                settings.cameraParameters ? 'translate-x-6' : 'translate-x-0.5'
              } mt-0.5`} />
            </div>
            <span className="text-gray-900 dark:text-white">Camera Parameters</span>
          </label>
        </div>

        {/* Mode Selector */}
        <div className="flex gap-2">
          <button
            onClick={() => updateSettings({ mode: 'prompt' })}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              settings.mode === 'prompt'
                ? 'bg-teal-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Prompt
          </button>
          <button
            onClick={() => updateSettings({ mode: 'metadata' })}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              settings.mode === 'metadata'
                ? 'bg-teal-500 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            }`}
          >
            Metadata
          </button>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleGenerateAll}
            className="flex items-center gap-2 px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg transition-colors"
          >
            <Gears size={16} />
            Generate All ({files.length})
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
          >
            <Download size={16} />
            Export {settings.mode === 'prompt' ? 'Prompts' : 'Metadata'} CSV
          </button>

          <button
            onClick={handleClearAll}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            <Trash size={16} />
            Clear All
          </button>
        </div>
      </div>
    </div>
  );
};