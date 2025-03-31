import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { requestType, inputData } = body;
    
    const apiKey = process.env.OPENAI_API_KEY;
    const baseUrl = process.env.OPENAI_API_BASE_URL;

    console.log('Request type:', requestType);
    console.log('Input data:', inputData);
    
    // ストリーミングレスポンスの場合は特別な処理を行う
    if (requestType === 'streaming') {
      const response = await fetch(`${baseUrl}/responses?api-version=2025-03-01-preview`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          input: inputData.input,
          stream: true,
        }),
      });
      
      return new NextResponse(response.body, {
        status: 200,
        headers: {
          'Content-Type': 'text/event-stream',
          'Cache-Control': 'no-cache',
          'Connection': 'keep-alive',
        },
      });
    }
    
    // 通常のAPI呼び出し
    let requestBody = {};
    
    switch (requestType) {
      case 'simple':
        requestBody = {
          model: 'gpt-4o',
          input: inputData.input,
        };
        break;
      
      case 'advanced':
        requestBody = {
          model: inputData.model || 'gpt-4o-mini',
          input: [
            {
              type: 'message',
              role: 'user',
              content: [
                {
                  type: 'input_text',
                  text: inputData.input,
                }
              ]
            }
          ],
          instructions: inputData.instructions,
          temperature: inputData.temperature || 0.7,
          max_output_tokens: inputData.max_tokens || 150,
        };
        break;
      
      case 'image':
        // Base64画像を処理
        requestBody = {
          model: 'gpt-4o-mini',
          input: [
            {
              role: 'user',
              content: [
                {
                  type: 'input_text',
                  text: inputData.input || 'Describe this image.',
                },
                {
                    type: 'input_image',
                    image_url: inputData.image_url,
                    detail: "high",
                },
              ]
            }
          ],
        };
        break;
      
      case 'tools':
        requestBody = {
          model: 'gpt-4o',
          input: inputData.input,
          tools: [
            {
              type: 'function',
              name: 'get_weather',
              description: 'Get current temperature for a given location.',
              parameters: {
                type: 'object',
                properties: {
                  location: {
                    type: 'string',
                    description: 'City and country e.g. Bogotá, Colombia'
                  }
                },
                required: ['location'],
                additionalProperties: false
              }
            }
          ],
        };
        break;
      
      case 'conversation':
        requestBody = {
          model: 'gpt-4o',
          input: inputData.input,
          previous_response_id: inputData.previous_response_id,
        };
        break;
        
      case 'websearch':
        requestBody = {
          model: 'gpt-4o-mini',
          input: inputData.input,
          tools: [
            {
              type: 'web_search_preview'
            }
          ]
        };
        break;
      
      case 'file_search':
        requestBody = {
          model: 'gpt-4o',
          input: inputData.input,
          tools: [
            {
              type: 'file_search',
              vector_store_ids: [inputData.vector_store_ids],
            }
          ]
        };
        break;
      
      default:
        return NextResponse.json({ error: 'Invalid request type' }, { status: 400 });
    }
    
    const response = await fetch(`${baseUrl}/responses?api-version=2025-03-01-preview`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error processing request:', error);
    return NextResponse.json(
      { error: 'An error occurred while processing your request' },
      { status: 500 }
    );
  }
}
