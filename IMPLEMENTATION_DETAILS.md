# Model Selection Feature - Implementation Details

## 📋 Overview

This document provides technical details about the model selection feature implementation.

---

## 🏗️ Architecture

### Components Added/Modified

1. **New API Route:** `/api/models`
   - Fetches available models from OpenRouter
   - Filters and sorts models
   - Caches results for 1 hour

2. **New Settings Page:** `/settings`
   - Model selection interface
   - API key management
   - Search and filter functionality

3. **Updated Library:** `src/lib/openrouter.ts`
   - Added `modelId` parameter to `refineText()`
   - Supports dynamic model selection

4. **Updated API Route:** `/api/refine`
   - Accepts `modelId` parameter
   - Passes to OpenRouter API

5. **Updated Components:**
   - `AudioRecorder.tsx` - Reads model from localStorage
   - `page.tsx` - Adds Settings link, reads model for re-refine

---

## 🔄 Data Flow

### Model Selection Flow:
```
User → Settings Page → Select Model → Save to localStorage
                                    ↓
                            'openrouter_model_id'
```

### Refinement Flow:
```
Recording → AudioRecorder → Get model from localStorage
                         ↓
                    /api/refine (with modelId)
                         ↓
                    OpenRouter API (with selected model)
                         ↓
                    Refined Text
```

---

## 💾 Storage

### localStorage Keys:

1. **`openrouter_api_key`**
   - Type: String
   - Format: `sk-or-v1-...`
   - Purpose: OpenRouter API authentication

2. **`openrouter_model_id`**
   - Type: String
   - Format: `provider/model-name:variant`
   - Example: `xiaomi/mimo-v2-flash:free`
   - Purpose: Selected model for refinement

3. **`speech_recordings`** (existing)
   - Type: JSON Array
   - Purpose: Recording history

---

## 🔌 API Endpoints

### GET `/api/models`

**Purpose:** Fetch available OpenRouter models

**Request:**
```typescript
GET /api/models
```

**Response:**
```typescript
{
  models: [
    {
      id: string,
      name: string,
      description: string,
      pricing: {
        prompt: string,
        completion: string
      },
      context_length: number,
      max_completion_tokens: number,
      isFree: boolean
    }
  ]
}
```

**Caching:** 1 hour (3600 seconds)

**Error Response:**
```typescript
{
  error: string,
  message: string
}
```

---

### POST `/api/refine`

**Purpose:** Refine text using selected model

**Request:**
```typescript
POST /api/refine
Content-Type: application/json

{
  text: string,           // Required: Text to refine
  apiKey?: string,        // Optional: API key (from localStorage)
  modelId?: string        // Optional: Model ID (from localStorage)
}
```

**Response (Success):**
```typescript
{
  refined: string
}
```

**Response (Error):**
```typescript
{
  error: string,
  message: string
}
```

---

## 🎨 UI Components

### Settings Page Layout

```
┌─────────────────────────────────────────────────────────┐
│ ← Settings                        🟢 API Key Configured │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ ┌──────────────────────┐  ┌──────────────────────────┐ │
│ │ API Key Section      │  │ Model Selection Section  │ │
│ │                      │  │                          │ │
│ │ [Instructions]       │  │ [Search Box]             │ │
│ │ [Input Field]        │  │ [Filter Checkbox]        │ │
│ │ [Save] [Remove]      │  │ [Model List]             │ │
│ │                      │  │ [Save] [Reset] [Test]    │ │
│ └──────────────────────┘  └──────────────────────────┘ │
│                                                          │
│ ┌────────────────────────────────────────────────────┐ │
│ │ Security Information                                │ │
│ └────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Model List Item

```
┌─────────────────────────────────────────────────────┐
│ Model Name                                   [FREE] │
│ provider/model-id:variant                           │
│ Description of what this model does...              │
│ Context: 32,768 tokens • Prompt: $0.001/1K         │
└─────────────────────────────────────────────────────┘
```

---

## 🔧 Configuration

### Default Values

```typescript
const STORAGE_KEY_API = 'openrouter_api_key';
const STORAGE_KEY_MODEL = 'openrouter_model_id';
const DEFAULT_MODEL = 'xiaomi/mimo-v2-flash:free';
```

### OpenRouter API

```typescript
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENROUTER_MODELS_URL = 'https://openrouter.ai/api/v1/models';
```

### Request Headers

```typescript
{
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${apiKey}`,
  'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
  'X-Title': 'Speech to Text App'
}
```

---

## 🎯 Model Filtering Logic

### Filter Criteria

1. **Modality Filter:**
   - Include: `text`, `text+image`, `text->text`
   - Exclude: Image-only, audio-only models

2. **Sorting:**
   - Free models first
   - Then alphabetically by name

3. **Search:**
   - Matches: name, id, description
   - Case-insensitive

4. **Free Filter:**
   - Shows only models with `pricing.prompt === '0'` and `pricing.completion === '0'`

---

## 🔒 Security Considerations

### Client-Side Storage
- API keys stored in localStorage (not sessionStorage)
- Accessible only to same origin
- Cleared when browser data is cleared

### API Key Transmission
- Sent only to OpenRouter API
- Never logged or stored on our servers
- Transmitted over HTTPS

### Model Selection
- No sensitive data in model IDs
- Model list fetched from public OpenRouter API
- Cached to reduce API calls

---

## 🧪 Testing

### Manual Testing Checklist

- [ ] Models load correctly
- [ ] Search functionality works
- [ ] Free filter works
- [ ] Model selection updates UI
- [ ] Save model persists to localStorage
- [ ] Reset to default works
- [ ] Test configuration validates API key + model
- [ ] Refinement uses selected model
- [ ] Re-refine uses selected model
- [ ] Default model used when none selected
- [ ] Error handling for failed model fetch
- [ ] Error handling for invalid model ID

### Test Cases

1. **No API Key:**
   - Should show error message
   - Should prompt to add API key

2. **No Model Selected:**
   - Should use default model
   - Should work without errors

3. **Invalid Model ID:**
   - Should show error from OpenRouter
   - Should suggest checking model availability

4. **Free Model:**
   - Should work without additional costs
   - Should show FREE badge

5. **Paid Model:**
   - Should work if user has credits
   - Should show pricing information

---

## 🚀 Performance

### Optimizations

1. **Model List Caching:**
   - Cached for 1 hour
   - Reduces API calls to OpenRouter
   - Improves page load time

2. **localStorage Usage:**
   - Fast read/write operations
   - No server round-trips
   - Instant model switching

3. **Lazy Loading:**
   - Models fetched only when Settings page opens
   - Not loaded on main page

4. **Search Optimization:**
   - Client-side filtering
   - No API calls for search
   - Instant results

---

## 🔄 Backward Compatibility

### Existing Functionality Preserved

1. **Environment Variable Support:**
   - `OPENROUTER_API_KEY` still works
   - Falls back if no localStorage key

2. **Default Model:**
   - Uses `xiaomi/mimo-v2-flash:free` if no selection
   - Same as original implementation

3. **Existing Recordings:**
   - Not affected by model changes
   - Keep original transcriptions

4. **API Compatibility:**
   - All existing API calls still work
   - New parameters are optional

---

## 📊 Model Data Structure

### OpenRouter Model Response

```typescript
interface OpenRouterModel {
  id: string;                    // "provider/model-name:variant"
  name: string;                  // "Model Display Name"
  description?: string;          // Model description
  pricing: {
    prompt: string;              // Cost per 1K tokens (input)
    completion: string;          // Cost per 1K tokens (output)
  };
  context_length: number;        // Maximum context in tokens
  architecture?: {
    modality?: string;           // "text", "text+image", etc.
    tokenizer?: string;          // Tokenizer type
  };
  top_provider?: {
    max_completion_tokens?: number;  // Max output tokens
  };
}
```

### Processed Model (Frontend)

```typescript
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
  isFree: boolean;               // Computed field
}
```

---

## 🐛 Error Handling

### Model Fetch Errors

```typescript
try {
  // Fetch models
} catch (error) {
  // Show toast: "Failed to load models"
  // Use default model
  // Log error to console
}
```

### Refinement Errors

```typescript
try {
  // Refine text
} catch (error) {
  if (error.message.includes('429')) {
    // Rate limit: Retry once after 1 second
  } else {
    // Show error message
    // Fall back to raw transcription
  }
}
```

### localStorage Errors

```typescript
try {
  // Save to localStorage
} catch (error) {
  // Show toast: "Failed to save"
  // Log error
  // Continue without saving
}
```

---

## 🔮 Future Enhancements

### Potential Improvements

1. **Model Favorites:**
   - Save frequently used models
   - Quick access to favorites

2. **Model Comparison:**
   - Side-by-side comparison
   - A/B testing interface

3. **Usage Statistics:**
   - Track which models used most
   - Show cost estimates

4. **Model Recommendations:**
   - Suggest models based on use case
   - Smart defaults

5. **Batch Processing:**
   - Process multiple recordings with different models
   - Compare results

6. **Model Presets:**
   - Save model + settings combinations
   - Quick switching between presets

---

## 📝 Code Examples

### Using Selected Model in Component

```typescript
// Get model from localStorage
const modelId = localStorage.getItem('openrouter_model_id');

// Use in API call
const response = await fetch('/api/refine', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    text: textToRefine,
    apiKey: apiKey,
    modelId: modelId  // Optional, falls back to default
  })
});
```

### Fetching Models

```typescript
const response = await fetch('/api/models');
const data = await response.json();
const models = data.models;  // Array of Model objects
```

### Filtering Models

```typescript
const filteredModels = models.filter(model => {
  const matchesSearch = model.name.toLowerCase().includes(query.toLowerCase());
  const matchesFree = !filterFree || model.isFree;
  return matchesSearch && matchesFree;
});
```

---

## ✅ Implementation Checklist

- [x] Create `/api/models` endpoint
- [x] Update `openrouter.ts` library
- [x] Update `/api/refine` endpoint
- [x] Create Settings page with model selection
- [x] Add search functionality
- [x] Add free filter
- [x] Add model information display
- [x] Update AudioRecorder component
- [x] Update main page component
- [x] Add Settings navigation link
- [x] Implement localStorage storage
- [x] Add default model fallback
- [x] Add test configuration button
- [x] Add error handling
- [x] Create documentation

---

**Implementation Status:** ✅ Complete

All core features implemented and ready for testing.

---

*Technical documentation for the Model Selection feature*