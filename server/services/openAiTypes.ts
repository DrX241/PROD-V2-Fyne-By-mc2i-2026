/**
 * Types pour l'API OpenAI
 */

export interface ChatCompletionRequestMessage {
  role: 'system' | 'user' | 'assistant' | 'function';
  content: string | Array<ChatCompletionContentPart>;
  name?: string;
}

export interface ChatCompletionContentPart {
  type: 'text' | 'image_url';
  text?: string;
  image_url?: {
    url: string;
    detail?: 'low' | 'high' | 'auto';
  };
}

export interface CrisisDecisionContent {
  situation: string;
  options: Array<{
    id: string;
    text: string;
    description: string;
    impact: {
      budget?: number;
      timeline?: number;
      reputation?: number;
      security?: number;
      employment?: boolean;
      missionCritical?: boolean;
    };
  }>;
}

export interface ChatCompletionResponseMessage {
  role: string;
  content: string | CrisisDecisionContent | null;
}

export interface ChatCompletionResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: ChatCompletionResponseMessage;
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}