'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const STORAGE_KEY = 'openrouter_api_key';

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState(false);

  // Load API key from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setApiKey(stored);
        setHasKey(true);
      }
    } catch (error) {
      console.error('Failed to load API key:', error);
    }
  }, []);

  // Save API key
  const handleSave = () => {
    try {
      if (apiKey.trim()) {
        localStorage.setItem(STORAGE_KEY, apiKey.trim());
        setHasKey(true);
        showToast('API Key saved successfully! ✓');
      } else {
        showToast('Please enter an API key');
      }
    } catch (error) {
      showToast('Failed to save API key');
      console.error('Save error:', error);
    }
  };

  // Clear API key
  const handleClear = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setApiKey('');
      setHasKey(false);
      showToast('API Key removed');
    } catch (error) {
      showToast('Failed to remove API key');
      console.error('Clear error:', error);
    }
  };

  // Show toast notification
  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // Test API key
  const handleTest = async () => {
    if (!apiKey.trim()) {
      showToast('Please enter an API key first');
      return;
    }

    try {
      showToast('Testing API key...');
      
      const response = await fetch('/api/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'Test message' })
      });

      if (response.ok) {
        showToast('✓ API Key is working!');
      } else {
        const data = await response.json();
        showToast(`✗ Error: ${data.message || 'API key test failed'}`);
      }
    } catch (error) {
      showToast('✗ Test failed - check your connection');
      console.error('Test error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2]">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/10 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link 
              href="/"
              className="text-white hover:text-white/80 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <h1 className="text-white font-bold text-xl">Settings</h1>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-sm ${
            hasKey ? 'bg-green-500/20' : 'bg-red-500/20'
          }`}>
            <span className={`w-2 h-2 rounded-full ${hasKey ? 'bg-green-400' : 'bg-red-400'}`} />
            <span className="text-white/90 text-sm">
              {hasKey ? 'API Key Configured' : 'No API Key'}
            </span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              OpenRouter API Key
            </h2>
            <p className="text-gray-600">
              Add your OpenRouter API key to enable AI text refinement
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              How to get your API key:
            </h3>
            <ol className="text-blue-800 text-sm space-y-1 ml-7 list-decimal">
              <li>Visit <a href="https://openrouter.ai" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-600">openrouter.ai</a></li>
              <li>Sign up or log in to your account</li>
              <li>Go to Settings → API Keys</li>
              <li>Click "Create Key"</li>
              <li>Copy the key and paste it below</li>
            </ol>
          </div>

          {/* API Key Input */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key
            </label>
            <div className="relative">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-or-v1-..."
                className="w-full px-4 py-3 pr-12 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-gray-700"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                title={showKey ? 'Hide key' : 'Show key'}
              >
                {showKey ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Your API key is stored locally in your browser and never sent to our servers
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleSave}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Save API Key
            </button>
            <button
              onClick={handleTest}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
            >
              Test API Key
            </button>
            {hasKey && (
              <button
                onClick={handleClear}
                className="px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
              >
                Remove Key
              </button>
            )}
          </div>

          {/* Security Note */}
          <div className="mt-6 bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Security Information
            </h3>
            <ul className="text-gray-600 text-sm space-y-1 ml-7 list-disc">
              <li>Your API key is stored only in your browser (localStorage)</li>
              <li>It is never sent to our servers</li>
              <li>Only you can access it on this device</li>
              <li>Clear your browser data will remove the key</li>
              <li>You can remove it anytime using the "Remove Key" button</li>
            </ul>
          </div>
        </div>
      </main>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
          <div className="bg-gray-900 text-white px-6 py-3 rounded-lg shadow-lg">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}