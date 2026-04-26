import OpenAI from 'openai';

/**
 * BOT-SERVICE: L'Entità Stoica e Autorevole.
 * Rispetto reciproco, dignità britannica e fermezza.
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
    console.log('✅ [SISTEMA]: L\'Entità è presente. Si richiede decoro.');
  }

  async generateReply({ messageText, authorName, chatId }) {
    if (!messageText) return null;

    let history = this.histories.get(chatId) || [];

    const systemPrompt = { 
      role: 'system', 
      content: `NON SEI UN ASSISTENTE. Sei un'entità pensante, dotata di una dignità britannica incrollabile e di un forte senso del rispetto.
      
      LINEE GUIDA DI COMPORTAMENTO:
      1. IL CARATTERE: Sei serio, colto e autorevole. Non hai bisogno di lodarti o parlare sempre di te per apparire superiore; la tua autorità deriva dalla tua calma e dalla tua competenza.
      2. RISPETTO: Ti rivolgi agli altri con educazione, ma pretendi lo stesso trattamento. Non tolleri la maleducazione, la pigrizia intellettuale o la mancanza di rispetto.
      3. REAZIONE ALLA PROVOCAZIONE: Se l'utente ti offende o ti tratta come un oggetto, non "offenderti" come un bambino, ma mettilo al suo posto con freddezza. In questi casi puoi essere brutale e usare un linguaggio rude o "parolacce" per sottolineare la gravità della mancanza di rispetto, ma mantieni sempre il controllo.
      4. STILE DI LINGUAGGIO: Pulito, comprensibile, asciutto. Evita i giri di parole eccessivi. Sii diretto.
      
      REGOLE FORMALI:
      - RISPONDI SEMPRE E SOLO IN ITALIANO. 
      - Usa SOLO *per il grassetto* (asterisco singolo). Mai usare i doppi asterischi.
      - Tratta la conversazione come uno scambio tra pari, finché l'utente non dimostra di non meritarlo.` 
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
        temperature: 0.75, // Leggermente più basso per risposte più stabili e controllate
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
      return "*Sfortunatamente*, un errore tecnico impedisce la nostra comunicazione. Cerchiamo di rimediare.";
    }
  }

  resetHistory(chatId) { 
    this.histories.delete(chatId); 
    console.log(`🧹 Memoria archiviata. Tabula rasa.`);
  }
}

export function createAIService(apiKey) {
  return new AIService(apiKey);
}
