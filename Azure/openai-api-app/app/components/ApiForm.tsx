'use client';

import { useState, FormEvent, ChangeEvent } from 'react';
import { ApiRequestType } from '@/types';

interface ApiFormProps {
  onSubmit: (type: ApiRequestType, data: any) => Promise<void>;
  isLoading: boolean;
}

const ApiForm = ({ onSubmit, isLoading }: ApiFormProps) => {
  const [requestType, setRequestType] = useState<ApiRequestType>('simple');
  const [input, setInput] = useState('');
  const [model, setModel] = useState('gpt-4o-mini');
  const [instructions, setInstructions] = useState('');
  const [temperature, setTemperature] = useState(0.7);
  const [maxTokens, setMaxTokens] = useState(150);
  const [imageUrl, setImageUrl] = useState('');
  const [previousResponseId, setPreviousResponseId] = useState('');
  const [vectorStoreIds, setVectorStoreIds] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    let data = {};
    
    switch (requestType) {
      case 'simple':
        data = { input };
        break;
        
      case 'advanced':
        data = {
          input,
          model,
          instructions,
          temperature,
          max_tokens: maxTokens,
        };
        break;
        
      case 'image':
        data = {
          input,
          image_url: imageUrl,
        };
        break;
        
      case 'tools':
        data = { input };
        break;
        
      case 'streaming':
        data = { input };
        break;
        
      case 'conversation':
        data = {
          input,
          previous_response_id: previousResponseId,
        };
        break;
        
      case 'websearch':
        data = { input };
        break;

      case 'file_search':
        data = {
          input,
          vector_store_ids: vectorStoreIds,
        };
        break;
    }
    
    await onSubmit(requestType, data);
  };
  
  const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImageUrl(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow-md">
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Request Type</label>
        <select
          value={requestType}
          onChange={(e) => setRequestType(e.target.value as ApiRequestType)}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="simple">Simple Text Input</option>
          <option value="advanced">Advanced Options</option>
          <option value="image">Image Input</option>
          <option value="tools">Function/Tools</option>
          <option value="streaming">Streaming Response</option>
          <option value="conversation">Continue Conversation</option>
          <option value="websearch">Web Search</option>
          <option value="file_search">File Search</option>
        </select>
      </div>
      
      {/* Common input field */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">Input Text</label>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md min-h-[100px]"
          placeholder="Enter your prompt here..."
          required
        />
      </div>
      
      {/* Additional fields for specific request types */}
      {requestType === 'advanced' && (
        <>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Model</label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="gpt-4o">GPT-4o</option>
              <option value="gpt-4o-mini">GPT-4o-mini</option>
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Instructions</label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Optional instructions for the model..."
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Temperature: {temperature}
              </label>
              <input
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={temperature}
                onChange={(e) => setTemperature(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Max Tokens: {maxTokens}
              </label>
              <input
                type="range"
                min="50"
                max="1000"
                step="10"
                value={maxTokens}
                onChange={(e) => setMaxTokens(parseInt(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
        </>
      )}
      
      {requestType === 'image' && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Upload Image</label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full p-2 border border-gray-300 rounded-md"
          />
          {imageUrl && (
            <img src={imageUrl} alt="Uploaded" className="mt-2 max-h-40 rounded-md" />
          )}
        </div>
      )}
      
      {requestType === 'conversation' && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Previous Response ID</label>
          <input
            type="text"
            value={previousResponseId}
            onChange={(e) => setPreviousResponseId(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Enter previous response ID to continue conversation"
            required
          />
        </div>
      )}

      {requestType === 'file_search' && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">Vector Store IDs</label>
          <input
            type="text"
            value={vectorStoreIds}
            onChange={(e) => setVectorStoreIds(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Enter vector store IDs"
            required
          />
        </div>
      )}
      
      <div>
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${isLoading
            ? 'bg-gray-400'
            : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {isLoading ? 'Processing...' : 'Submit'}
        </button>
      </div>
    </form>
  );
};

export default ApiForm;
