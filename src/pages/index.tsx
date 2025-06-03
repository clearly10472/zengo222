import { useState } from 'react';
import Head from 'next/head';
import axios from 'axios';

interface ZenResponse {
  zenWord: string;
  reading: string;
  meaning: string;
  reason: string;
}

export default function Home() {
  const [mood, setMood] = useState('');
  const [loading, setLoading] = useState(false);
  const [zenResponse, setZenResponse] = useState<ZenResponse | null>(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mood.trim()) {
      setError('気分を入力してください');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await axios.post('/api/zen', { mood });
      setZenResponse(response.data);
    } catch (err) {
      setError('エラーが発生しました。もう一度お試しください。');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zen-light">
      <Head>
        <title>今日の禅語 | 気分に合った禅語を提案</title>
        <meta name="description" content="あなたの今日の気分に合った禅語を提案します" />
        <link rel="icon" href="/favicon.ico" />
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+JP:wght@400;500;700&family=Noto+Serif+JP:wght@400;700&display=swap" rel="stylesheet" />
      </Head>

      <main className="container mx-auto px-4 py-12">
        <h1 className="text-4xl md:text-5xl font-serif text-zen-dark text-center mb-8">今日の禅語</h1>
        <p className="text-lg text-center text-zen-dark mb-12">あなたの今日の気分に合った禅語を提案します</p>
        
        <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6 mb-12">
          <form onSubmit={handleSubmit} className="mb-6">
            <div className="mb-4">
              <label htmlFor="mood" className="block text-zen-dark font-medium mb-2">今日の気分</label>
              <input
                type="text"
                id="mood"
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                placeholder="例: 疲れた、嬉しい、悩んでいる..."
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-zen-accent"
              />
            </div>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-zen-accent text-white py-2 px-4 rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50"
            >
              {loading ? '検索中...' : '禅語を探す'}
            </button>
          </form>
        </div>

        {zenResponse && (
          <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 border-t-4 border-zen-accent">
            <div className="mb-8 text-center">
              <h2 className="text-3xl md:text-4xl font-serif text-zen-dark mb-2">{zenResponse.zenWord}</h2>
              <p className="text-lg text-gray-600">{zenResponse.reading}</p>
            </div>
            <div className="mb-6">
              <h3 className="text-lg font-medium text-zen-dark mb-2">意味</h3>
              <p className="text-gray-700">{zenResponse.meaning}</p>
            </div>
            <div>
              <h3 className="text-lg font-medium text-zen-dark mb-2">選定理由</h3>
              <p className="text-gray-700">{zenResponse.reason}</p>
            </div>
          </div>
        )}
      </main>

      <footer className="bg-zen-dark text-white py-6 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p>© {new Date().getFullYear()} 今日の禅語</p>
        </div>
      </footer>
    </div>
  );
}
