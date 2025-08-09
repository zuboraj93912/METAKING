import React from 'react';
import { Settings, Download, Trash2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { generateMetadataForPlatform, exportPlatformCSV } from '../utils/metadataGenerator';

export const GlobalActions: React.FC = () => {
  const { 
    files, 
    settings, 
    clearFiles, 
    progress, 
    setProgress, 
    addToast, 
    updateFile,
    getNextWorkingApiKey,
    markApiKeyAsFailed
  } = useApp();

  const handleGenerateAll = async () => {
    if (!settings.apiKey && settings.apiKeys.length === 0) {
      addToast('error', 'Please add at least one Gemini API key first.');
      return;
    }

    if (files.length === 0) {
      addToast('info', 'No files to process.');
      return;
    }

    setProgress(0, files.length);
    addToast('info', `Starting metadata generation for ${files.length} files...`);

    try {
      await generateMetadataForPlatform(
        files, 
        settings, 
        setProgress, 
        addToast, 
        updateFile,
        getNextWorkingApiKey,
        markApiKeyAsFailed
      );
      addToast('success', 'Metadata generation completed!');
    } catch (error) {
      addToast('error', 'Failed to generate metadata. Please try again.');
    }
  };

  const handleExportPlatform = () => {
    if (files.length === 0) {
      addToast('info', 'No files to export.');
      return;
    }

    try {
      exportPlatformCSV(files, settings.selectedPlatform);
      addToast('success', `${settings.selectedPlatform} CSV exported successfully!`);
    } catch (error) {
      addToast('error', 'Failed to export CSV file.');
    }
  };

  const handleClearAll = () => {
    clearFiles();
    addToast('info', 'All files cleared.');
  };

  return (
    <div className="mb-6">
      <div className="bg-component rounded-xl shadow-lg border border-gray-200 p-8 text-center">
        <div className="flex flex-wrap gap-6 mb-8 justify-center">
          <button
            onClick={handleGenerateAll}
            disabled={files.length === 0 || (settings.apiKeys.length === 0 && !settings.apiKey)}
            className="flex items-center gap-4 px-8 py-4 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-400 text-white rounded-xl transition-colors font-bold text-xl shadow-xl"
          >
            <Settings size={24} />
            Generate Metadata for {settings.selectedPlatform}
          </button>

          <button
            onClick={handleExportPlatform}
            disabled={files.length === 0}
            className="flex items-center gap-4 px-8 py-4 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-xl transition-colors font-bold text-xl shadow-xl"
          >
            <Download size={24} />
            Export CSV for {settings.selectedPlatform}
          </button>

          <button
            onClick={handleClearAll}
            disabled={files.length === 0}
            className="flex items-center gap-4 px-8 py-4 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white rounded-xl transition-colors font-bold text-xl shadow-xl"
          >
            <Trash2 size={24} />
            Clear All Uploads
          </button>
        </div>

        {/* Progress Indicator */}
        {progress.total > 0 && (
          <div className="space-y-4">
            <div className="flex items-center justify-between text-lg">
              <span className="text-component-text font-bold">
                {progress.current}/{progress.total} files processed for {settings.selectedPlatform}
              </span>
              <span className="text-gray-500 font-bold">
                {Math.round((progress.current / progress.total) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className="bg-primary-500 h-4 rounded-full transition-all duration-300"
                style={{ width: `${(progress.current / progress.total) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};