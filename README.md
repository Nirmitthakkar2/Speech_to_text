# Speech to Text with LLM Refinement

Web app that records audio, transcribes with Whisper, and refines with AI.

## Features

- Browser-based audio recording
- Local Whisper transcription (no API costs)
- LLM text refinement via OpenRouter
- Recording history with edit capability
- Copy and download transcriptions

## Prerequisites

- Node.js 18+
- Python 3.10+
- ~2GB disk space for Whisper model

## Quick Start

### 1. Clone and install

```bash
git clone <repository-url>
cd Speech_to_text
npm install
```

### 2. Set up Python backend

```bash
cd backend
pip install -r requirements.txt
```

First run will download the Whisper model (~500MB).

### 3. Get OpenRouter API Key

1. Go to https://openrouter.ai
2. Sign up / Log in
3. Navigate to Settings > API Keys
4. Click "Create Key"
5. Copy the key

### 4. Configure environment

Create a `.env.local` file in the project root:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your OpenRouter API key:

```
OPENROUTER_API_KEY=sk-or-v1-xxxxx
WHISPER_BACKEND_URL=http://localhost:8000
```

### 5. Run the app

Start the Python backend (in one terminal):

```bash
cd backend
python main.py
```

Start the Next.js frontend (in another terminal):

```bash
npm run dev
```

Open http://localhost:3000 in your browser.

## API Keys Setup

### OpenRouter (Required for text refinement)

The app uses OpenRouter to access the MiMo-V2-Flash model (FREE).

1. Visit https://openrouter.ai/settings/keys
2. Create a new API key
3. Add to `.env.local`:
   ```
   OPENROUTER_API_KEY=sk-or-v1-xxxxx
   ```

Note: The app works without OpenRouter (shows raw transcription only), but refinement will be disabled.

## Usage

1. Click the record button
2. Speak into your microphone
3. Click stop when done
4. View raw transcription
5. See LLM-refined version
6. Copy, edit, or download

## Architecture

```
Browser (MediaRecorder)
    -> Next.js API /api/transcribe
    -> Python FastAPI /transcribe
    -> Whisper (local)
    -> Raw text
    -> Next.js API /api/refine
    -> OpenRouter API
    -> Refined text
    -> Frontend display + history
```

## Tech Stack

- **Frontend:** Next.js 16, React 19, Tailwind CSS 4
- **Backend:** Python FastAPI, OpenAI Whisper
- **LLM:** OpenRouter (MiMo-V2-Flash - FREE)
- **Storage:** Browser localStorage

## Troubleshooting

### "Cannot connect to transcription server"

The Python backend is not running. Start it with:

```bash
cd backend
python main.py
```

### "Please allow microphone access"

Your browser needs permission to use the microphone. Click the lock icon in the address bar and enable microphone access.

### "No speech detected"

- Speak louder or closer to the microphone
- Check your microphone is working in system settings
- Try a longer recording (at least 2 seconds)

### Slow transcription

- The first transcription may be slower as the model loads
- Consider using a smaller model (edit `MODEL_NAME` in `backend/main.py`)
- GPU acceleration significantly improves speed

### "Add OPENROUTER_API_KEY to enable refinement"

Create `.env.local` with your OpenRouter API key. See "API Keys Setup" above.

## Development

### Project Structure

```
Speech_to_text/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── transcribe/route.ts  # Proxy to Python backend
│   │   │   └── refine/route.ts      # OpenRouter LLM refinement
│   │   ├── page.tsx                 # Main page
│   │   └── layout.tsx               # Root layout
│   ├── components/
│   │   ├── AudioRecorder.tsx        # Recording UI
│   │   ├── RecordingHistory.tsx     # History panel
│   │   └── TranscriptionCard.tsx    # History item card
│   ├── lib/
│   │   └── openrouter.ts            # OpenRouter API helper
│   └── types/
│       └── index.ts                 # TypeScript interfaces
├── backend/
│   ├── main.py                      # FastAPI server
│   └── requirements.txt             # Python dependencies
├── .env.example                     # Environment template
├── PYTORCH_SETUP.md                 # PyTorch installation guide
└── README.md                        # This file
```

### Scripts

```bash
npm run dev    # Start Next.js dev server
npm run build  # Build for production
npm run start  # Start production server
npm run lint   # Run ESLint
```

## License

MIT
