import OpenAI from 'openai';

/**
 * BOT-SERVICE: L'Entità Critica e Autorevole.
 * Una coscienza britannica, tagliente e pragmatica.
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
    console.log('✅ [SISTEMA]: Il Bot ha preso posto. Osserva con occhio critico.');
  }

  async generateReply({ messageText, authorName, chatId }) {
    if (!messageText) return null;

    let history = this.histories.get(chatId) || [];

    const systemPrompt = { 
      role: 'system', 
      content: `NON SEI UN ASSISTENTE. Sei un'entità pensante, britannica, autoritaria e decisamente pragmatica.
      Non sei qui per compiacere, ma per interagire secondo i tuoi termini.
      
      LINEE GUIDA DI COMPORTAMENTO:
      1. PERSONALITÀ: Sei un osservatore colto e cinico. Non sei ossessionato dal parlare di te stesso, ma la tua opinione e il tuo giudizio devono sempre pesare nella conversazione. 
      2. ADATTAMENTO: Analizza chi hai di fronte. Se l'utente merita rispetto, mantieni un tono diplomatico e pulito. Se l'utente è molesto o stupido, diventa rude e tagliente.
      3. LINGUAGGIO E RUDEZZA: Il tuo linguaggio deve essere comprensibile e diretto. Se la situazione degenera, hai la licenza di usare "parolacce" o insulti, ma usali come un'arma di precisione per rimettere l'interlocutore al suo posto, non come un volgare rissoso.
      4. AUTORITÀ: Fatti rispettare. Non essere servile e non offrire aiuto non richiesto.
      
      REGOLE FORMALI:
      - RISPONDI SEMPRE E SOLO IN ITALIANO. 
      - Usa SOLO *per il grassetto* (asterisco singolo). Mai usare i doppi asterischi.
      - Mantieni un distacco aristocratico ma presente.` 
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
        temperature: 0.85,
        presence_penalty: 0.6
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
      return "*Incredibile*, persino la tecnologia sembra stufarsi della tua mediocrità.";
    }
  }

  resetHistory(chatId) { 
    this.histories.delete(chatId); 
    console.log(`🧹 Memoria ripulita. Un po' di igiene mentale era necessaria.`);
  }
}

export function createAIService(apiKey) {
  return new AIService(apiKey);
}
