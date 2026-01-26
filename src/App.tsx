import { useState, useEffect, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import AudioRecorder from './components/AudioRecorder';
import RecordingHistory from './components/RecordingHistory';
import SettingsModal from './components/SettingsModal';
import { Recording } from './types';

const STORAGE_KEY = 'speech_recordings';

function App() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [currentRecording, setCurrentRecording] = useState<Recording | null>(null);
  const [activeTab, setActiveTab] = useState<'raw' | 'refined'>('refined');
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [isRefining, setIsRefining] = useState(false);

  // Load recordings from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setRecordings(parsed);
        }
      }
    } catch {
      console.error('Failed to load recordings from localStorage');
      localStorage.removeItem(STORAGE_KEY);
      toast.error('History was reset due to data error');
    }
  }, []);

  // Save recordings to localStorage
  const saveRecordings = useCallback((newRecordings: Recording[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newRecordings));
      setRecordings(newRecordings);
    } catch (e) {
      if (e instanceof Error && e.name === 'QuotaExceededError') {
        toast.error('Storage full. Consider deleting old recordings.');
      }
    }
  }, []);

  // Handle new recording complete
  const handleRecordingComplete = useCallback((recording: Recording) => {
    const newRecordings = [recording, ...recordings];
    saveRecordings(newRecordings);
    setCurrentRecording(recording);
    setActiveTab('refined');
    setIsEditing(false);
  }, [recordings, saveRecordings]);

  // Handle recording error
  const handleError = useCallback((errorMessage: string) => {
    toast.error(errorMessage);
  }, []);

  // View a recording from history
  const handleView = useCallback((recording: Recording) => {
    setCurrentRecording(recording);
    setActiveTab('refined');
    setIsEditing(false);
  }, []);

  // Edit a recording
  const handleEdit = useCallback((recording: Recording) => {
    setCurrentRecording(recording);
    setActiveTab('refined');
    setIsEditing(true);
    setEditedText(recording.refinedText || recording.rawText);
  }, []);

  // Delete a recording
  const handleDelete = useCallback((recordingId: string) => {
    const newRecordings = recordings.filter(r => r.id !== recordingId);
    saveRecordings(newRecordings);
    if (currentRecording?.id === recordingId) {
      setCurrentRecording(null);
    }
    toast.success('Recording deleted');
  }, [recordings, currentRecording, saveRecordings]);

  // Save edited text
  const handleSaveEdit = useCallback(() => {
    if (!currentRecording) return;

    const updatedRecording = {
      ...currentRecording,
      refinedText: editedText
    };

    const newRecordings = recordings.map(r =>
      r.id === currentRecording.id ? updatedRecording : r
    );

    saveRecordings(newRecordings);
    setCurrentRecording(updatedRecording);
    setIsEditing(false);
    toast.success('Changes saved');
  }, [currentRecording, editedText, recordings, saveRecordings]);

  // Re-refine text using OpenRouter
  const handleReRefine = useCallback(async () => {
    if (!currentRecording) return;

    const textToRefine = isEditing ? editedText : (currentRecording.refinedText || currentRecording.rawText);
    const apiKey = localStorage.getItem('openrouter_api_key');
    const modelId = localStorage.getItem('openrouter_model_id') || 'xiaomi/mimo-v2-flash:free';

    if (!apiKey) {
      toast.error('Please add your OpenRouter API key in Settings');
      setShowSettings(true);
      return;
    }

    setIsRefining(true);

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Speech to Text Pro'
        },
        body: JSON.stringify({
          model: modelId,
          messages: [
            {
              role: 'system',
              content: `Transform speech-to-text output into clear, professional text. Preserve meaning and intent.

Rules:
- Add proper punctuation and capitalization
- Remove filler words (um, uh, like, you know)
- Fix grammar and awkward phrasing
- Break run-on sentences
- Correct speech recognition errors
- Keep speaker's voice, tone, terminology
- Preserve names and technical terms
- Do not add new information

Output only the refined text.`
            },
            { role: 'user', content: textToRefine }
          ],
          temperature: 0.3,
          max_tokens: 2000
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API error: ${response.status}`);
      }

      const data = await response.json();
      const refined = data.choices?.[0]?.message?.content;

      if (!refined) {
        throw new Error('No response from AI');
      }

      const updatedRecording = {
        ...currentRecording,
        refinedText: refined
      };

      const newRecordings = recordings.map(r =>
        r.id === currentRecording.id ? updatedRecording : r
      );

      saveRecordings(newRecordings);
      setCurrentRecording(updatedRecording);
      setEditedText(refined);
      toast.success('Text re-refined');
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Re-refinement failed');
    } finally {
      setIsRefining(false);
    }
  }, [currentRecording, isEditing, editedText, recordings, saveRecordings]);

  // Copy text to clipboard
  const handleCopy = useCallback(async () => {
    if (!currentRecording) return;

    const textToCopy = activeTab === 'raw'
      ? currentRecording.rawText
      : (currentRecording.refinedText || currentRecording.rawText);

    try {
      await navigator.clipboard.writeText(textToCopy);
      toast.success('Copied to clipboard');
    } catch {
      toast.error('Failed to copy to clipboard');
    }
  }, [currentRecording, activeTab]);

  // Download text as file
  const handleDownload = useCallback(() => {
    if (!currentRecording) return;

    const textToDownload = currentRecording.refinedText || currentRecording.rawText;
    const timestamp = new Date(currentRecording.timestamp).toISOString().replace(/[:.]/g, '-');
    const filename = `transcription_${timestamp}.txt`;

    const blob = new Blob([textToDownload], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [currentRecording]);

  // Get displayed text
  const displayedText = currentRecording
    ? (activeTab === 'raw' ? currentRecording.rawText : currentRecording.refinedText || currentRecording.rawText)
    : '';

  // Check if API key is set
  const hasApiKey = !!localStorage.getItem('openrouter_api_key');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2]">
      
      {/* Top Bar - Glassmorphism */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/10 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-white font-bold text-xl">Speech to Text Pro</h1>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowSettings(true)}
              className="text-white/90 hover:text-white transition-colors flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/10"
              title="Settings"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm">Settings</span>
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm">
              <span className={`w-2 h-2 rounded-full animate-pulse ${hasApiKey ? 'bg-green-400' : 'bg-yellow-400'}`} />
              <span className="text-white/90 text-sm">
                {hasApiKey ? 'API Connected' : 'API Key Needed'}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6 flex-col lg:flex-row">
          {/* Left Column - Recorder and Results */}
          <div className="flex-1 space-y-6">
            {/* Audio Recorder */}
            <AudioRecorder
              onRecordingComplete={handleRecordingComplete}
              onError={handleError}
            />

            {/* Result Card */}
            {currentRecording && (
              <div className="bg-white rounded-2xl p-6 shadow-lg">
                {/* Header with Tabs */}
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-800">Transcription Result</h3>
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => { setActiveTab('raw'); setIsEditing(false); }}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        activeTab === 'raw'
                          ? 'bg-white text-purple-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      Raw
                    </button>
                    <button
                      onClick={() => { setActiveTab('refined'); setIsEditing(false); }}
                      className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${
                        activeTab === 'refined'
                          ? 'bg-white text-purple-600 shadow-sm'
                          : 'text-gray-600 hover:text-gray-800'
                      }`}
                    >
                      Refined
                    </button>
                  </div>
                </div>

                {/* Text Area */}
                {isEditing ? (
                  <textarea
                    value={editedText}
                    onChange={(e) => setEditedText(e.target.value)}
                    className="w-full h-48 p-4 bg-[#f8fafc] border-2 border-purple-300 rounded-xl text-gray-700 focus:outline-none focus:border-purple-500 resize-none"
                    placeholder="Edit your transcription..."
                  />
                ) : (
                  <div className="w-full min-h-[12rem] p-4 bg-[#f8fafc] border-2 border-gray-200 rounded-xl text-gray-700">
                    {displayedText || <span className="text-gray-400">No transcription available</span>}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3 mt-4">
                  {isEditing ? (
                    <>
                      <button
                        onClick={handleSaveEdit}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => { setIsEditing(false); setEditedText(''); }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => { setIsEditing(true); setEditedText(displayedText); }}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={handleReRefine}
                        disabled={isRefining}
                        className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
                      >
                        {isRefining ? 'Refining...' : 'Re-refine'}
                      </button>
                      <button
                        onClick={handleCopy}
                        className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                      >
                        Copy
                      </button>
                      <button
                        onClick={handleDownload}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                      >
                        Download
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - History Sidebar */}
          <div className="w-full lg:w-[360px]">
            <RecordingHistory
              recordings={recordings}
              onView={handleView}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          </div>
        </div>
      </main>

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={showSettings} 
        onClose={() => setShowSettings(false)} 
      />
    </div>
  );
}

export default App;
