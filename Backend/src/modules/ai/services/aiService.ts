
// AI PROVIDER CONFIGURATION
// Switch providers by setting AI_PROVIDER in your .env file.
// Example:
// AI_PROVIDER=groq
// AI_PROVIDER=anthropic
// If nothing is set, we default to Groq to avoid paid surprises 

import Anthropic from '@anthropic-ai/sdk';
import Groq from 'groq-sdk';
import { ApiError } from '../../../utils/apiError.js';
import { logger } from '../../../utils/logger.js';

// Determine which AI provider to use 
const AI_PROVIDER = process.env.AI_PROVIDER || 'groq';

// we are using groq becuase it is having free tier requests 

// ============================================================================
// ANTHROPIC CLIENT 
// ============================================================================

const anthropic = new Anthropic({
  apiKey: process.env.CLAUDE_API_KEY || 'dummy-key',
});

// ============================================================================
// GROQ CLIENT for free tier
// ============================================================================

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface AISuggestion {
  id: string;
  fieldType: 'text' | 'textarea' | 'select' | 'radio' | 'checkbox' | 'date' | 'rating' | 'file';
  label: string;
  placeholder?: string;
  required: boolean;
  validation?: Array<{
    type: string;
    value: string | number;
    message: string;
  }>;
  options?: string[];
  reasoning?: string;
}

// prompting 

function buildPrompt(purpose: string): string {
  return `You are a form design expert. Based on the following form purpose, suggest relevant form fields that would help collect the necessary information.

Form Purpose: ${purpose}

Please provide 8-12 field suggestions in JSON format. Include a variety of field types to make the form comprehensive. Each field should have:
- fieldType: one of "text", "textarea", "select", "radio", "checkbox", "date", "rating", "file"
- label: the field label
- placeholder: optional placeholder text (not for date, rating, file types)
- required: boolean indicating if the field is required
- options: array of options (only for select, radio, checkbox types)
- reasoning: brief explanation of why this field is useful

Return ONLY a valid JSON array of field objects, no additional text or markdown formatting.

Example format:
[
  {
    "fieldType": "text",
    "label": "Full Name",
    "placeholder": "Enter your full name",
    "required": true,
    "reasoning": "Essential for identifying respondents"
  },
  {
    "fieldType": "select",
    "label": "Age Range",
    "required": false,
    "options": ["18-25", "26-35", "36-45", "46+"],
    "reasoning": "Helps segment responses by age group"
  },
  {
    "fieldType": "file",
    "label": "Resume/CV",
    "required": true,
    "reasoning": "Required document for application review"
  }
]`;
}

//Parse AI response parsing and validation of the  structure
 
function parseResponse(response: string): AISuggestion[] {
  try {
    // Remove markdown code blocks if present
    let cleanedResponse = response.trim();
    if (cleanedResponse.startsWith('```json')) {
      cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/```\n?/g, '');
    }

    const parsed = JSON.parse(cleanedResponse);
    
    if (!Array.isArray(parsed)) {
      throw new Error('Response is not an array');
    }

    // Validation and transformation of  each suggestion

    const suggestions: AISuggestion[] = parsed.map((item: any, index: number) => {
      if (!item.fieldType || !item.label) {
        throw new Error(`Suggestion ${index} missing required fields`);
      }

      const validFieldTypes = ['text', 'textarea', 'select', 'radio', 'checkbox', 'date', 'rating', 'file'];
      if (!validFieldTypes.includes(item.fieldType)) {
        logger.warn(`Invalid field type ${item.fieldType}, defaulting to text`);
        item.fieldType = 'text';
      }

      return {
        id: `ai-suggestion-${Date.now()}-${index}`,
        fieldType: item.fieldType,
        label: item.label,
        placeholder: item.placeholder,
        required: item.required ?? false,
        validation: item.validation,
        options: item.options,
        reasoning: item.reasoning,
      };
    });

    return suggestions;
  } catch (error) {
    logger.error('Failed to parse AI response', { error, response });
    throw new ApiError(500, 'Failed to parse AI suggestions. Please try again.');
  }
}


async function generateSuggestionsWithAnthropic(purpose: string, userId: string): Promise<AISuggestion[]> {
  logger.info('Requesting AI suggestions from Claude API (Anthropic)', { purpose, userId });

  const message = await anthropic.messages.create({
    model: "claude-3-5-haiku-latest",
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: buildPrompt(purpose),
      },
    ],
  });

  // Extract text content from the response

  const textContent = message.content.find((block) => block.type === 'text');
  if (!textContent || textContent.type !== 'text') {
    throw new Error('No text content in Claude response');
  }

  return parseResponse(textContent.text);
}

async function generateSuggestionsWithGroq(purpose: string, userId: string): Promise<AISuggestion[]> {
  logger.info('Requesting AI suggestions from Groq API', { purpose, userId });

  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      {
        role: "user",
        content: buildPrompt(purpose),
      },
    ],
    temperature: 0.7,
    max_tokens: 1024,
  });

  const responseText = completion.choices[0]?.message?.content;
  if (!responseText) {
    throw new Error('No content in Groq response');
  }

  return parseResponse(responseText);
}

export async function generateSuggestions(purpose: string, userId: string): Promise<AISuggestion[]> {
  if (!purpose || purpose.trim().length === 0) {
    throw new ApiError(400, 'Form purpose is required');
  }

  // Check API key based on provider
  if (AI_PROVIDER === 'anthropic' && !process.env.CLAUDE_API_KEY) {
    throw new ApiError(500, 'Claude API key is not configured');
  }
  
  if (AI_PROVIDER === 'groq' && !process.env.GROQ_API_KEY) {
    throw new ApiError(500, 'Groq API key is not configured');
  }

  try {
    let suggestions: AISuggestion[];

    if (AI_PROVIDER === 'anthropic') {
      suggestions = await generateSuggestionsWithAnthropic(purpose, userId);
    } else if (AI_PROVIDER === 'groq') {
      suggestions = await generateSuggestionsWithGroq(purpose, userId);
    } else {
      throw new ApiError(500, `Unknown AI provider: ${AI_PROVIDER}. Use 'anthropic' or 'groq'`);
    }
    
    logger.info(`Successfully generated AI suggestions using ${AI_PROVIDER}`, { 
      purpose, 
      userId,
      provider: AI_PROVIDER,
      suggestionCount: suggestions.length 
    });

    return suggestions;
  } catch (error: any) {
    if (error instanceof ApiError) {
      throw error;
    }

    logger.error(`${AI_PROVIDER} API request failed`, { 
      error: error.message, 
      errorStack: error.stack,
      errorStatus: error.status,
      purpose, 
      userId 
    });
    
    
    if (error.status === 401) {
      throw new ApiError(500, `Invalid ${AI_PROVIDER} API key`);
    } else if (error.status === 429) {
      throw new ApiError(429, `${AI_PROVIDER} API rate limit exceeded. Please try again later.`);
    } else if (error.status >= 500) {
      throw new ApiError(503, `${AI_PROVIDER} API is currently unavailable. Please try again later.`);
    }

    throw new ApiError(500, `Failed to generate AI suggestions: ${error.message}`);
  }
}
