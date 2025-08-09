import React, { useState } from 'react';
import { LogIn, UserPlus, Shield } from 'lucide-react';
import { AuthModal } from './AuthModal';
import { SecretCodeGate } from './SecretCodeGate';
import { BottomThemeBar } from '../BottomThemeBar';

export const AuthLanding: React.FC = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSecretGate, setShowSecretGate] = useState(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  const handleSignInClick = () => {
    setAuthMode('signin');
    setShowAuthModal(true);
  };

  const handleSignUpClick = () => {
    setShowSecretGate(true);
  };

  const handleSecretCodeSuccess = () => {
    setShowSecretGate(false);
    setAuthMode('signup');
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen bg-page transition-colors">
      {/* Header */}
      <div className="w-full bg-header-bg relative overflow-hidden">
        <img 
          src="/MATAKING.png" 
          alt="METAKING by Rafijur Rahman Banner" 
          className="w-full h-32 object-contain bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900"
          onError={(e) => {
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
      </div>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 pb-40">
        <div className="text-center">
          {/* Hero Section */}
          <div className="mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-page-text mb-6">
              Microstock Metadata Generator
            </h1>
            <p className="text-xl text-page-text/80 max-w-3xl mx-auto mb-8">
              Generate tailored metadata for Adobe Stock, Shutterstock, and Freepik with AI-powered precision.
            </p>
            <div className="flex items-center justify-center gap-2 text-page-text/70 mb-12">
              <Shield className="w-5 h-5" />
              <span className="text-lg">Secure • Professional • Efficient</span>
            </div>
          </div>

          {/* Access Required Section */}
          <div className="bg-component rounded-xl shadow-xl p-12 mb-12">
            <div className="mb-8">
              <div className="w-20 h-20 bg-primary-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <Shield className="w-10 h-10 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-component-text mb-4">
                Access Required
              </h2>
              <p className="text-lg text-component-text/70 max-w-2xl mx-auto">
                To use the Microstock Metadata Generator, you need to sign in to your account. 
                New users must have a secret code to create an account.
              </p>
            </div>

            {/* Auth Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <button
                onClick={handleSignInClick}
                className="flex items-center gap-3 px-8 py-4 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition-colors font-bold text-lg shadow-lg min-w-[200px]"
              >
                <LogIn className="w-6 h-6" />
                Sign In
              </button>

              <button
                onClick={handleSignUpClick}
                className="flex items-center gap-3 px-8 py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors font-bold text-lg shadow-lg min-w-[200px]"
              >
                <UserPlus className="w-6 h-6" />
                Sign Up
              </button>
            </div>

            <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-xl">
              <p className="text-yellow-800 font-medium">
                <strong>New Users:</strong> You need a secret code to create an account. 
                Contact us via WhatsApp to get your access code.
              </p>
            </div>
          </div>

          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-component rounded-xl p-8 shadow-lg">
              <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🅰️</span>
              </div>
              <h3 className="text-xl font-bold text-component-text mb-2">Adobe Stock</h3>
              <p className="text-component-text/70">
                Generate optimized titles and keywords for Adobe Stock submissions
              </p>
            </div>

            <div className="bg-component rounded-xl p-8 shadow-lg">
              <div className="w-16 h-16 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">🎨</span>
              </div>
              <h3 className="text-xl font-bold text-component-text mb-2">Freepik</h3>
              <p className="text-component-text/70">
                Create compelling metadata for Freepik platform requirements
              </p>
            </div>

            <div className="bg-component rounded-xl p-8 shadow-lg">
              <div className="w-16 h-16 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📸</span>
              </div>
              <h3 className="text-xl font-bold text-component-text mb-2">Shutterstock</h3>
              <p className="text-component-text/70">
                Generate descriptions and keywords for Shutterstock uploads
              </p>
            </div>
          </div>
        </div>
      </main>

      <BottomThemeBar />

      {/* Modals */}
      {showSecretGate && (
        <SecretCodeGate
          onClose={() => setShowSecretGate(false)}
          onSuccess={handleSecretCodeSuccess}
        />
      )}

      {showAuthModal && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuthModal(false)}
        />
      )}
    </div>
  );
};