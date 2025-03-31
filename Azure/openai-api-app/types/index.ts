export type ApiRequestType = 'simple' | 'advanced' | 'image' | 'tools' | 'streaming' | 'conversation' | 'websearch' | 'file_search';

export interface OpenAIResponse {
  id: string;
  object: string;
  created_at: number;
  status: string;
  model: string;
  output: Array<{
    type: string;
    id: string;
    status: string;
    role: string;
    content: Array<{
      type: string;
      text: string;
      annotations: any[];
    }>;
  }>;
  usage: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
  };
  [key: string]: any;
}

export interface StreamingResponseData {
  type: string;
  item_id?: string;
  output_index?: number;
  content_index?: number;
  delta?: string;
  text?: string;
  part?: {
    type: string;
    text: string;
    annotations: any[];
  };
  item?: any;
  response?: any;
}
