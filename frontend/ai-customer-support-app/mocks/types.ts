/**
 * Type definitions for the AI customer support app
 */

export interface AIResponseContent {
  response: string;
  suggested_questions: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
}

export interface ChatResponse {
  id: string;
  role: 'assistant';
  content: string;
}

export interface MessagesResponse {
  messages: ChatMessage[];
} 