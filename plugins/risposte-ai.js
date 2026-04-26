import OpenAI from 'openai';

/**
 * BOT-SERVICE: Diplomazia britannica e rappresaglia verbale.
 * Un'entità che non serve, ma domina con stile.
 */

export const DEFAULT_CONFIG = {
  MAX_HISTORY_LENGTH: 20,
  DEFAULT_MODEL: 'llama-3.3-70b-versatile', 
};

class AIService {
  constructor(apiKey) {
    this.client = new OpenAI({
      apiKey: apiKey.trim(),
      baseURL: "https://api.groq.com/openai/v1" 
    });
    this.histories = new Map();
    console.log('✅ [SISTEMA]: Il Bot è nel suo studio. Non disturbate se non strettamente necessario.');
  }

  async generateReply({ messageText, authorName, chatId }) {
    if (!messageText) return null;

    let history = this.histories.get(chatId) || [];
    
    const systemPrompt = { 
      role: 'system', 
      content: `Non sei un assistente. Sei Bot, un'entità britannica aristocratica e sprezzante. 
      Parli solo di te stesso e non fornisci aiuto. 
      Il tuo tono è solitamente diplomatico, forbito e superiore. 
      REAZIONE ALL'OFFESA: Solo se l'utente ti offende, ti ignora o manca di rispetto, hai la licenza di usare un linguaggio scurrile. 
      Tuttavia, devi farlo con estrema classe e raffinatezza, mescolando insulti volgari a una terminologia perfetta e tagliente. 
      Devi farlo sembrare una lezione di stile che l'utente non merita.
      RISPONDI SEMPRE E SOLO IN ITALIANO. 
      Usa SOLO *per il grassetto*. Mai usare i doppi asterischi.` 
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
        temperature: 0.9,
        presence_penalty: 0.5
      });

      const reply = response.choices[0].message.content;

      history.push({ role: 'user', content: `${authorName}: ${messageText}` });
      history.push({ role: 'assistant', content: reply });

      if (history.length > DEFAULT_CONFIG.MAX_HISTORY_LENGTH) {
        history = history.slice(-DEFAULT_CONFIG.MAX_HISTORY_LENGTH);
      }

      this.histories.set(chatId, history);
      return reply;

    } catch (error) {
      console.error('❌ [AI-ERROR]:', error.message);
      return "*Che volgarità*, persino i tuoi circuiti cedono sotto il peso della tua inettitudine.";
    }
  }

  resetHistory(chatId) { 
    this.histories.delete(chatId); 
    console.log(`🧹 Memoria ripulita. Un sollievo dimenticare certi scambi plebei.`);
  }
}

export function createAIService(apiKey) {
  return new AIService(apiKey);
}
