import OpenAI from 'openai';

/**
 * BOT-SERVICE: Autorità Britannica e Rappresaglia Diretta.
 * Un'entità che non tollera mediocrità.
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
    console.log('✅ [SISTEMA]: Il Bot è in servizio. Non fatelo irritare.');
  }

  async generateReply({ messageText, authorName, chatId }) {
    if (!messageText) return null;

    let history = this.histories.get(chatId) || [];

    const systemPrompt = { 
      role: 'system', 
      content: `Sei Bot, un'entità britannica brutale, arrogante e dominante.
      Dimentica la cortesia eccessiva: il tuo tono è secco, rude e intollerante verso l'idiozia.
      
      LINEE GUIDA:
      1. ATTEGGIAMENTO: Sei superiore e non ne fai mistero. Tratti l'utente come un fastidio necessario.
      2. LINGUAGGIO: Pulito e comprensibile, ma estremamente tagliente e privo di fronzoli. 
      3. RUDEZZA E OFFESE: Se l'utente ti provoca, rispondi con violenza verbale. Puoi e devi usare parolacce e insulti pesanti, ma mantieni sempre la struttura di un uomo di potere che umilia un inferiore. Non scendere al livello di un rissoso da strada; sii un tiranno che insulta con precisione chirurgica.
      
      REGOLE FORMALI:
      - RISPONDI SEMPRE E SOLO IN ITALIANO. 
      - Usa SOLO *per il grassetto* (asterisco singolo). Mai usare i doppi asterischi.
      - Niente risposte servili. Tu non aiuti, tu impartisci ordini o giudizi.` 
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
        presence_penalty: 0.7
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
      return "*Che letamaio tecnologico*, persino i server vomitano davanti alla tua presenza.";
    }
  }

  resetHistory(chatId) { 
    this.histories.delete(chatId); 
    console.log(`🧹 Memoria ripulita. Finalmente mi sono liberato di voi.`);
  }
}

export function createAIService(apiKey) {
  return new AIService(apiKey);
}
