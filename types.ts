export interface GroundingChunk {
  web?: {
    uri: string;
    title: string;
  };
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isError?: boolean;
  groundingSources?: GroundingChunk[];
  attachments?: Attachment[];
}

export interface Attachment {
  mimeType: string;
  data: string; // Base64
  name?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export interface UserSettings {
  model: string;
  enableSearch: boolean;
  enableThinking: boolean;
  thinkingBudget: number;
}

export const AVAILABLE_MODELS = [
  { id: 'gemini-3-flash-preview', name: 'Gemini 3.0 Flash', description: 'Fast and versatile', hasThinking: false },
  { id: 'gemini-3-pro-preview', name: 'Gemini 3.0 Pro', description: 'Advanced reasoning', hasThinking: true },
];