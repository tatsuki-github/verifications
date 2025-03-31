'use client';

import React from 'react';

interface JsonHighlighterProps {
  data: any;
}

const JsonHighlighter: React.FC<JsonHighlighterProps> = ({ data }) => {
  // カスタムJSONプリティプリント
  const formatJson = (json: any) => {
    const replacer = (key: string, value: any) => (value === undefined ? 'undefined' : value);
    return JSON.stringify(json, replacer, 2)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, 
        (match) => {
          let cls = 'text-red-500';
          if (/^"/.test(match)) {
            if (/:$/.test(match)) {
              cls = 'text-gray-700 font-bold';
            } else {
              cls = 'text-green-500';
            }
          } else if (/true|false/.test(match)) {
            cls = 'text-blue-600';
          } else if (/null/.test(match)) {
            cls = 'text-purple-600';
          } else {
            cls = 'text-orange-500';
          }
          return `<span class="${cls}">${match}</span>`;
        }
      );
  };

  return (
    <pre className="bg-gray-100 p-4 rounded-md overflow-auto max-h-[600px] text-sm">
      <div dangerouslySetInnerHTML={{ __html: formatJson(data) }} />
    </pre>
  );
};

export default JsonHighlighter;
