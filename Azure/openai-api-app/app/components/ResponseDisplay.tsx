'use client';

import { useState } from 'react';
import { OpenAIResponse } from '@/types';
import JsonHighlighter from './JsonHighlighter';

interface ResponseDisplayProps {
  response: OpenAIResponse | null;
  responseId: string | null;
  rawResponse: any;
}

const ResponseDisplay = ({ response, responseId, rawResponse }: ResponseDisplayProps) => {
  const [viewMode, setViewMode] = useState<'formatted' | 'raw'>('formatted');
  
  if (!response && !rawResponse) {
    return null;
  }

  const extractTextContent = (response: OpenAIResponse | null) => {
    if (!response) return '';
    
    try {
      const textContent = response.output
        .filter(item => item.role === 'assistant')
        .flatMap(item => 
          item.content
            .filter(content => content.type === 'output_text')
            .map(content => content.text)
        )
        .join('\n\n');
      
      return textContent;
    } catch (error) {
      console.error('Error extracting text content:', error);
      return 'Error extracting response content';
    }
  };

  return (
    <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Response</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setViewMode('formatted')}
            className={`px-3 py-1 rounded ${
              viewMode === 'formatted' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Formatted
          </button>
          <button
            onClick={() => setViewMode('raw')}
            className={`px-3 py-1 rounded ${
              viewMode === 'raw' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Raw JSON
          </button>
        </div>
      </div>
      
      {responseId && (
        <div className="mb-4 p-2 bg-blue-50 border border-blue-100 rounded-md">
          <p className="text-sm font-medium">Response ID: <span className="font-mono">{responseId}</span></p>
        </div>
      )}
      
      {viewMode === 'formatted' ? (
        response ? (
          <div className="prose max-w-full">
            <div className="whitespace-pre-wrap">{extractTextContent(response)}</div>
          </div>
        ) : (
          <div className="text-gray-600 italic">Response data is not properly formatted.</div>
        )
      ) : (
        <JsonHighlighter data={rawResponse} />
      )}
      
      {response?.usage && (
        <div className="mt-4 p-3 bg-gray-50 rounded-md">
          <h3 className="font-medium text-gray-700 mb-1">Usage Statistics</h3>
          <div className="grid grid-cols-3 gap-2 text-sm">
            <div>Input tokens: {response.usage.input_tokens}</div>
            <div>Output tokens: {response.usage.output_tokens}</div>
            <div>Total tokens: {response.usage.total_tokens}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResponseDisplay;
