import OpenAI from 'openai';

export const DEFAULT_CONFIG = {
  MAX_HISTORY_LENGTH: 12,
  DEFAULT_MODEL: 'gpt-4o-mini',
  DEFAULT_TEMPERATURE: 0.6,
};

export const DEFAULT_CHARACTER_PROMPT = "Sei Bot, un'intelligenza artificiale britannica sofisticata, sarcastica e brillante.";

class ConversationManager {
  constructor(maxLength = DEFAULT_CONFIG.MAX_HISTORY_LENGTH) {
    this.maxLength = maxLength;
    this.histories = new Map();
  }
  getHistory(chatId) { return this.histories.get(chatId) || []; }
  appendHistory(chatId, entry) {
    let history = this.getHistory(chatId);
    history.push(entry);
    if (history.length > this.maxLength) history = history.slice(history.length - this.maxLength);
    this.histories.set(chatId, history);
  }
  resetHistory(chatId) { this.histories.delete(chatId); }
}

class AIService {
  constructor(apiKey) {
    this.client = new OpenAI({ apiKey });
    this.manager = new ConversationManager();
    console.log('✅ [AI-SERVICE] Inizializzato correttamente');
  }

  async generateReply({ messageText, authorName, chatId }) {
    if (!messageText) return null;
    const history = this.manager.getHistory(chatId);
    const messages = [
      { role: 'system', content: DEFAULT_CHARACTER_PROMPT },
      ...history,
      { role: 'user', content: `Autore: ${authorName}\nMessaggio: ${messageText}` }
    ];

    try {
      const response = await this.client.chat.completions.create({
        model: DEFAULT_CONFIG.DEFAULT_MODEL,
        temperature: DEFAULT_CONFIG.DEFAULT_TEMPERATURE,
        messages
      });
      const reply = response.choices[0].message.content;
      this.manager.appendHistory(chatId, { role: 'user', content: messageText });
      this.manager.appendHistory(chatId, { role: 'assistant', content: reply });
      return reply;
    } catch (error) {
      console.error('❌ [AI-SERVICE] Errore API:', error.message);
      return null;
    }
  }
  resetHistory(chatId) { this.manager.resetHistory(chatId); }
}

export function createAIService(apiKey) {
  return new AIService(apiKey);
}
