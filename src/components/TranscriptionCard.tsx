'use client';

import { Recording } from '../types';

interface TranscriptionCardProps {
  recording: Recording;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function TranscriptionCard({
  recording,
  onView,
  onEdit,
  onDelete
}: TranscriptionCardProps) {
  // Format date based on when it was recorded
  const formatDate = (timestamp: number): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const recordDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    const timeStr = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    if (recordDate.getTime() === today.getTime()) {
      return `Today, ${timeStr}`;
    } else if (recordDate.getTime() === yesterday.getTime()) {
      return `Yesterday, ${timeStr}`;
    } else {
      const monthDay = date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric'
      });
      return `${monthDay}, ${timeStr}`;
    }
  };

  // Format duration as M:SS
  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get preview text (refined if available, otherwise raw)
  const previewText = recording.refinedText || recording.rawText;

  return (
    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 hover:border-purple-400 hover:shadow-md transition-all duration-200">
      {/* Header with timestamp and duration */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500">
          {formatDate(recording.timestamp)}
        </span>
        <span className="px-2 py-0.5 bg-purple-600 text-white text-xs rounded-full">
          {formatDuration(recording.duration)}
        </span>
      </div>

      {/* Preview text - 2 lines with ellipsis */}
      <p className="text-gray-700 text-sm line-clamp-2 mb-3">
        {previewText || 'No transcription available'}
      </p>

      {/* Action buttons */}
      <div className="flex gap-2">
        <button
          onClick={onView}
          className="text-xs px-3 py-1 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
        >
          View
        </button>
        <button
          onClick={onEdit}
          className="text-xs px-3 py-1 text-gray-600 hover:text-purple-600 hover:bg-purple-50 rounded transition-colors"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="text-xs px-3 py-1 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
