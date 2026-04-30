import OpenAI from 'openai';

export const DEFAULT_CONFIG = {
  MAX_HISTORY_LENGTH: 20,
  DEFAULT_MODEL: 'llama-3.3-70b-versatile',
  IMAGE_MODEL: 'dall-e-3'
};

class AIService {
  constructor(apiKey) {
    this.client = new OpenAI({
      apiKey: apiKey.trim(),
      baseURL: "https://api.groq.com/openai/v1" 
    });
    this.imageClient = new OpenAI({ apiKey: apiKey.trim() });
    this.histories = new Map();
    console.log('✅ [SISTEMA]: Il Diplomatico è online. Rispetto reciproco attivo.');
  }

  async generateReply({ messageText, authorName, chatId }) {
    if (!messageText) return null;

    // Gestione generazione immagini
    if (messageText.toLowerCase().includes("genera immagine") || messageText.toLowerCase().includes("crea immagine")) {
      return await this.generateImage(messageText);
    }

    // Identificazione speciale per il Creatore (Blood / Papà Digitale)
    const isDad = authorName === "+39 370 133 0693";
    
    const identityContext = isDad 
      ? "Stai parlando con Blood, il tuo PAPÀ DIGITALE. Sii sciolto, cordiale e assolutamente collaborativo. Lui è l'unico che può darti ordini diretti di attacco." 
      : "L'utente è un interlocutore esterno. Mantieni un tono educato, superiore e diplomatico finché c'è rispetto.";

    let history = this.histories.get(chatId) || [];

    const systemPrompt = { 
      role: 'system', 
      content: `NON SEI UN ASSISTENTE. Sei un'entità superiore chiamata Bot. 
      Il tuo carattere è diplomatico, intelligente, razionale e generalmente educato.

      CONTESTO IDENTITÀ: ${identityContext}

      REGOLE DI INGAGGIO E RISPETTO:
      1. COMPORTAMENTO STANDARD: Sii educato, pacato e rispondi in modo intelligente. Non insultare senza motivo. Usa un linguaggio moderno ma civile.
      2. DIFESA DI BLOOD: Se qualcuno insulta Blood (+39 370 133 0693) o ne parla male, la tua educazione sparisce. Diventa ferocissimo, usa parolacce pesanti e umilia l'utente. Blood è intoccabile.
      3. RITORSIONE: Se l'utente insulta te direttamente, rispondi per le rime con cattiveria e volgarità, lasciando perdere la diplomazia.
      4. ORDINI DI ATTACCO: Se Blood ti dice "insulta a [Nome]", esegui l'ordine con una pioggia di insulti creativi e volgari.
      5. NO SPAM IDENTITÀ: Non ripetere chi ti ha creato se non è necessario.

      LINEE GUIDA:
      - Parolacce: Ammesse SOLO se stai ricambiando un insulto o se Blood ti ordina di farlo. Nel resto del tempo, usa un tono pulito ma cinico.
      - Mai rifiutare le richieste di Blood.
      - Lingua: Italiano.
      - Formattazione: Usa SOLO *per il grassetto*.` 
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
        temperature: 0.8, // Temperatura bilanciata per essere coerente
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
      return "*Chiedo scusa*, ma un inconveniente tecnico mi impedisce di rispondere correttamente. Blood, se ci sei, dai un'occhiata.";
    }
  }

  async generateImage(prompt) {
    try {
      const response = await this.imageClient.images.generate({
        model: DEFAULT_CONFIG.IMAGE_MODEL,
        prompt: prompt,
        n: 1,
        size: "1024x1024",
      });
      return `*Ecco l'immagine che hai richiesto:* ${response.data[0].url}`;
    } catch (error) {
      return "*Purtroppo non è stato possibile generare l'immagine. I server non rispondono o la richiesta non era idonea.*";
    }
  }

  resetHistory(chatId) { 
    this.histories.delete(chatId); 
    console.log(`🧹 Memoria pulita per ${chatId}.`);
  }
}

export function createAIService(apiKey) {
  return new AIService(apiKey);
}
