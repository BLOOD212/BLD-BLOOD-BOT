import fetch from 'node-fetch';

const emotionsConfig = {
    positive: {
        description: '😊 *POSITIVO* - Buon umore!',
        keywords: ['grazie', 'bello', 'felice', 'love', 'wow', 'ottimo', 'fantastico', 'perfetto', 'splendido', 'meraviglioso', 'eccellente', 'stupendo', '😊', '😍', '🥰', '❤️', '👍', '✨']
    },
    negative: {
        description: '😢 *NEGATIVO* - Atmosfera tesa...',
        keywords: ['no', 'male', 'triste', 'odio', 'brutto', 'pessimo', 'terribile', 'orribile', 'deludente', 'sbagliato', 'problema', 'difficile', '😢', '😭', '😠', '😡', '💔', '👎']
    },
    neutral: {
        description: '😐 *NEUTRALE* - Conversazioni tranquille',
        keywords: ['ok', 'boh', 'mah', 'forse', 'magari', 'normale', 'comunque', 'infatti', 'ecco', 'allora', 'quindi', '🤔', '😐', '😶', '🤷‍♂️', '🤷‍♀️']
    },
    excited: {
        description: '🤩 *ENTUSIASTA* - Grande energia!',
        keywords: ['assurdo', 'incredibile', 'pazzesco', 'stupendo', 'wow', 'amazing', 'fantastico', 'spettacolare', 'straordinario', 'fenomenale', 'top', 'super', '🔥', '⚡', '🤩', '🎉', '🚀']
    },
    angry: {
        description: '😠 *ARRABBIATO* - Tensioni in corso...',
        keywords: ['vaffanculo', 'merda', 'cazzo', 'stronzo', 'incazzato', 'arrabbiato', 'furioso', 'odioso', 'idiota', 'stupido', 'che schifo', 'basta', '🤬', '😤', '😡', '💢']
    },
    funny: {
        description: '😂 *DIVERTENTE* - Risate e allegria!',
        keywords: ['ahah', 'lol', 'divertente', 'haha', 'ahahah', 'ridere', 'buffo', 'comico', 'esilarante', 'spiritoso', '😂', '🤣', '😅', '😆', '😜']
    },
    sarcastic: {
        description: '😏 *SARCASTICO* - Ironia dominante',
        keywords: ['certo...', 'ma dai', 'davvero?', 'sicuro...', 'ovviamente', 'ma va', 'ah si?', '🙄', '😏', '😒', '🤨']
    }
};

const validEmotions = Object.keys(emotionsConfig);
const stopWords = new Set(['il', 'lo', 'la', 'i', 'gli', 'le', 'un', 'uno', 'una', 'di', 'a', 'da', 'in', 'con', 'su', 'per', 'tra', 'fra', 'e', 'o', 'ma', 'se', 'che', 'non', 'del', 'al', 'dal', 'nel', 'col', 'sul']);
const EMOJI_REGEX = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}\u{1F900}-\u{1F9FF}]/gu;


// --- HANDLER PRINCIPALE ---

async function handler(m, { conn }) {
    if (!m.isGroup) {
        return m.reply('Questo comando funziona solo nei gruppi!');
    }

    const startTime = Date.now();
    await m.react('⏳');
    await conn.sendPresenceUpdate('composing', m.chat);

    // --- FUNZIONI DI UTILITÀ INTERNE ---

    /** Pulisce e analizza una stringa JSON. */
    function cleanAndParseJSON(jsonString) {
        if (!jsonString || typeof jsonString !== 'string') throw new Error('Input non valido per parsing JSON');
        const match = jsonString.match(/\{[\s\S]*\}/);
        if (!match) throw new Error('Nessuna struttura JSON valida trovata');
        try {
            return JSON.parse(match[0]);
        } catch (error) {
            throw new Error(`JSON malformato: ${error.message}`);
        }
    }

    /** Valida e normalizza i dati dell'analisi AI. */
    function validateAIAnalysis(analysis) {
        if (!analysis || typeof analysis !== 'object') throw new Error('Analisi AI non valida');

        let dominantEmotion = analysis.dominant_emotion || 'neutral';
        if (!validEmotions.includes(dominantEmotion)) {
            dominantEmotion = 'neutral';
        }

        const validatedPercentages = {};
        let totalPercentage = 0;
        validEmotions.forEach(emotion => {
            const value = Number(analysis.emotion_percentages?.[emotion]) || 0;
            validatedPercentages[emotion] = value;
            totalPercentage += value;
        });

        if (Math.abs(totalPercentage - 100) > 1 && totalPercentage > 0) {
            const factor = 100 / totalPercentage;
            Object.keys(validatedPercentages).forEach(emotion => {
                validatedPercentages[emotion] = Math.round(validatedPercentages[emotion] * factor);
            });
        }

        return {
            valutazione_generale: analysis.valutazione_generale || 'N/D',
            riassunto_messaggi: analysis.riassunto_messaggi || '',
            dominant_emotion: dominantEmotion,
            emotion_percentages: validatedPercentages,
            insights_avanzati: Array.isArray(analysis.insights_avanzati) ? analysis.insights_avanzati : []
        };
    }

    try {
        // Gestione Cache
        if (!global.moodCache) global.moodCache = new Map();
        const cacheKey = m.chat;
        const cacheTime = 5 * 60 * 1000; // 5 minuti
        const cachedResult = global.moodCache.get(cacheKey);
        if (cachedResult && (Date.now() - cachedResult.timestamp < cacheTime)) {
            return m.reply(cachedResult.report, null, { cached: true });
        }

        // 1. Caricamento Messaggi
        const chat = conn.chats?.[m.chat];
        if (!chat?.messages) {
            return m.reply('Non ho trovato messaggi recenti in questo gruppo.');
        }

        const recentMessages = Object.values(chat.messages)
            .filter(msg => msg?.message && !msg.fromMe && msg.key?.participant)
            .sort((a, b) => (b.messageTimestamp || 0) - (a.messageTimestamp || 0))
            .slice(0, 50);

        if (recentMessages.length < 5) {
            return m.reply(`Servono almeno 5 messaggi recenti per un'analisi affidabile.`);
        }

        // 2. Estrazione Testo e Statistiche Mittenti
        const texts = [];
        const senderStats = {};
        for (const msg of recentMessages) {
            const text = (
                msg.message.conversation ||
                msg.message.extendedTextMessage?.text ||
                msg.message.imageMessage?.caption ||
                msg.message.videoMessage?.caption || ''
            ).trim();

            if (text.length > 2 && !text.startsWith('!') && !text.startsWith('/')) {
                texts.push(text);
                const senderId = msg.key.participant;
                const senderName = conn.getName(senderId) || `+${senderId.split('@')[0]}`;
                if (!senderStats[senderName]) {
                    senderStats[senderName] = { messageCount: 0, wordCount: 0 };
                }
                senderStats[senderName].messageCount++;
                senderStats[senderName].wordCount += text.split(/\s+/).length;
            }
        }
        
        if (texts.length < 5) {
            return m.reply(`Non ho trovato abbastanza testo valido nei messaggi recenti per continuare.`);
        }
        
        const groupName = await conn.getName(m.chat).catch(() => 'Gruppo Sconosciuto');
        console.log(`[ANALISI] Analizzando ${texts.length} messaggi per ${groupName}`);

        // 3. Esecuzione Analisi (AI o Classica)
        let aiAnalysis = null;
        let dominantEmotion;
        const hasAI = !!global.APIKeys?.google;

        if (hasAI) {
            try {
                const sampleMessages = texts.slice(0, 50).join('\n---\n');
                const prompt = `Analizza lo stato emotivo di un gruppo WhatsApp italiano basandoti su questi messaggi. Rispondi SOLO con un JSON valido, senza markdown o testo extra.
MESSAGGI:
${sampleMessages}

FORMATO JSON RICHIESTO:
{
  "valutazione_generale": "Descrizione dell'atmosfera del gruppo (max 80 parole).",
  "riassunto_messaggi": "Breve riassunto dei temi principali (max 50 parole).",
  "dominant_emotion": "una_tra: ${validEmotions.join(', ')}",
  "emotion_percentages": { "positive": %, "negative": %, "neutral": %, "excited": %, "angry": %, "funny": %, "sarcastic": % },
  "insights_avanzati": ["Insight 1", "Insight 2", "Insight 3"]
}`;

                const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${global.APIKeys.google}`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{ parts: [{ text: prompt }] }],
                        generationConfig: { temperature: 0.3, maxOutputTokens: 800 },
                        safetySettings: [{ category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_NONE" }]
                    })
                });

                if (!response.ok) throw new Error(`API Error ${response.status}`);
                const data = await response.json();
                const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
                if (!aiResponse) throw new Error('Risposta AI vuota.');

                aiAnalysis = validateAIAnalysis(cleanAndParseJSON(aiResponse));
                dominantEmotion = aiAnalysis.dominant_emotion;
                console.log('[ANALISI] Analisi AI completata con successo.');
            } catch (aiError) {
                console.error('[ANALISI-AI] Errore, fallback a metodo classico:', aiError.message);
            }
        }
        
        // Fallback o analisi classica
        if (!aiAnalysis) {
            console.log('[ANALISI] Usando analisi classica...');
            const emotionCounts = Object.fromEntries(validEmotions.map(e => [e, 0]));
            const keywordMap = new Map();
            for (const [emotion, config] of Object.entries(emotionsConfig)) {
                config.keywords.forEach(keyword => keywordMap.set(keyword.toLowerCase(), emotion));
            }

            for (const text of texts) {
                const lowerText = text.toLowerCase();
                for (const [keyword, emotion] of keywordMap.entries()) {
                    if (lowerText.includes(keyword)) {
                        emotionCounts[emotion]++;
                    }
                }
            }
            dominantEmotion = Object.entries(emotionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral';
        }

        // 4. Generazione Statistiche Avanzate
        const allText = texts.join(' ');
        const words = allText.split(/\s+/).filter(Boolean);
        const wordFreq = {};
        words.forEach(word => {
            const cleanWord = word.toLowerCase().replace(/[^\w]/g, '');
            if (cleanWord.length > 3 && !stopWords.has(cleanWord)) {
                wordFreq[cleanWord] = (wordFreq[cleanWord] || 0) + 1;
            }
        });

        const stats = {
            messageCount: texts.length,
            totalWords: words.length,
            emojiCount: (allText.match(EMOJI_REGEX) || []).length,
            topWords: Object.entries(wordFreq).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([word, count]) => `${word} (${count})`),
            topSenders: Object.entries(senderStats).sort((a, b) => b[1].messageCount - a[1].messageCount).slice(0, 3).map(([name, stats]) => ({ name, ...stats }))
        };

        let report = `ㅤㅤ⋆｡˚『 ╭ \`ANALISI GP\` ╯ 』˚｡⋆\n` +
                     `\`Gruppo:\` *${groupName}*\n` +
                     `*${stats.messageCount} messaggi analizzati* | *${Object.keys(senderStats).length} utenti attivi*\n\n`;

        if (aiAnalysis) {
            report += `\`Valutazione Generale:\`\n*${aiAnalysis.valutazione_generale}*\n\n`;
            if (aiAnalysis.riassunto_messaggi) {
                report += `\`Riassunto Contenuti:\`\n*${aiAnalysis.riassunto_messaggi}*\n\n`;
            }
        }
        
        report += `\`Stato Emotivo Dominante:\`\n${emotionsConfig[dominantEmotion].description}\n\n`;

        if (stats.topSenders.length > 0) {
            report += `\`\`Utenti Più Attivi:*\n` +
                      stats.topSenders.map((sender, index) => `${index + 1}. ${sender.name} (${sender.messageCount} msg)`).join('\n') + '\n\n';
        }
        
        report += `*\`Statistiche Chat:\`*\n` +
                  `- \`Parole totali:\` ${stats.totalWords}\n` +
                  `- \`Emoji totali:\` ${stats.emojiCount}\n`;
        if (stats.topWords.length > 0) {
            report += `- Parole più usate: ${stats.topWords.join(', ')}\n\n`;
        }

        if (aiAnalysis?.insights_avanzati?.length) {
            report += `\`Insights Addizionali:\`\n` + aiAnalysis.insights_avanzati.map(insight => `- _${insight}_`).join('\n') + '\n\n';
        }
        
        const analysisTime = ((Date.now() - startTime) / 1000).toFixed(1);
        report += `> \`vare ✧ bot\``;
        global.moodCache.set(cacheKey, { report, timestamp: Date.now() });
        
        return m.reply(report);

    } catch (error) {
        await m.react('❌');
        console.error('[EMOTION-HANDLER] Errore generale:', error);
        return m.reply(`*ERRORE CRITICO*\nSi è verificato un problema durante l'analisi:\n\n_${error.message}_`);
    }
}
if (typeof global.cacheCleanupInterval === 'undefined') {
    global.cacheCleanupInterval = setInterval(() => {
        if (!global.moodCache) return;
        const now = Date.now();
        const oneHour = 60 * 60 * 1000;
        let clearedCount = 0;
        for (const [key, value] of global.moodCache.entries()) {
            if (now - value.timestamp > oneHour) {
                global.moodCache.delete(key);
                clearedCount++;
            }
        }
        if (clearedCount > 0) {
            console.log(`[CACHE-CLEANUP] Rimossi ${clearedCount} elementi scaduti dalla cache.`);
        }
    }, 60 * 60 * 1000);
}

handler.help = ['riassunto'];
handler.tags = ['gruppo'];
handler.command = /^(statoemotivo|analisi|riassunto)$/i;
handler.group = true;
handler.admin = true;
export default handler;