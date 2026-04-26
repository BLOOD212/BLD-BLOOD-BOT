import OpenAI from 'openai';

// Usiamo Groq che è compatibile con la libreria OpenAI ma è GRATIS
class AIService {
  constructor(apiKey) {
    this.client = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://api.groq.com/openai/v1" // Questo sposta le chiamate su Groq
    });
    this.history = new Map();
    console.log('✅ [BOT-AI-GRATIS] Sistema pronto con Groq');
  }

  async generateReply({ messageText, authorName, chatId }) {
    if (!messageText) return null;
    
    const messages = [
      { role: 'system', content: "Sei Bot, un'IA britannica sarcastica e brillante." },
      { role: 'user', content: `${authorName}: ${messageText}` }
    ];

    try {
      const response = await this.client.chat.completions.create({
        model: "llama-3.3-70b-versatile", // Un modello potentissimo e gratuito
        messages
      });
      return response.choices[0].message.content;
    } catch (error) {
      console.error('❌ [AI-ERROR]:', error.message);
      return "Scusa, ho un corto circuito nei miei circuiti gratuiti.";
    }
  }
}

export function createAIService(apiKey) {
  return new AIService(apiKey);
}
