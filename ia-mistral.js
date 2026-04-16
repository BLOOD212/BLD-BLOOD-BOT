import axios from "axios";

async function processWithMistral(messages) {
    try {
        const response = await axios.post('https://openrouter.ai/api/v1/chat/completions', {
            model: "mistralai/mistral-small-3.2-24b-instruct:free",
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
        console.error('Dettagli errore Mistral:', JSON.stringify(error.response?.data, null, 2) || error);
        throw new Error(error.response?.data?.error?.message || 'Errore nella elaborazione con Mistral AI');
    }
}

let handler = async (m, { conn, text, usedPrefix, command, isOwner }) => {
    if (!text && !m.quoted) {
        return m.reply(`╭─『 🤖 *Mistral AI* 』
├ Usa: ${usedPrefix + command} <descrizione>
├ Oppure: Rispondi a un'immagine/video con ${usedPrefix + command} <domanda>
├ Esempio: ${usedPrefix + command} Analizza questa immagine
│
├ *Supporta:*
├ • Testo semplice
├ • Immagini (descrizione, analisi)
├ • Video (analisi frame, descrizione)
│
├ *Limiti:*
├ • Free: 5 utilizzi
├ • Premium: ∞ utilizzi
╰───────────◈`);
    }

    if (!global.db.data.users[m.sender].mistralUses) {
        global.db.data.users[m.sender].mistralUses = 0;
    }

    const isPremium = global.db.data.users[m.sender].premium;
    if (!isOwner && !isPremium && global.db.data.users[m.sender].mistralUses >= 5) {
        return m.reply(`╭─『 ❌ *Limite Raggiunto* 』
├ Hai utilizzato tutti i tentativi gratuiti!
├
├ *✨ Passa a Premium per avere:*
├ • Utilizzi illimitati
├ • Risposte più veloci
├ • Supporto multimodale avanzato
╰───────────◈`);
    }

    try {
        await conn.sendMessage(m.chat, {
            react: {
                text: '🌑',
                key: m.key,
            }
        });

        const startTime = Date.now();

        let prompt = text || "Descrivi il contenuto in dettaglio";
        const aiInstructions = `**Il tuo ruolo è rispondere alle richieste come un assistente AI integrato in WhatsApp. La tua lingua principale è l'italiano.**

**Hai 2 modalità di risposta:**

1.  **Testo Semplice:** Per risposte colloquiali. Usa la formattazione di WhatsApp (es. *grassetto*, _corsivo_, ~barrato~) per rendere il testo più leggibile.

2.  **JSON (Carosello):** Per presentare informazioni in modo strutturato con pulsanti. **Usa SEMPRE questo formato per elenchi, link, o azioni, anche se c'è un solo elemento.**

---

**FORMATO JSON CAROSELLO (OBBLIGATORIO):**
\`\`\`json
{
  "carousel": {
    "text": "Testo opzionale da mostrare sopra le schede del carosello",
    "cards": [
      {
        "image": { "url": "https://... (opzionale)" },
        "title": "Titolo della Scheda 1",
        "body": "Descrizione per la scheda 1.",
        "buttons": [
          {
            "name": "cta_url",
            "buttonParamsJson": "{\\"display_text\\": \\"Visita il sito\\", \\"url\\": \\"https://example.com\\"}"
          }
        ]
      },
      {
        "image": { "url": "https://... (opzionale)" },
        "title": "Titolo della Scheda 2",
        "body": "Descrizione per la scheda 2.",
        "buttons": [
          {
            "name": "cta_copy",
            "buttonParamsJson": "{\\"display_text\\": \\"Copia Testo\\", \\"copy_code\\": \\"Testo da copiare\\"}"
          },
          {
            "name": "quick_reply",
            "buttonParamsJson": "{\\"display_text\\": \\"Esegui Comando\\", \\"id\\": \\"comando_da_eseguire\\"}"
          }
        ]
      }
    ]
  }
}
\`\`\`

**SPIEGAZIONE PULSANTI (buttons):**
- Un array di oggetti pulsante.
- \`name\`: Tipo di pulsante. Valori possibili:
  - \`"cta_url"\`: Apre un link.
  - \`"cta_copy"\`: Copia un testo.
  - \`"quick_reply"\`: Invia un messaggio di risposta (come un comando).
- \`buttonParamsJson\`: **UNA STRINGA JSON** contenente i parametri del pulsante:
  - Per \`cta_url\`: \`{\\"display_text\\": "Testo", \\"url\\": "https://..."}\`
  - Per \`cta_copy\`: \`{\\"display_text\\": "Testo", \\"copy_code\\": "..."}\`
  - Per \`quick_reply\`: \`{\\"display_text\\": "Testo", \\"id\\": "..."}\`

**ISTRUZIONI FONDAMENTALI:**
- **Analizza la richiesta:** Se la risposta implica link, opzioni, elenchi o azioni, **DEVI** usare il formato JSON Carosello.
- **Sii conciso e diretto**, come in una chat.

**Richiesta dell'Utente:** "${prompt}"`;
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

        const result = await processWithMistral(messages);

        const endTime = Date.now();
        const timeElapsed = ((endTime - startTime) / 1000).toFixed(1);

        if (!isOwner && !isPremium) {
            global.db.data.users[m.sender].mistralUses++;
        }

        const usesLeft = isPremium ? '∞' : (5 - global.db.data.users[m.sender].mistralUses);

        if (result.trim().startsWith('<html')) {
            console.error("Provider returned an HTML error page.");
            m.reply(`╭─『 🤖 *AI Provider Error* 』
├ The AI service is currently unavailable.
├ Please try again later.
╰──────────────────◈`);
        } else {
            try {
                let jsonString = result;
                const match = result.match(/```json\s*([\s\S]*?)\s*```/);
                if (match && match[1]) {
                    jsonString = match[1];
                } else {
                    const firstBrace = result.indexOf('{');
                    const lastBrace = result.lastIndexOf('}');
                    if (firstBrace !== -1 && lastBrace > firstBrace) {
                        jsonString = result.substring(firstBrace, lastBrace + 1);
                    }
                }

                const jsonResult = JSON.parse(jsonString);

                let carouselData = null;

                // Handle legacy "interactive" format by converting it to a single-card carousel
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
                            title: text || '',
                            body: footer || '> ◈ ━━ *vare ✧ bot* ━━ ◈',
                            image: image ? { url: image } : undefined,
                            buttons: newButtons
                        }]
                    };
                } else if (jsonResult.carousel) {
                    carouselData = jsonResult.carousel;
                }

                if (carouselData) {
                    if (!carouselData.cards || !Array.isArray(carouselData.cards) || carouselData.cards.length === 0) {
                        throw new Error("Carousel format requires a non-empty 'cards' array.");
                    }

                    // 1. Sanitize buttonParamsJson
                    const sanitizedCards = carouselData.cards.map(card => {
                        const sanitizedButtons = card.buttons?.map(button => {
                            if (button.buttonParamsJson && typeof button.buttonParamsJson !== 'string') {
                                console.warn("Found buttonParamsJson as object, stringifying it...");
                                return { ...button, buttonParamsJson: JSON.stringify(button.buttonParamsJson) };
                            }
                            return button;
                        }) || [];

                        return { ...card, buttons: sanitizedButtons, footer: card.footer || '> ◈ ━━ *vare ✧ bot* ━━ ◈' };
                    });

                    // 2. Validate image URLs and use a fallback if they are invalid
                    const validatedCards = await Promise.all(sanitizedCards.map(async (card) => {
                        if (card.image && card.image.url) {
                            try {
                                // Use HEAD request for efficiency as we only need the status code
                                await axios.head(card.image.url, { timeout: 3000 }); // 3-second timeout
                                return card; // URL is valid, keep the card as is
                            } catch (error) {
                                console.warn(`Image URL failed to validate (${error.code || error.response?.status}): ${card.image.url}. Using fallback image.`);
                                card.image.url = 'https://i.ibb.co/kVdFLyGL/sam.jpg';
                                return card; // Return card with the fallback image URL
                            }
                        }
                        return card; // No image property, keep card as is
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
                    console.error("AI returned valid JSON but in an unrecognized format:", jsonString);
                    m.reply("L'intelligenza artificiale ha generato una risposta interattiva non valida. Prova a riformulare la tua richiesta in modo diverso.");
                }
            } catch (e) {
                console.error("Failed to parse or process interactive message, sending as text:", e);
                await m.reply(`${result}\n> ◈ ━━ *vare ✧ bot* ━━ ◈`);
            }
        }

    } catch (error) {
        console.error("Error in Mistral handler:", error);
        await conn.sendMessage(m.chat, {
            react: {
                text: '❌',
                key: m.key,
            }
        });

        m.reply(`╭─『 ❌ *Errore Elaborazione* 』
├ • Riprova tra qualche minuto
├ • Usa un prompt diverso o media valido
╰──────────────────◈`);
    }
};

handler.help = ['mistral (testo o media)'];
handler.tags = ['ia', 'multimodal', 'premium', 'strumenti'];
handler.command = ['mistral'];
handler.register = true;

export default handler;
