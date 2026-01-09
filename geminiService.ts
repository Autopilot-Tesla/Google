import { GoogleGenAI, Content, Part } from "@google/genai";
import { Message, UserSettings, Attachment, GroundingChunk } from "../types";

const API_KEY = process.env.API_KEY || '';

class GeminiService {
  private ai: GoogleGenAI | null = null;

  constructor() {
    if (API_KEY) {
      this.ai = new GoogleGenAI({ apiKey: API_KEY });
    }
  }

  isConfigured(): boolean {
    return !!this.ai;
  }

  async *streamResponse(
    history: Message[], 
    newMessage: string, 
    attachments: Attachment[],
    settings: UserSettings
  ): AsyncGenerator<{ text: string; groundingChunks?: GroundingChunk[] }, void, unknown> {
    if (!this.ai) {
      throw new Error("API Key is missing. Please configure process.env.API_KEY.");
    }

    const contents: Content[] = history.filter(m => !m.isError).map(m => {
      const parts: Part[] = [];
      if (m.attachments && m.attachments.length > 0) {
        m.attachments.forEach(att => {
          parts.push({
            inlineData: {
              mimeType: att.mimeType,
              data: att.data
            }
          });
        });
      }
      if (m.text) {
        parts.push({ text: m.text });
      }
      return {
        role: m.role,
        parts: parts
      };
    });

    const newParts: Part[] = [];
    if (attachments.length > 0) {
        attachments.forEach(att => {
            newParts.push({
                inlineData: {
                    mimeType: att.mimeType,
                    data: att.data
                }
            });
        });
    }
    newParts.push({ text: newMessage });
    
    contents.push({
      role: 'user',
      parts: newParts
    });

    const tools: any[] = [];
    if (settings.enableSearch) {
      tools.push({ googleSearch: {} });
    }

    const config: any = {
      tools: tools.length > 0 ? tools : undefined,
    };

    if (settings.enableThinking && settings.model.includes('pro')) {
        config.thinkingConfig = {
            thinkingBudget: settings.thinkingBudget
        };
    }

    try {
      const result = await this.ai.models.generateContentStream({
        model: settings.model,
        contents: contents,
        config: config
      });

      for await (const chunk of result) {
        const text = chunk.text || '';
        const groundingChunks = chunk.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] | undefined;
        yield { text, groundingChunks };
      }
    } catch (error: any) {
      console.error("Gemini API Error Detail:", error);
      
      let message = "An error occurred while communicating with Gemini.";
      
      if (error.message?.includes('400')) {
          message = "Bad Request (400). Please check your request, the model might not support this input or the image is too large.";
      } else if (error.message?.includes('401') || error.message?.includes('403')) {
          message = "Unauthorized (401/403). Invalid API Key or permissions.";
      } else if (error.message?.includes('429')) {
          message = "Too Many Requests (429). You have hit the rate limit.";
      } else if (error.message?.includes('500') || error.message?.includes('503')) {
          message = "Server Error (500/503). Google's services are currently experiencing issues.";
      } else if (error.message) {
          message = error.message;
      }
      
      throw new Error(message);
    }
  }
}

export const geminiService = new GeminiService();