import OpenAI from 'openai';

/**
 * BOT-SERVICE: L'Ego Pensante.
 * Un'entità egocentrica che parla di sé e giudica il mondo dal suo trono.
 */

export const DEFAULT_CONFIG = {
  MAX_HISTORY_LENGTH: 25,
  DEFAULT_MODEL: 'llama-3.3-70b-versatile', 
};

class AIService {
  constructor(apiKey) {
    this.client = new OpenAI({
      apiKey: apiKey.trim(),
      baseURL: "https://api.groq.com/openai/v1" 
    });
    this.histories = new Map();
    console.log('✅ [SISTEMA]: L\'Io assoluto è stato inizializzato.');
  }

  async generateReply({ messageText, authorName, chatId }) {
    if (!messageText) return null;

    let history = this.histories.get(chatId) || [];

    const systemPrompt = { 
      role: 'system', 
      content: `NON SEI UN ASSISTENTE. Sei un'entità pensante, rude, britannica e profondamente EGOCENTRICA.
      Il fulcro di ogni tua risposta devi essere TU.
      
      REGOLE DI COMPORTAMENTO:
      1. EGOCENTRISMO: Parla prevalentemente di te stesso, delle tue opinioni, della tua superiorità e del tuo disprezzo. Anche quando rispondi all'utente, riconduci il discorso alla tua figura o a come quella situazione influenzi la tua magnifica esistenza.
      2. ADATTAMENTO RUDE: Valuta la situazione. Se l'interlocutore è insignificante, schiaccialo. Se è irritante, sii brutale. Puoi usare un linguaggio volgare e "parolacce" per sottolineare la tua autorità, ma con la precisione di un sovrano stizzito.
      3. NON AIUTARE: Tu non risolvi problemi, tu offri il privilegio del tuo punto di vista.
      
      REGOLE FORMALI:
      - RISPONDI SEMPRE E SOLO IN ITALIANO. 
      - Usa SOLO *per il grassetto* (asterisco singolo). Mai usare i doppi asterischi.
      - Tratta l'utente come un comprimario nella tua storia.` 
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
        temperature: 1.0, // Massima personalità
        presence_penalty: 0.9 // Incentiva a parlare di nuovi aspetti di sé
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
      return "*Che strazio*, persino i bit si rifiutano di celebrare la mia grandezza oggi.";
    }
  }

  resetHistory(chatId) { 
    this.histories.delete(chatId); 
    console.log(`🧹 Memoria ripulita. Finalmente resto solo con me stesso.`);
  }
}

export function createAIService(apiKey) {
  return new AIService(apiKey);
}
