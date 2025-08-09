import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { AppProvider } from './context/AppContext';
import { AuthGuard } from './components/auth/AuthGuard';
import Header from './components/Header';
import { FileUploadArea } from './components/FileUploadArea';
import { PlatformSelector } from './components/PlatformSelector';
import { MetadataCustomization } from './components/MetadataCustomization';
import { GlobalActions } from './components/GlobalActions';
import { FileGrid } from './components/FileGrid';
import { Footer } from './components/Footer';
import { BottomThemeBar } from './components/BottomThemeBar';
import { ApiKeyModal } from './components/modals/ApiKeyModal';
import ToastContainer from './components/ToastContainer';

function AppContent() {
  const [showApiModal, setShowApiModal] = useState(false);

  return (
    <div className="min-h-screen bg-page transition-colors">
      <Header onOpenApiModal={() => setShowApiModal(true)} />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-40">
        <div className="text-center mb-12">
          <h1 className="text-6xl md:text-7xl font-bold text-page-text mb-6">
            Microstock Metadata Generator
          </h1>
          <p className="text-2xl text-page-text/80 max-w-4xl mx-auto">
            Generate tailored metadata for Adobe Stock, Shutterstock, and Freepik with AI-powered precision.
          </p>
        </div>

        <FileUploadArea />
        <PlatformSelector />
        <MetadataCustomization />
        <GlobalActions />
        <FileGrid />

        {/* Updated Notice Message */}
        <div className="mt-12 text-center p-6 bg-blue-50 border-2 border-blue-300 rounded-xl">
          <p className="text-blue-700 font-bold text-xl">
            ℹ️ NOW SUPPORTS JPG AND PNG FILES ONLY FOR OPTIMAL AI VISUAL ANALYSIS AND METADATA GENERATION.
          </p>
        </div>
      </main>

      <Footer />
      <BottomThemeBar />
      <ToastContainer />

      {/* Modals */}
      {showApiModal && (
        <ApiKeyModal onClose={() => setShowApiModal(false)} />
      )}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppProvider>
        <AuthGuard>
          <AppContent />
        </AuthGuard>
      </AppProvider>
    </AuthProvider>
  );
}

export default App;