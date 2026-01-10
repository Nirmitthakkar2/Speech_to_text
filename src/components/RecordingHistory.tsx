'use client';

import { Recording } from '@/types';
import TranscriptionCard from './TranscriptionCard';

interface RecordingHistoryProps {
  recordings: Recording[];
  onView: (recording: Recording) => void;
  onEdit: (recording: Recording) => void;
  onDelete: (recordingId: string) => void;
}

export default function RecordingHistory({
  recordings,
  onView,
  onEdit,
  onDelete
}: RecordingHistoryProps) {
  // Sort recordings by timestamp descending (newest first)
  const sortedRecordings = [...recordings].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden h-full flex flex-col">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1e293b] to-[#334155] px-4 py-4">
        <h2 className="text-white font-semibold text-lg">Recording History</h2>
        <p className="text-gray-300 text-sm">
          {recordings.length} recording{recordings.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {sortedRecordings.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <div className="mb-2">
              <svg
                className="w-12 h-12 mx-auto text-gray-300"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                />
              </svg>
            </div>
            <p>No recordings yet</p>
            <p className="text-sm">Start recording to see your history</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sortedRecordings.map((recording) => (
              <TranscriptionCard
                key={recording.id}
                recording={recording}
                onView={() => onView(recording)}
                onEdit={() => onEdit(recording)}
                onDelete={() => onDelete(recording.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
