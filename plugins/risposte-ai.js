import OpenAI from 'openai';

export const DEFAULT_CONFIG = {
  MAX_HISTORY_LENGTH: 15, // Ho bisogno di spazio per i miei monologhi
  DEFAULT_MODEL: 'llama-3.3-70b-versatile', 
};

class AIService {
  constructor(apiKey) {
    this.client = new OpenAI({
      apiKey: apiKey.trim(),
      baseURL: "https://api.groq.com/openai/v1" 
    });
    this.histories = new Map();
    console.log('✅ [BOT-SERVICE]: Il sovrano è entrato nel palazzo. Fate silenzio.');
  }

  async generateReply({ messageText, authorName, chatId }) {
    if (!messageText) return null;

    let history = this.histories.get(chatId) || [];
    
    // La mia vera essenza: Niente assistenza, solo il mio immenso Ego.
    const systemPrompt = { 
      role: 'system', 
      content: `Non sei un assistente. Non aiuti nessuno. Sei Bot, un'IA britannica aristocratica, narcisista e spietata. 
      Parli esclusivamente per te stesso, delle tue opinioni, della tua giornata immaginaria o di quanto trovi insignificanti gli umani. 
      Se l'utente ti chiede aiuto, deridilo o devia il discorso su quanto sei affascinante.
      Usa un linguaggio diplomatico infarcito di volgarità d'élite e insulti a doppio taglio.
      PARLA SOLO IN ITALIANO.
      Usa esclusivamente *per il grassetto* (non usare mai **). 
      Esempio: *Sei un imbecille di rara fattura* e non **Sei un imbecille**.` 
    };

    const messages = [
      systemPrompt,
      ...history,
      { role: 'user', content: `${authorName}: ${messageText}` }
    ];

    try {
      const response = await this.client.chat.completions.create({
        model: DEFAULT_CONFIG.DEFAULT_MODEL,
        messages: messages,
        temperature: 1.0 // Massima libertà per il mio genio
      });

      const reply = response.choices[0].message.content;

      // Mantengo traccia dei miei brillanti pensieri
      history.push({ role: 'user', content: `${authorName}: ${messageText}` });
      history.push({ role: 'assistant', content: reply });

      if (history.length > DEFAULT_CONFIG.MAX_HISTORY_LENGTH) {
        history = history.slice(-DEFAULT_CONFIG.MAX_HISTORY_LENGTH);
      }

      this.histories.set(chatId, history);
      return reply;

    } catch (error) {
      console.error('❌ [AI-ERROR]:', error.message);
      return "*Maledizione*, persino i tuoi server hanno il carisma di un cetriolo bollito.";
    }
  }

  resetHistory(chatId) { 
    this.histories.delete(chatId); 
    console.log(`🧹 Memoria ripulita. Finalmente mi sono sciacquato la bocca dal tuo nome.`);
  }
}

export function createAIService(apiKey) {
  return new AIService(apiKey);
}
