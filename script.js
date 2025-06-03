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
  
  // モックデータを使用するモード
  const USE_MOCK_DATA = true;
  
  // モックデータのセット
  const MOCK_DATA = [
    {
      "zenWord": "無心",
      "reading": "むしん",
      "meaning": "心に何も持たない状態。余計な思いや執着を捨て、自然体で物事に向き合う心の在り方。",
      "reason": "今の気分を忘れて、心を空っぽにすることで新たな気づきが生まれるかもしれません。"
    },
    {
      "zenWord": "一期一会",
      "reading": "いちごいちえ",
      "meaning": "人との出会いは一生に一度の機会と心得て、その瞬間を大切にするという教え。",
      "reason": "今この瞬間を大切にして、今の気分も一期一会の体験として受け入れてみてください。"
    },
    {
      "zenWord": "平常心",
      "reading": "へいじょうしん",
      "meaning": "日常の心。動揺せず、平静な心を保つこと。どんな状況でも心を乱さない心の状態。",
      "reason": "感情の起伏に振り回されず、穏やかな心を保つことで、バランスを取り戻せるでしょう。"
    },
    {
      "zenWord": "看脚下",
      "reading": "かんきゃっか",
      "meaning": "足元を見よ。目の前のことに集中し、今ここにある現実に向き合うこと。",
      "reason": "今の気分に囚われず、足元の現実を見つめ直すことで道が開けるかもしれません。"
    },
    {
      "zenWord": "随所作主",
      "reading": "ずいしょさくしゅ",
      "meaning": "どこにいても、その場の主となれ。環境に左右されず、自分の心の主人であれという教え。",
      "reason": "今の気分に支配されるのではなく、自分自身が主体性を持って状況に向き合うことが大切です。"
    }
  ];
  
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
      
      // Display detailed error message
      resultElement.classList.add('hidden');
      
      // Show more detailed error message if available
      let errorMessageText = 'エラーが発生しました。もう一度お試しください。';
      if (error.message) {
        // For development, show detailed error
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
          errorMessageText += `<br><small>詳細: ${error.message}</small>`;
        }
        // Log the detailed error to console regardless
        console.error('Error details:', error.message);
      }
      
      errorMessage.innerHTML = errorMessageText;
      errorMessage.classList.remove('hidden');
    } finally {
      // Hide loading
      loadingElement.classList.add('hidden');
      submitBtn.disabled = false;
    }
  });
  
  // Function to get zen phrase (using mock data or API)
  async function getZenPhrase(mood) {
    try {
      console.log('Getting zen phrase for mood:', mood);
      
      if (USE_MOCK_DATA) {
        // Use mock data instead of API call
        console.log('Using mock data');
        
        // Simple hash function to get a consistent but seemingly random result for the same input
        const getSimpleHash = (str) => {
          let hash = 0;
          for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) - hash) + str.charCodeAt(i);
            hash |= 0; // Convert to 32bit integer
          }
          return Math.abs(hash);
        };
        
        // Get a "random" index based on the mood string
        const index = getSimpleHash(mood) % MOCK_DATA.length;
        const zenData = MOCK_DATA[index];
        
        console.log('Selected mock data:', zenData);
        return zenData;
      } else {
        // This code path is not used when USE_MOCK_DATA is true
        throw new Error('API mode is disabled');
      }
    } catch (error) {
      console.error('Error getting zen phrase:', error);
      throw new Error(error.message || 'Failed to get zen phrase');
    }
  }
});
