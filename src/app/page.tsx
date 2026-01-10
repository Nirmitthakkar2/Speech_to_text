'use client';

import { useState, useEffect, useCallback } from 'react';
import { Recording } from '@/types';
import AudioRecorder from '@/components/AudioRecorder';
import RecordingHistory from '@/components/RecordingHistory';

const STORAGE_KEY = 'speech_recordings';

export default function Home() {
  const [recordings, setRecordings] = useState<Recording[]>([]);
  const [currentRecording, setCurrentRecording] = useState<Recording | null>(null);
  const [activeTab, setActiveTab] = useState<'raw' | 'refined'>('refined');
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);

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
      // Reset history on data corruption
      localStorage.removeItem(STORAGE_KEY);
      setToast('History was reset due to data error');
    }
  }, []);

  // Save recordings to localStorage
  const saveRecordings = useCallback((newRecordings: Recording[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newRecordings));
      setRecordings(newRecordings);
    } catch (e) {
      if (e instanceof Error && e.name === 'QuotaExceededError') {
        setToast('Storage full. Consider deleting old recordings.');
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
    setError(null);
  }, [recordings, saveRecordings]);

  // Handle recording error
  const handleError = useCallback((errorMessage: string) => {
    setError(errorMessage);
    setTimeout(() => setError(null), 5000);
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
    setToast('Recording deleted');
    setTimeout(() => setToast(null), 3000);
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
    setToast('Changes saved');
    setTimeout(() => setToast(null), 3000);
  }, [currentRecording, editedText, recordings, saveRecordings]);

  // Re-refine text
  const handleReRefine = useCallback(async () => {
    if (!currentRecording) return;

    const textToRefine = isEditing ? editedText : (currentRecording.refinedText || currentRecording.rawText);

    try {
      const response = await fetch('/api/refine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToRefine })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Refinement failed');
      }

      const data = await response.json();
      const updatedRecording = {
        ...currentRecording,
        refinedText: data.refined
      };

      const newRecordings = recordings.map(r =>
        r.id === currentRecording.id ? updatedRecording : r
      );

      saveRecordings(newRecordings);
      setCurrentRecording(updatedRecording);
      setEditedText(data.refined);
      setToast('Text re-refined');
      setTimeout(() => setToast(null), 3000);
    } catch (e) {
      handleError(e instanceof Error ? e.message : 'Re-refinement failed');
    }
  }, [currentRecording, isEditing, editedText, recordings, saveRecordings, handleError]);

  // Copy text to clipboard
  const handleCopy = useCallback(async () => {
    if (!currentRecording) return;

    const textToCopy = activeTab === 'raw'
      ? currentRecording.rawText
      : (currentRecording.refinedText || currentRecording.rawText);

    try {
      await navigator.clipboard.writeText(textToCopy);
      setToast('Copied to clipboard');
      setTimeout(() => setToast(null), 3000);
    } catch {
      handleError('Failed to copy to clipboard');
    }
  }, [currentRecording, activeTab, handleError]);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#667eea] to-[#764ba2]">
      {/* Top Bar - Glassmorphism */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/10 border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <h1 className="text-white font-bold text-xl">Speech to Text</h1>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/20 backdrop-blur-sm">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            <span className="text-white/90 text-sm">Connected | whisper-small</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex gap-6 flex-col lg:flex-row">
          {/* Left Column - Recorder and Results */}
          <div className="flex-1 space-y-6">
            {/* Error Banner */}
            {error && (
              <div className="bg-red-500/90 text-white px-4 py-3 rounded-lg flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>{error}</span>
                <button onClick={() => setError(null)} className="ml-auto hover:bg-white/20 rounded p-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}

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
                        className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-medium hover:opacity-90 transition-opacity"
                      >
                        Re-refine
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
