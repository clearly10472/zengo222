// Netlify Function for proxying requests to Google Gemini API
// Import node-fetch explicitly
const fetch = require('node-fetch');

exports.handler = async function(event, context) {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const body = JSON.parse(event.body);
    const mood = body.mood;
    
    if (!mood) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Mood is required' })
      };
    }

    // Google Gemini API key
    const API_KEY = 'AIzaSyC7wyAmTEsJRfwEcz6pJciy5O8tkXToor0';
    
    // Gemini API endpoint
    const endpoint = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    
    // Prepare the prompt for Gemini
    const prompt = `
あなたは禅語に精通した仏教研究者です。利用者の「今日の気分」に合った禅語を一つ選び、
「禅語・読み方・意味・選定理由」の4項目を、以下のフォーマットに従って日本語で返してください。

必ず以下の4つすべてを含めてください：
- 禅語（例: 喫茶去）
- 読み方（ひらがな or カタカナ、例: きっさこ）
- 意味（120字以内でその禅語の意味や背景を説明）
- 選定理由（入力された気分に対してなぜこの禅語がふさわしいかを簡潔に説明）

また、同じ気分が何度入力されても、できるだけ違う禅語を毎回提示してください。

今日の気分: ${mood}

# 出力フォーマット（JSON形式で返してください）
{
  "zenWord": "<禅語>",
  "reading": "<読み方>",
  "meaning": "<禅語の簡潔な説明（120字以内）>",
  "reason": "<なぜこの気分にこの禅語が合っているのか（簡潔に）>"
}
`;

    // Make request to Gemini API
    console.log('Sending request to Gemini API with mood:', mood);
    let response;
    try {
      response = await fetch(`${endpoint}?key=${API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 1024
          }
        })
      });
    } catch (fetchError) {
      console.error('Fetch error:', fetchError);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to connect to Gemini API', details: fetchError.message })
      };
    }

    let data;
    try {
      data = await response.json();
      console.log('API response:', JSON.stringify(data));
    } catch (jsonError) {
      console.error('Error parsing JSON response:', jsonError);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to parse API response', details: jsonError.message })
      };
    }
    
    if (!response.ok) {
      console.error('API error:', data);
      return {
        statusCode: response.status,
        body: JSON.stringify({ error: 'Failed to get response from AI', details: data })
      };
    }
    
    // Check if the response has the expected structure
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
      console.error('Unexpected API response structure:', data);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Unexpected API response structure', details: data })
      };
    }
    
    // Extract the response text
    const responseText = data.candidates[0].content.parts[0].text;
    console.log('Response text:', responseText);
    
    // Parse the JSON from the response
    // We need to extract just the JSON part from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      console.error('Failed to parse JSON from response:', responseText);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to parse response from AI', responseText })
      };
    }
    
    let zenData;
    try {
      zenData = JSON.parse(jsonMatch[0]);
      console.log('Parsed zen data:', zenData);
    } catch (parseError) {
      console.error('Error parsing JSON from response text:', parseError, 'Response text:', responseText);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Failed to parse JSON from response', details: parseError.message, responseText })
      };
    }
    
    // Validate the parsed data
    if (!zenData.zenWord || !zenData.reading || !zenData.meaning || !zenData.reason) {
      console.error('Missing required fields in parsed data:', zenData);
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Missing required fields in response', zenData })
      };
    }
    
    // Return the Zen phrase data
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(zenData)
    };
  } catch (error) {
    console.error('Error processing request:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to process request' })
    };
  }
};
