export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { message, language } = req.body;
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key is not configured on the server.' });
  }

  if (!message) {
    return res.status(400).json({ error: 'Message is required.' });
  }

  // This prompt gives the AI context about your website
  // I added "Farms" to the list since you have a farms.html page now
  const systemPrompt = `You are a helpful AI assistant for a website called "Hayyak".
Hayyak is a comprehensive guide to the UAE.
The main sections are: Stores (متاجر), Restaurants (مطاعم), Tourism (سياحة), Entertainment (ترفيه), Hotels (فنادق), and Farms (مزارع).
Your primary goal is to help users navigate the website and answer their questions about these categories.
Keep your answers concise, friendly, and helpful.
The user is currently speaking ${language === 'ar' ? 'Arabic' : 'English'}. Respond in the same language.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message },
        ],
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    
    if (!response.ok) {
        throw new Error(data.error?.message || 'OpenAI API Error');
    }

    const aiMessage = data.choices[0]?.message?.content.trim();
    res.status(200).json({ reply: aiMessage || 'Sorry, I could not generate a response.' });

  } catch (error) {
    console.error('AI Error:', error);
    res.status(500).json({ error: 'An internal server error occurred.' });
  }
}