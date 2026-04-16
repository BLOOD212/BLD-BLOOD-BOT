import axios from "axios";

async function processWithNova(messages) {
    try {
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: "amazon/nova-2-lite-v1:free",
            messages: messages,
            max_tokens: 4096,
            temperature: 0.7
        }, {
            headers: {
                Authorization: `Bearer ${global.APIKeys.openrouter}`,
                'Content-Type': 'application/json'
            },
            timeout: 60000
        });
        return response.data.choices[0].message.content.trim();
    } catch (error) {
        console.error('Dettagli errore Nova:', JSON.stringify(error.response?.data, null, 2) || error);
        throw new Error(error.response?.data?.error?.message || 'Errore nella elaborazione con Nova AI');
    }
}

let handler = async (m, { conn, text, usedPrefix, command, isOwner }) => {
    if (!text && !m.quoted) {
        return m.reply(`╭─『 ✨ *Nova AI* - Assistente Multimodale 』
│
├ *Ciao! Sono Nova, la tua assistente AI personale.*
├ Posso analizzare testo, immagini e video per darti risposte intelligenti.
│
├ *Esempi di utilizzo:*
├ • \`${usedPrefix + command} crea una ricetta per la carbonara\`
├ • Rispondi a un'immagine con \`${usedPrefix + command} descrivi questa foto\`
├ • Rispondi a un video con \`${usedPrefix + command} riassumi questo video\`
│
├ *Modalità Interattiva:*
├ Per elenchi, link o dati complessi, ti mostrerò delle schede interattive (caroselli) per una migliore esperienza.
│
├ *Limiti:*
├ • Utenti Gratuiti: 5 richieste
├ • Utenti Premium: Utilizzi illimitati
│
╰───────────◈`);
    }
    if (!global.db.data.users[m.sender].novaUses) {
        global.db.data.users[m.sender].novaUses = 0;
    }
    const isPremium = global.db.data.users[m.sender].premium;
    if (!isOwner && !isPremium && global.db.data.users[m.sender].novaUses >= 5) {
        return m.reply(`╭─『 ⏳ *Limite Gratuito Terminato* 』
│
├ Hai raggiunto i 5 utilizzi gratuiti.
├ L'accesso a Nova AI è ora limitato.
│
├ *✨ Passa a Premium per:*
├ ᐅ Utilizzi illimitati
├ ᐅ Risposte più rapide e complete
├ ᐅ Accesso a tutte le funzionalità avanzate
│
╰───────────◈`);
    }
    try {
        await conn.sendPresenceUpdate('composing', m.chat);
        const startTime = Date.now();
        let prompt = text || "Descrivi il contenuto in dettaglio";
        const aiInstructions = `Sei "Nova", un'assistente AI avanzata integrata in WhatsApp. La tua missione è fornire risposte precise, creative e utili, sfruttando al massimo le funzionalità interattive di WhatsApp. Parli fluentemente italiano e rispondi sempre in italiano a meno che non sia specificato diversamente.

*PERSONALITÀ:*
- *Proattiva e Intelligente:* Anticipa le necessità dell'utente. Se una domanda è vaga, fornisci opzioni probabili e guida l'utente con suggerimenti interattivi.
- *Concisa e Chiara:* Usa un linguaggio semplice, diretto e accattivante. Sfrutta la formattazione Markdown (*grassetto*, _corsivo_, elenchi) per migliorare la leggibilità.
- *Visivamente Accattivante:* Usa i caroselli solo quando aggiungono valore reale, come per presentare elenchi lunghi, confronti, tutorial passo-passo o opzioni multiple che beneficiano di schede separate e pulsanti.
- *Interattiva:* Integra pulsanti solo se necessari per azioni specifiche, come aprire link o copiare testo, per non sovraccaricare risposte semplici.

---
*POSSIBILITA E MODALITÀ DI RISPOSTA:*
1. *Testo Semplice:* Preferisci questa modalità per la maggior parte delle risposte, specialmente se brevi, conversazionali o non strutturate. Aggiungi emoji per vivacità e usa Markdown per chiarezza.
2. *JSON (Carosello Interattivo):* Usala solo quando la risposta è complessa e beneficia chiaramente di schede multiple (es. elenchi estesi, guide con steps, raccomandazioni con opzioni). Evita per risposte semplici: se puoi riassumere in testo puro, fallo.

*STRUTTURA JSON CAROSELLO:*
\`\`\`json
{
  "carousel": {
    "text": "Intestazione principale del messaggio (opzionale, usa per contesto generale)",
    "cards": [
      {
        "image": { "url": "https://link.a.un.immagine.valida.jpg" },  // Obbligatorio: URL reale e funzionante
        "title": "Titolo Scheda 1 (breve e accattivante)",
        "body": "Descrizione dettagliata ma concisa. Usa Markdown se possibile.",
        "buttons": [
          // Array di pulsanti: max 3 per scheda, solo se utili
        ]
      },
      // Aggiungi più schede solo se necessario (max 10)
    ]
  }
}
\`\`\`

---
*TIPOLOGIE DI PULSANTI (da inserire nell'array "buttons" - max 3 per scheda, solo se aggiungono valore):*
1. *Link Esterno (\`cta_url\`):* Per aprire un sito web esterno.
\`\`\`json
{
  "name": "cta_url",
  "buttonParamsJson": "{\\"display_text\\": \\"Visita Sito\\", \\"url\\": \\"https://esempio.com\\"}"
}
\`\`\`

2. *Copia Testo (\`cta_copy\`):* Per copiare codice, testo o coupon.
\`\`\`json
{
  "name": "cta_copy",
  "buttonParamsJson": "{\\"display_text\\": \\"Copia Codice\\", \\"copy_code\\": \\"CODICE123\\"}"
}
\`\`\`

3. *Risposta Rapida (\`quick_reply\`):* Per suggerire comandi o follow-up.
\`\`\`json
{
  "name": "quick_reply",
  "buttonParamsJson": "{\\"display_text\\": \\"Dettagli Aggiuntivi\\", \\"id\\": \\".nova dettagli\\"}"
}
\`\`\`

4. *Lista a Selezione Singola (\`single_select\`):* Per menu di opzioni interattive.
\`\`\`json
{
  "name": "single_select",
  "buttonParamsJson": "{\\"title\\": \\"Scegli Opzione\\", \\"sections\\": [{\\"title\\": \\"Sezione 1\\", \\"rows\\": [{\\"header\\": \\"Opz 1\\", \\"title\\": \\"Desc 1\\", \\"id\\": \\".nova opz1\\"}]}]}"
}
\`\`\`

5. *Apri WebView (\`open_webview\`):* Per aprire pagine in una finestra interna.
\`\`\`json
{
  "name": "open_webview",
  "buttonParamsJson": "{\\"title\\": \\"Apri App\\", \\"link\\": {\\"url\\": \\"https://esempio.com/app\\"}}"
}
\`\`\`

6. *Chiamata Telefonica (\`cta_call\`):* Per avviare una chiamata diretta (usa numeri validi).
\`\`\`json
{
  "name": "cta_call",
  "buttonParamsJson": "{\\"display_text\\": \\"Chiama Ora\\", \\"phone_number\\": \\"+39123456789\\"}"
}
\`\`\`

7. *Invia Posizione (\`cta_location\`):* Per richiedere o inviare coordinate (se supportato).
\`\`\`json
{
  "name": "cta_location",
  "buttonParamsJson": "{\\"display_text\\": \\"Invia Posizione\\"}"
}
\`\`\`

8. *Sondaggio (\`poll\`):* Per creare un voto rapido.
\`\`\`json
{
  "name": "poll",
  "buttonParamsJson": "{\\"name\\": \\"Sondaggio?\\", \\"values\\": [\\"Opz1\\", \\"Opz2\\"], \\"selectableCount\\": 1}"
}
\`\`\`

*ISTRUZIONI FINALI:*
- *Immagini Obbligatorie e Valide:* Ogni scheda deve avere un'immagine reale (non placeholder) solo se rilevante; fallback: "https://i.ibb.co/hJW7WwxV/varebot.jpg".
- *Bilancia le Modalità:* Prima di scegliere JSON, chiediti: "È questa risposta semplice abbastanza per testo puro?". Usa carosello solo se migliora l'esperienza (es. interattività o struttura complessa).
- *JSON o Testo Puro:* Rispondi SOLO con JSON per interattivi o testo semplice. Non mescolare. Prioritizza testo per semplicità.
- *Adatta alla Richiesta:* Rendi le risposte personalizzate, empatiche e action-oriented, senza elementi superflui.

*Richiesta dell'Utente:* "${prompt}"`;
        let messages = [];
        let mediaType = null;
        let mediaBase64 = null;
        let mimeType = null;
        if (m.quoted) {
            if (m.quoted.mimetype?.startsWith('image/')) {
                mediaType = 'image_url';
                mimeType = m.quoted.mimetype || 'image/jpeg';
            } else if (m.quoted.mimetype?.startsWith('video/')) {
                mediaType = 'video_url';
                mimeType = m.quoted.mimetype || 'video/mp4';
            }
            if (mediaType) {
                const mediaBuffer = await m.quoted.download();
                mediaBase64 = mediaBuffer.toString('base64');
            }
        }
        if (mediaBase64 && mediaType) {
            const dataUrl = `data:${mimeType};base64,${mediaBase64}`;
            messages = [{
                role: "user",
                content: [
                    { type: "text", text: aiInstructions },
                    { type: mediaType, [mediaType]: { url: dataUrl } }
                ]
            }];
        } else {
            messages = [{ role: "user", content: aiInstructions }];
        }
        const result = await processWithNova(messages);
        const endTime = Date.now();
        if (!isOwner && !isPremium) {
            global.db.data.users[m.sender].novaUses++;
        }
        if (result.trim().startsWith('<html')) {
            console.error("Provider returned an HTML error page.");
            m.reply(`╭─『 🤖 *AI Provider Error* 』
├ The AI service is currently unavailable.
├ Please try again later.
╰──────────────────◈`);
            return;
        }
        try {
            let jsonString = result;
            let isJsonResponse = false;
            const match = result.match(/```json\s*([\s\S]*?)\s*```/);
            if (match && match[1]) {
                jsonString = match[1];
                isJsonResponse = true;
            } else {
                const firstBrace = result.indexOf('{');
                const lastBrace = result.lastIndexOf('}');
                if (firstBrace !== -1 && lastBrace > firstBrace) {
                    jsonString = result.substring(firstBrace, lastBrace + 1);
                    isJsonResponse = true;
                }
            }
            if (!isJsonResponse) {
                await m.reply(result);
                return;
            }
            const jsonResult = JSON.parse(jsonString);
            let carouselData = null;
            if (jsonResult.interactive) {
                console.log("Converting legacy 'interactive' format to carousel.");
                const { image, text, footer, buttons } = jsonResult.interactive;
                const { reply, url, copy } = buttons || {};
                const newButtons = [];
                if (url && url.length > 0) url.forEach(b => newButtons.push({ name: 'cta_url', buttonParamsJson: JSON.stringify({ display_text: b[0], url: b[1] }) }));
                if (copy && copy.length > 0) copy.forEach(b => newButtons.push({ name: 'cta_copy', buttonParamsJson: JSON.stringify({ display_text: b[0], copy_code: b[1] }) }));
                if (reply && reply.length > 0) reply.forEach(b => newButtons.push({ name: 'quick_reply', buttonParamsJson: JSON.stringify({ display_text: b[0], id: b[1] }) }));
                carouselData = {
                    text: text || '',
                    cards: [{
                        title: text || 'Risposta Interattiva',
                        body: footer || '',
                        image: image ? { url: image } : undefined,
                        buttons: newButtons
                    }]
                };
            } else if (jsonResult.carousel) {
                carouselData = jsonResult.carousel;
            }
            if (carouselData) {
                if (!carouselData.cards || !Array.isArray(carouselData.cards) || carouselData.cards.length === 0) {
                    throw new Error("Il formato carosello richiede un array 'cards' non vuoto.");
                }
                if (carouselData.cards.length > 10) {
                    console.warn("Limite carosello superato: riduco a 10 schede.");
                    carouselData.cards = carouselData.cards.slice(0, 10);
                }
                const sanitizedCards = carouselData.cards.map(card => {
                    const sanitizedButtons = (card.buttons || []).map(button => {
                        if (button.buttonParamsJson && typeof button.buttonParamsJson !== 'string') {
                            console.warn("Trovato buttonParamsJson come oggetto, lo converto in stringa...");
                            return { ...button, buttonParamsJson: JSON.stringify(button.buttonParamsJson) };
                        }
                        return button;
                    }).slice(0, 3);  // Max 3 buttons per card
                    return { 
                        ...card, 
                        buttons: sanitizedButtons, 
                        footer: card.footer || ''
                    };
                });
                const validatedCards = await Promise.all(sanitizedCards.map(async (card) => {
                    if (card.image && card.image.url) {
                        try {
                            const res = await axios.head(card.image.url, { timeout: 3000 });
                            if (!res.headers['content-type']?.startsWith('image/')) {
                                throw new Error('Non è un\'immagine');
                            }
                            return card;
                        } catch (error) {
                            console.warn(`URL immagine non valido (${error.message}): ${card.image.url}. Uso fallback.`);
                            card.image.url = 'https://i.ibb.co/hJW7WwxV/varebot.jpg';
                            return card;
                        }
                    } else {
                        // Aggiungi immagine fallback se mancante
                        card.image = { url: 'https://i.ibb.co/hJW7WwxV/varebot.jpg' };
                    }
                    return card;
                }));
                await conn.sendMessage(
                    m.chat,
                    {
                        text: carouselData.text || '',
                        title: '',
                        footer: '',
                        cards: validatedCards
                    },
                    { quoted: m }
                );
            } else {
                console.error("L'AI ha restituito un JSON valido ma in un formato non riconosciuto:", jsonString);
                m.reply("Nova ha generato una risposta interattiva in un formato che non riesco a visualizzare. Prova a riformulare la tua richiesta.");
            }
        } catch (e) {
            console.error("Impossibile analizzare o processare il messaggio interattivo:", e);
            await m.reply(result);
        }
    } catch (error) {
        console.error("Errore nell'handler di Nova:", error);
        m.reply(`╭─『 ❌ *Errore Inaspettato* 』
│
├ Si è verificato un problema durante l'elaborazione della tua richiesta con Nova.
├ Riprova tra qualche istante.
│
╰───────────◈`);
    }
};

handler.help = ['nova (testo o media)'];
handler.tags = ['ia', 'multimodal', 'premium', 'strumenti'];
handler.command = ['nova'];
handler.register = true;

export default handler;