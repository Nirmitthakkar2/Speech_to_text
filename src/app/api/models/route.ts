import { NextResponse } from 'next/server';

const OPENROUTER_MODELS_URL = 'https://openrouter.ai/api/v1/models';

export interface OpenRouterModel {
  id: string;
  name: string;
  description?: string;
  pricing: {
    prompt: string;
    completion: string;
  };
  context_length: number;
  architecture?: {
    modality?: string;
    tokenizer?: string;
  };
  top_provider?: {
    max_completion_tokens?: number;
  };
}

export interface ModelsResponse {
  data: OpenRouterModel[];
}

export async function GET() {
  try {
    const response = await fetch(OPENROUTER_MODELS_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      // Cache for 1 hour to reduce API calls
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch models: ${response.status}`);
    }

    const data: ModelsResponse = await response.json();

    // Filter and sort models
    const models = data.data
      .filter(model => {
        // Only include text models (exclude image/audio models)
        const modality = model.architecture?.modality || 'text';
        return modality === 'text' || modality === 'text+image' || modality === 'text->text';
      })
      .map(model => ({
        id: model.id,
        name: model.name,
        description: model.description || '',
        pricing: {
          prompt: model.pricing.prompt,
          completion: model.pricing.completion,
        },
        context_length: model.context_length,
        max_completion_tokens: model.top_provider?.max_completion_tokens || 4096,
        isFree: model.pricing.prompt === '0' && model.pricing.completion === '0',
      }))
      .sort((a, b) => {
        // Sort: Free models first, then by name
        if (a.isFree && !b.isFree) return -1;
        if (!a.isFree && b.isFree) return 1;
        return a.name.localeCompare(b.name);
      });

    return NextResponse.json({ models });
  } catch (error) {
    console.error('Error fetching models:', error);
    return NextResponse.json(
      { error: 'Failed to fetch models', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}