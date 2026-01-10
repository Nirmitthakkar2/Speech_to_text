import { NextRequest, NextResponse } from 'next/server';
import { RefineResponse, ApiError } from '@/types';
import { refineText } from '@/lib/openrouter';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { text } = body;

    if (!text || typeof text !== 'string') {
      return NextResponse.json<ApiError>(
        { error: 'Invalid request', message: 'No text provided' },
        { status: 400 }
      );
    }

    // Check for API key
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json<ApiError>(
        { error: 'Configuration error', message: 'Add OPENROUTER_API_KEY to enable refinement' },
        { status: 503 }
      );
    }

    // Call OpenRouter for refinement
    let refined: string;
    try {
      refined = await refineText(text);
    } catch (error) {
      // Retry once after 1 second for rate limiting
      if (error instanceof Error && error.message.includes('429')) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        try {
          refined = await refineText(text);
        } catch {
          return NextResponse.json<ApiError>(
            {
              error: 'Rate limited',
              message: 'Refinement unavailable. Showing raw transcription.'
            },
            { status: 429 }
          );
        }
      } else {
        return NextResponse.json<ApiError>(
          {
            error: 'Refinement failed',
            message: error instanceof Error ? error.message : 'OpenRouter API error'
          },
          { status: 500 }
        );
      }
    }

    return NextResponse.json<RefineResponse>({ refined });
  } catch (error) {
    console.error('Refine API error:', error);
    return NextResponse.json<ApiError>(
      {
        error: 'Refinement failed',
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
