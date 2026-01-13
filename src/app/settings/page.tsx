'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const STORAGE_KEY_API = 'openrouter_api_key';
const STORAGE_KEY_MODEL = 'openrouter_model_id';
const DEFAULT_MODEL = 'xiaomi/mimo-v2-flash:free';

interface Model {
  id: string;
  name: string;
  description: string;
  pricing: {
    prompt: string;
    completion: string;
  };
  context_length: number;
  max_completion_tokens: number;
  isFree: boolean;
}

export default function SettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const [models, setModels] = useState<Model[]>([]);
  const [loadingModels, setLoadingModels] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterFree, setFilterFree] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState(false);

  // Load API key and selected model from localStorage
  useEffect(() => {
    try {
      const storedKey = localStorage.getItem(STORAGE_KEY_API);
      const storedModel = localStorage.getItem(STORAGE_KEY_MODEL);
      
      if (storedKey) {
        setApiKey(storedKey);
        setHasKey(true);
      }
      
      if (storedModel) {
        setSelectedModel(storedModel);
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }, []);

  // Fetch available models
  useEffect(() => {
    fetchModels();
  }, []);

  const fetchModels = async () => {
    try {
      setLoadingModels(true);
      const response = await fetch('/api/models');
      
      if (!response.ok) {
        throw new Error('Failed to fetch models');
      }
      
      const data = await response.json();
      setModels(data.models || []);
    } catch (error) {
      console.error('Error fetching models:', error);
      showToast('Failed to load models. Using default model.');
    } finally {
      setLoadingModels(false);
    }
  };

  // Save API key
  const handleSaveApiKey = () => {
    try {
      if (apiKey.trim()) {
        localStorage.setItem(STORAGE_KEY_API, apiKey.trim());
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

  // Save selected model
  const handleSaveModel = () => {
    try {
      localStorage.setItem(STORAGE_KEY_MODEL, selectedModel);
      showToast('Model preference saved! ✓');
    } catch (error) {
      showToast('Failed to save model preference');
      console.error('Save error:', error);
    }
  };

  // Clear API key
  const handleClearApiKey = () => {
    try {
      localStorage.removeItem(STORAGE_KEY_API);
      setApiKey('');
      setHasKey(false);
      showToast('API Key removed');
    } catch (error) {
      showToast('Failed to remove API key');
      console.error('Clear error:', error);
    }
  };

  // Reset to default model
  const handleResetModel = () => {
    setSelectedModel(DEFAULT_MODEL);
    localStorage.setItem(STORAGE_KEY_MODEL, DEFAULT_MODEL);
    showToast('Reset to default model');
  };

  // Show toast notification
  const showToast = (message: string) => {
    setToast(message);
    setTimeout(() => setToast(null), 3000);
  };

  // Test API key with selected model
  const handleTest = async () => {
    if (!apiKey.trim()) {
      showToast('Please enter an API key first');
      return;
    }

    try {
      showToast('Testing API key with selected model...');
      
      const response = await fetch('/api/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: 'Test message',
          apiKey: apiKey.trim(),
          modelId: selectedModel
        })
      });

      if (response.ok) {
        showToast('✓ API Key and Model are working!');
      } else {
        const data = await response.json();
        showToast(`✗ Error: ${data.message || 'Test failed'}`);
      }
    } catch (error) {
      showToast('✗ Test failed - check your connection');
      console.error('Test error:', error);
    }
  };

  // Filter models based on search and free filter
  const filteredModels = models.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         model.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         model.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFree = !filterFree || model.isFree;
    return matchesSearch && matchesFree;
  });

  // Get selected model details
  const selectedModelDetails = models.find(m => m.id === selectedModel);

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
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Left Column - API Key */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
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
                Your API key is stored locally in your browser
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleSaveApiKey}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Save API Key
              </button>
              {hasKey && (
                <button
                  onClick={handleClearApiKey}
                  className="px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                >
                  Remove Key
                </button>
              )}
            </div>
          </div>

          {/* Right Column - Model Selection */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">
                AI Model Selection
              </h2>
              <p className="text-gray-600">
                Choose which AI model to use for text refinement
              </p>
            </div>

            {/* Search and Filter */}
            <div className="mb-4 space-y-3">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search models..."
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none text-gray-700"
              />
              <label className="flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filterFree}
                  onChange={(e) => setFilterFree(e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded focus:ring-purple-500"
                />
                Show only free models
              </label>
            </div>

            {/* Model List */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Available Models ({filteredModels.length})
              </label>
              {loadingModels ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="border-2 border-gray-300 rounded-lg max-h-96 overflow-y-auto">
                  {filteredModels.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      No models found matching your criteria
                    </div>
                  ) : (
                    filteredModels.map((model) => (
                      <div
                        key={model.id}
                        onClick={() => setSelectedModel(model.id)}
                        className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedModel === model.id ? 'bg-purple-50 border-l-4 border-l-purple-600' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-800">{model.name}</h4>
                              {model.isFree && (
                                <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full font-medium">
                                  FREE
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 mb-2">{model.id}</p>
                            {model.description && (
                              <p className="text-sm text-gray-600 mb-2">{model.description}</p>
                            )}
                            <div className="flex flex-wrap gap-3 text-xs text-gray-500">
                              <span>Context: {model.context_length.toLocaleString()} tokens</span>
                              {!model.isFree && (
                                <>
                                  <span>•</span>
                                  <span>Prompt: ${model.pricing.prompt}/1K</span>
                                  <span>•</span>
                                  <span>Completion: ${model.pricing.completion}/1K</span>
                                </>
                              )}
                            </div>
                          </div>
                          {selectedModel === model.id && (
                            <svg className="w-6 h-6 text-purple-600 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Selected Model Info */}
            {selectedModelDetails && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-purple-900 mb-2">Selected Model</h3>
                <p className="text-sm text-purple-800 mb-1">{selectedModelDetails.name}</p>
                <p className="text-xs text-purple-700">{selectedModelDetails.id}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleSaveModel}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
              >
                Save Model
              </button>
              <button
                onClick={handleResetModel}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Reset to Default
              </button>
              <button
                onClick={handleTest}
                disabled={!hasKey}
                className={`px-6 py-3 rounded-lg font-medium transition-opacity ${
                  hasKey
                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white hover:opacity-90'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                Test Configuration
              </button>
            </div>
          </div>
        </div>

        {/* Security Information */}
        <div className="mt-6 bg-white rounded-2xl p-8 shadow-lg">
          <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            Security & Privacy Information
          </h3>
          <ul className="text-gray-600 text-sm space-y-2 ml-7 list-disc">
            <li>Your API key and model preference are stored only in your browser (localStorage)</li>
            <li>They are never sent to our servers</li>
            <li>Only you can access them on this device</li>
            <li>Clearing your browser data will remove these settings</li>
            <li>You can remove them anytime using the buttons above</li>
            <li>Different models may have different pricing - check OpenRouter for details</li>
          </ul>
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