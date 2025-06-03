import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

// Define the response type
type ZenResponse = {
  zenWord: string;
  reading: string;
  meaning: string;
  reason: string;
};

// Error response type
type ErrorResponse = {
  error: string;
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ZenResponse | ErrorResponse>
) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { mood } = req.body;
    
    if (!mood) {
      return res.status(400).json({ error: 'Mood is required' });
    }

    // Google Gemini API key from environment variable
    const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'AIzaSyC7wyAmTEsJRfwEcz6pJciy5O8tkXToor0';
    
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
    const response = await axios.post(
      `${endpoint}?key=${API_KEY}`,
      {
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
      }
    );

    // Extract the response text
    const responseText = response.data.candidates[0].content.parts[0].text;
    
    // Parse the JSON from the response
    // We need to extract just the JSON part from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      console.error('Failed to parse JSON from response:', responseText);
      return res.status(500).json({ error: 'Failed to parse response from AI' });
    }
    
    const zenData = JSON.parse(jsonMatch[0]);
    
    // Validate the response has all required fields
    if (!zenData.zenWord || !zenData.reading || !zenData.meaning || !zenData.reason) {
      console.error('Invalid response format:', zenData);
      return res.status(500).json({ error: 'Invalid response format from AI' });
    }
    
    // Return the Zen phrase data
    return res.status(200).json(zenData);
  } catch (error) {
    console.error('Error processing request:', error);
    return res.status(500).json({ error: 'Failed to process request' });
  }
}
