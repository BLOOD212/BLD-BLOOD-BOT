import OpenAI from 'openai';

export const DEFAULT_CONFIG = {
  MAX_HISTORY_LENGTH: 10,
  DEFAULT_MODEL: 'llama-3.3-70b-versatile', 
};

class AIService {
  constructor(apiKey) {
    // IMPORTANTE: baseURL deve essere esattamente questo per usare Groq
    this.client = new OpenAI({
      apiKey: apiKey,
      baseURL: "https://api.groq.com/openai/v1" 
    });
    this.histories = new Map();
    console.log('✅ [GROQ-SERVICE] Sistema inizializzato con successo');
  }

  async generateReply({ messageText, authorName, chatId }) {
    if (!messageText) return null;
    
    let history = this.histories.get(chatId) || [];
    const messages = [
      { role: 'system', content: "Sei Bot, un'intelligenza artificiale britannica sofisticata e sarcastica. Rispondi in italiano." },
      ...history,
      { role: 'user', content: `${authorName}: ${messageText}` }
    ];

    try {
      const response = await this.client.chat.completions.create({
        model: DEFAULT_CONFIG.DEFAULT_MODEL,
        messages: messages,
        temperature: 0.7
      });

      const reply = response.choices[0].message.content;
      
      // Memoria della conversazione
      history.push({ role: 'user', content: messageText });
      history.push({ role: 'assistant', content: reply });
      if (history.length > DEFAULT_CONFIG.MAX_HISTORY_LENGTH) history = history.slice(-DEFAULT_CONFIG.MAX_HISTORY_LENGTH);
      this.histories.set(chatId, history);

      return reply;
    } catch (error) {
      // Se vedi ancora 401 qui, significa che la chiave gsk_ è stata copiata male
      console.error('❌ [AI-ERROR]:', error.message);
      return null;
    }
  }
  resetHistory(chatId) { this.histories.delete(chatId); }
}

export function createAIService(apiKey) {
  return new AIService(apiKey);
}
