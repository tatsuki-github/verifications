'use client';

import { useEffect, useState } from 'react';
import { StreamingResponseData } from '@/types';

interface StreamingResponseProps {
  streamData: ReadableStream<Uint8Array> | null;
}

const StreamingResponse: React.FC<StreamingResponseProps> = ({ streamData }) => {
  const [content, setContent] = useState('');
  const [isStreamComplete, setIsStreamComplete] = useState(false);
  const [responseId, setResponseId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    if (!streamData) return;

    const reader = streamData.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';

    const processStream = async () => {
      try {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            setIsStreamComplete(true);
            break;
          }
          
          // デコードして現在のチャンクをバッファに追加
          buffer += decoder.decode(value, { stream: true });
          
          // 完全なSSEイベントを処理
          const events = buffer.split('\n\n');
          buffer = events.pop() || ''; // 最後の不完全なイベントを保持
          
          for (const event of events) {
            if (!event.trim()) continue;
            
            const lines = event.split('\n');
            const eventType = lines[0].replace('event: ', '');
            const data = lines[1].replace('data: ', '');
            
            if (data) {
              try {
                const parsedData = JSON.parse(data) as StreamingResponseData;
                
                if (parsedData.type === 'response.created' && parsedData.response?.id) {
                  setResponseId(parsedData.response.id);
                }
                
                if (parsedData.type === 'response.output_text.delta' && parsedData.delta) {
                  setContent(prev => prev + parsedData.delta);
                }
                
                if (parsedData.type === 'response.output_text.done' && parsedData.text) {
                  setContent(parsedData.text);
                }
              } catch (e) {
                console.error('Error parsing SSE data:', e);
              }
            }
          }
        }
      } catch (e) {
        console.error('Stream reading error:', e);
        setError('Error processing stream response');
      }
    };

    processStream();

    return () => {
      reader.cancel().catch(console.error);
    };
  }, [streamData]);

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  return (
    <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">Streaming Response</h2>
        {isStreamComplete ? (
          <span className="bg-green-100 text-green-800 px-2 py-1 text-xs rounded-full">
            Complete
          </span>
        ) : (
          <span className="bg-yellow-100 text-yellow-800 px-2 py-1 text-xs rounded-full flex items-center">
            <span className="animate-pulse h-2 w-2 bg-yellow-500 rounded-full mr-1"></span>
            Streaming
          </span>
        )}
      </div>
      
      {responseId && (
        <div className="mb-4 p-2 bg-blue-50 border border-blue-100 rounded-md">
          <p className="text-sm font-medium">Response ID: <span className="font-mono">{responseId}</span></p>
        </div>
      )}
      
      <div className="prose max-w-full">
        <div className="whitespace-pre-wrap">
          {content || (
            <span className="text-gray-400 italic">Waiting for response...</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default StreamingResponse;
