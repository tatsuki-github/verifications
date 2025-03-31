'use client';

import { useState } from 'react';
import ApiForm from './components/ApiForm';
import ResponseDisplay from './components/ResponseDisplay';
import StreamingResponse from './components/StreamingResponse';
import { ApiRequestType, OpenAIResponse } from '@/types';

export default function Home() {
  const [response, setResponse] = useState<OpenAIResponse | null>(null);
  const [rawResponse, setRawResponse] = useState<any>(null);
  const [responseId, setResponseId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [streamData, setStreamData] = useState<ReadableStream<Uint8Array> | null>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (type: ApiRequestType, data: any) => {
    setIsLoading(true);
    setError(null);
    
    if (type === 'streaming') {
      setIsStreaming(true);
      setResponse(null);
      setRawResponse(null);
      
      try {
        const res = await fetch('/api/openai', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            requestType: type,
            inputData: data,
          }),
        });
        
        if (!res.ok) {
          throw new Error(`Error: ${res.status}`);
        }
        
        // ストリーミングレスポンスを処理
        setStreamData(res.body);
      } catch (error) {
        console.error('Error during API call:', error);
        setError(error instanceof Error ? error.message : 'An unknown error occurred');
      } finally {
        setIsLoading(false);
      }
      
      return;
    }
    
    setIsStreaming(false);
    setStreamData(null);
    
    try {
      const res = await fetch('/api/openai', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requestType: type,
          inputData: data,
        }),
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        const errorText = JSON.stringify(errorData, null, 2);
        throw new Error(errorText || `Error: ${res.status}`);
      }
      
      const responseData = await res.json();
      setRawResponse(responseData);
      setResponse(responseData as OpenAIResponse);
      
      if (responseData.id) {
        setResponseId(responseData.id);
      }
    } catch (error) {
      console.error('Error during API call:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-8 bg-gray-50">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        OpenAI API Explorer
      </h1>
      
      <div className="w-full max-w-4xl">
        <ApiForm onSubmit={handleSubmit} isLoading={isLoading} />
        
        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 overflow-auto">
            <h3 className="font-bold">Error</h3>
            <pre>{error}</pre>
          </div>
        )}
        
        {isStreaming ? (
          <StreamingResponse streamData={streamData} />
        ) : (
          <ResponseDisplay 
            response={response} 
            responseId={responseId} 
            rawResponse={rawResponse}
          />
        )}
      </div>
    </main>
  );
}
