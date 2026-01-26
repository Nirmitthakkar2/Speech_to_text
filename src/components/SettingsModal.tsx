import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_MODELS = [
  { id: 'xiaomi/mimo-v2-flash:free', name: 'MiMo V2 Flash (Free)', description: 'Fast & free model' },
  { id: 'google/gemini-2.0-flash-exp:free', name: 'Gemini 2.0 Flash (Free)', description: 'Google free model' },
  { id: 'meta-llama/llama-3.2-3b-instruct:free', name: 'Llama 3.2 3B (Free)', description: 'Meta free model' },
  { id: 'mistralai/mistral-7b-instruct:free', name: 'Mistral 7B (Free)', description: 'Mistral free model' },
  { id: 'openai/gpt-4o-mini', name: 'GPT-4o Mini', description: 'Fast & affordable OpenAI model' },
  { id: 'anthropic/claude-3-haiku', name: 'Claude 3 Haiku', description: 'Fast Anthropic model' },
  { id: 'google/gemini-pro', name: 'Gemini Pro', description: 'Google flagship model' },
];

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [apiKey, setApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState('xiaomi/mimo-v2-flash:free');
  const [customModel, setCustomModel] = useState('');
  const [useCustomModel, setUseCustomModel] = useState(false);

  // Load saved settings on mount
  useEffect(() => {
    const savedApiKey = localStorage.getItem('openrouter_api_key') || '';
    const savedModel = localStorage.getItem('openrouter_model_id') || 'xiaomi/mimo-v2-flash:free';
    
    setApiKey(savedApiKey);
    
    // Check if saved model is in the popular list
    const isPopular = POPULAR_MODELS.some(m => m.id === savedModel);
    if (isPopular) {
      setSelectedModel(savedModel);
      setUseCustomModel(false);
    } else {
      setCustomModel(savedModel);
      setUseCustomModel(true);
    }
  }, [isOpen]);

  const handleSave = () => {
    if (!apiKey.trim()) {
      toast.error('Please enter an API key');
      return;
    }

    const modelToSave = useCustomModel ? customModel.trim() : selectedModel;
    
    if (!modelToSave) {
      toast.error('Please select or enter a model');
      return;
    }

    localStorage.setItem('openrouter_api_key', apiKey.trim());
    localStorage.setItem('openrouter_model_id', modelToSave);
    
    toast.success('Settings saved!');
    onClose();
  };

  const handleClear = () => {
    localStorage.removeItem('openrouter_api_key');
    localStorage.removeItem('openrouter_model_id');
    setApiKey('');
    setSelectedModel('xiaomi/mimo-v2-flash:free');
    setCustomModel('');
    setUseCustomModel(false);
    toast.success('Settings cleared');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* API Key Section */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            OpenRouter API Key
          </label>
          <input
            type="password"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            placeholder="sk-or-v1-..."
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
          />
          <p className="mt-2 text-sm text-gray-500">
            Get your free API key at{' '}
            <a 
              href="https://openrouter.ai/keys" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-purple-600 hover:underline"
            >
              openrouter.ai/keys
            </a>
          </p>
        </div>

        {/* Model Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            AI Model for Text Refinement
          </label>
          
          {/* Toggle between popular and custom */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setUseCustomModel(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                !useCustomModel 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Popular Models
            </button>
            <button
              onClick={() => setUseCustomModel(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                useCustomModel 
                  ? 'bg-purple-600 text-white' 
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Custom Model
            </button>
          </div>

          {!useCustomModel ? (
            <div className="space-y-2">
              {POPULAR_MODELS.map((model) => (
                <label
                  key={model.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${
                    selectedModel === model.id
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="model"
                    value={model.id}
                    checked={selectedModel === model.id}
                    onChange={(e) => setSelectedModel(e.target.value)}
                    className="mt-1 accent-purple-600"
                  />
                  <div>
                    <div className="font-medium text-gray-800">{model.name}</div>
                    <div className="text-sm text-gray-500">{model.description}</div>
                  </div>
                </label>
              ))}
            </div>
          ) : (
            <div>
              <input
                type="text"
                value={customModel}
                onChange={(e) => setCustomModel(e.target.value)}
                placeholder="e.g., openai/gpt-4-turbo"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none transition-colors"
              />
              <p className="mt-2 text-sm text-gray-500">
                Find more models at{' '}
                <a 
                  href="https://openrouter.ai/models" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-purple-600 hover:underline"
                >
                  openrouter.ai/models
                </a>
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={handleSave}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
          >
            Save Settings
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            Clear
          </button>
        </div>

        {/* Info Note */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl">
          <h4 className="font-medium text-blue-800 mb-1">How it works</h4>
          <p className="text-sm text-blue-700">
            This app uses your browser's built-in speech recognition to transcribe audio. 
            The AI model then refines the raw transcription to improve grammar, punctuation, 
            and clarity. Free models work great for most use cases!
          </p>
        </div>
      </div>
    </div>
  );
}
