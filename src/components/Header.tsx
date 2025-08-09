import React, { useState } from 'react';
import { Key, FileText, LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { ApiSecretsModal } from './modals/ApiSecretsModal';

interface HeaderProps {
  onOpenApiModal: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenApiModal }) => {
  const { user, signOut } = useAuth();
  const { addToast, apiKeys } = useApp();
  const [showApiSecretsModal, setShowApiSecretsModal] = useState(false);

  const handleDownloadGuide = () => {
    const guideContent = `
----------------------------------------------------
METAKING - JPG/PNG Metadata Generator Guide
----------------------------------------------------

This guide explains how to use METAKING to generate metadata for your JPG and PNG image files for microstock platforms.

**Supported File Types:**
*   JPG/JPEG images
*   PNG images

**Steps:**

1.  **Upload JPG/PNG Images:**
    *   Upload your JPG or PNG image files into METAKING.
    *   The system now only accepts these image formats for optimal AI visual analysis.

2.  **Select Target Platform & Customize Metadata:**
    *   Use the "ACTIVE PLATFORM" selector (Adobe Stock, Shutterstock, or Freepik).
    *   Adjust the "Metadata Length Constraints" sliders as needed. The sliders control the Min/Max words for Title (default 8-15), Min/Max count for Keywords (default 40-45), and Min/Max words for Description (default 10-20). All sliders have an adjustable range of 5 to 50.

3.  **Generate Metadata:**
    *   Click the "Generate Metadata for [SelectedPlatform]" button.
    *   Wait for the AI to analyze your images and generate metadata.

4.  **Export CSV for Selected Platform:**
    *   Click the "Export CSV for [SelectedPlatform]" button.
    *   A CSV file specific to that platform will be downloaded.

5.  **Review and Use:**
    *   Open the downloaded CSV file to review the generated metadata.
    *   Use this metadata when uploading your images to the respective microstock platforms.

**Important Notes:**
*   The AI analyzes the visual content of your JPG/PNG images to generate relevant metadata.
*   Always review AI-generated metadata for accuracy and relevance.
*   The system supports multiple API keys for redundancy - if one fails, it automatically switches to backup keys.

**API Key Management:**
*   You can add multiple Gemini API keys for backup purposes.
*   If one API key fails or reaches its limit, the system automatically switches to the next available key.
*   Use the "API Keys" button in the header to manage your keys.

----------------------------------------------------
This website is made by RAFIJUR RAHMAN (ZUBORAJ)
----------------------------------------------------
    `;

    const blob = new Blob([guideContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'METAKING_JPG_PNG_Metadata_Guide.txt';
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSignOut = () => {
    signOut();
    addToast('success', 'Successfully signed out');
  };

  return (
    <>
      {/* Full-width banner header */}
      <div className="w-full bg-header-bg relative overflow-hidden">
        <img 
          src="/MATAKING.png" 
          alt="METAKING by Rafijur Rahman Banner" 
          className="w-full h-32 object-contain bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900"
          onError={(e) => {
            // Fallback banner if image fails to load
            e.currentTarget.style.display = 'none';
            const fallback = e.currentTarget.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = 'flex';
          }}
        />
        <div className="hidden w-full h-32 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 items-center justify-center">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-2xl">M</span>
            </div>
            <h1 className="text-4xl font-bold text-white">METAKING</h1>
            <span className="text-xl text-blue-200">by Rafijur Rahman</span>
          </div>
        </div>
        
        {/* Top utility bar with buttons */}
        <div className="absolute top-4 right-4 flex gap-3">
          {user && (
            <div className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm text-white border border-white/20">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline font-medium">
                {user.firstName} {user.lastName}
              </span>
            </div>
          )}
          
          <button
            onClick={onOpenApiModal}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white transition-colors font-medium border border-white/20"
            title="Set your Gemini API Key"
          >
            <Key className="w-4 h-4" />
            <span className="hidden sm:inline">Set API Key</span>
          </button>

          <button
            onClick={() => setShowApiSecretsModal(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white transition-colors font-medium border border-white/20"
            title="Manage Multiple API Keys"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">API Keys ({apiKeys.length})</span>
          </button>
          
          <button
            onClick={handleDownloadGuide}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white transition-colors font-medium border border-white/20"
            title="Download usage guide for JPG/PNG metadata generation"
          >
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Usage Guide</span>
          </button>

          <button
            onClick={handleSignOut}
            className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-500/80 backdrop-blur-sm hover:bg-red-600/80 text-white transition-colors font-medium border border-red-400/20"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </div>

      {/* API Secrets Modal */}
      {showApiSecretsModal && (
        <ApiSecretsModal onClose={() => setShowApiSecretsModal(false)} />
      )}
    </>
  );
};

export default Header;