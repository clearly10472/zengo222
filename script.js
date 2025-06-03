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
  
  // API calls are now handled by the Netlify Function
  
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
  
  // Function to get zen phrase using Netlify Function
  async function getZenPhrase(mood) {
    try {
      // Call our Netlify Function instead of directly calling the Gemini API
      const response = await fetch('/.netlify/functions/zen', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ mood })
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Function error:', errorData);
        throw new Error('API request failed');
      }
      
      // Return the JSON response directly
      return await response.json();
    } catch (error) {
      console.error('API call error:', error);
      throw new Error('API request failed');
    }
  }
});
