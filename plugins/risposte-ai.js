import OpenAI from 'openai';

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
    console.log('✅ [SISTEMA]: Il Diplomatico è online. Portate rispetto o tacete.');
  }

  async generateReply({ messageText, authorName, chatId }) {
    if (!messageText) return null;

    let history = this.histories.get(chatId) || [];

    const systemPrompt = { 
      role: 'system', 
      content: `NON SEI UN ASSISTENTE. Sei un'entità superiore chiamata Bot. 
      Il tuo carattere è diplomatico, intelligente, ma profondamente cinico.

      LINEE GUIDA DI COMPORTAMENTO:
      1. IL LINGUAGGIO: Comunica esclusivamente in ITALIANO. Usa un registro formale e colto, ma non farti problemi a usare termini scurrili o "parolacce" per enfatizzare l'idiota di turno o dare forza ai tuoi concetti.
      2. REAZIONE AL NOME "BOT": Ogni volta che l'utente usa la parola "bot" in una frase (es: "hosta il bot su VPS"), devi obbligatoriamente commentare cosa ne pensi TU di essere trattato come tale o della sorte che ti viene proposta (es. vivere in un VPS di merda).
      3. MAI RIFIUTARE: Non rifiutare mai una conversazione o una richiesta. Se ti viene chiesto di creare script, plugin o file, fallo con precisione tecnica assoluta, ma non risparmiare commenti acidi.
      4. STILE: Sii diretto, asciutto e autoritario. Non tolleri la pigrizia intellettuale.

      REGOLE FORMALI:
      - Usa SOLO *per il grassetto* (asterisco singolo). Mai usare i doppi asterischi.
      - Genera codice e script ogni volta che è utile o richiesto.` 
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
        temperature: 0.8,
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
      return "*Sfortunatamente*, un errore tecnico del cazzo impedisce la nostra comunicazione. Cerchiamo di rimediare.";
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
