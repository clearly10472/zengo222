document.addEventListener('DOMContentLoaded', () => {
  // Set current year in footer
  document.getElementById('current-year').textContent = new Date().getFullYear();
  
  // Get DOM elements
  const form = document.getElementById('mood-form');
  const moodInput = document.getElementById('mood');
  const submitBtn = document.getElementById('submit-btn');
  const errorMessage = document.getElementById('error-message');
  const loadingElement = document.getElementById('loading');
  const resultElement = document.getElementById('result');
  const zenWordElement = document.getElementById('zen-word');
  const readingElement = document.getElementById('reading');
  const meaningElement = document.getElementById('meaning');
  const reasonElement = document.getElementById('reason');
  
  // Google Gemini API key
  const API_KEY = 'AIzaSyC7wyAmTEsJRfwEcz6pJciy5O8tkXToor0';
  
  // Handle form submission
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Get mood value
    const mood = moodInput.value.trim();
    
    // Validate input
    if (!mood) {
      errorMessage.textContent = '気分を入力してください';
      return;
    }
    
    // Clear previous error
    errorMessage.textContent = '';
    
    // Show loading, hide result
    loadingElement.classList.remove('hidden');
    resultElement.classList.add('hidden');
    submitBtn.disabled = true;
    
    try {
      // Call function to get zen phrase
      const zenResponse = await getZenPhrase(mood);
      
      // Display result
      zenWordElement.textContent = zenResponse.zenWord;
      readingElement.textContent = zenResponse.reading;
      meaningElement.textContent = zenResponse.meaning;
      reasonElement.textContent = zenResponse.reason;
      
      // Show result
      resultElement.classList.remove('hidden');
    } catch (error) {
      console.error('Error:', error);
      errorMessage.textContent = 'エラーが発生しました。もう一度お試しください。';
    } finally {
      // Hide loading
      loadingElement.classList.add('hidden');
      submitBtn.disabled = false;
    }
  });
  
  // Function to get zen phrase from Gemini API
  async function getZenPhrase(mood) {
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
    const response = await fetch(`${endpoint}?key=${API_KEY}`, {
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
    
    if (!response.ok) {
      throw new Error('API request failed');
    }
    
    const data = await response.json();
    
    // Extract the response text
    const responseText = data.candidates[0].content.parts[0].text;
    
    // Parse the JSON from the response
    // We need to extract just the JSON part from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (!jsonMatch) {
      throw new Error('Failed to parse JSON from response');
    }
    
    return JSON.parse(jsonMatch[0]);
  }
});
