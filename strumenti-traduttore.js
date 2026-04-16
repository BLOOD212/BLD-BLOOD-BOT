import fetch from 'node-fetch';

const languages = {
    'it': 'Italiano 『🇮🇹』', 'en': 'Inglese 『🇬🇧』', 'es': 'Spagnolo 『🇪🇸』', 'fr': 'Francese 『🇫🇷』',
    'de': 'Tedesco 『🇩🇪』', 'pt': 'Portoghese 『🇵🇹』', 'ru': 'Russo 『🇷🇺』', 'ja': 'Giapponese 『🇯🇵』',
    'ko': 'Coreano 『🇰🇷』', 'zh': 'Cinese 『🇨🇳』', 'ar': 'Arabo 『🇸🇦』', 'hi': 'Hindi 『🇮🇳』',
    'nl': 'Olandese 『🇳🇱』', 'pl': 'Polacco 『🇵🇱』', 'sv': 'Svedese 『🇸🇪』', 'tr': 'Turco 『🇹🇷』',
    'uk': 'Ucraino 『🇺🇦』', 'th': 'Thailandese 『🇹🇭』', 'vi': 'Vietnamita 『🇻🇳』', 'cs': 'Ceco 『🇨🇿』',
    'da': 'Danese 『🇩🇰』', 'fi': 'Finlandese 『🇫🇮』', 'no': 'Norvegese 『🇳🇴』', 'he': 'Ebraico 『🇮🇱』',
    'el': 'Greco 『🇬🇷』', 'hu': 'Ungherese 『🇭🇺』', 'id': 'Indonesiano 『🇮🇩』', 'ms': 'Malese 『🇲🇾』',
    'sk': 'Slovacco 『🇸🇰』', 'sl': 'Sloveno 『🇸🇮』', 'hr': 'Croato 『🇭🇷』', 'sr': 'Serbo 『🇷🇸』',
    'bg': 'Bulgaro 『🇧🇬』', 'ro': 'Rumeno 『🇷🇴』', 'lv': 'Lettone 『🇱🇻』', 'lt': 'Lituano 『🇱🇹』',
    'et': 'Estone 『🇪🇪』', 'mt': 'Maltese 『🇲🇹』', 'ga': 'Irlandese 『🇮🇪』', 'cy': 'Gallese 『🏴』',
    'is': 'Islandese 『🇮🇸』', 'bn': 'Bengalese 『🇧🇩』', 'ur': 'Urdu 『🇵🇰』', 'fa': 'Persiano 『🇮🇷』',
    'ta': 'Tamil 『🇱🇰』', 'te': 'Telugu 『🇮🇳』', 'kn': 'Kannada 『🇮🇳』', 'ml': 'Malayalam 『🇮🇳』',
    'gu': 'Gujarati 『🇮🇳』', 'pa': 'Punjabi 『🇮🇳』', 'mr': 'Marathi 『🇮🇳』', 'ne': 'Nepalese 『🇳🇵』',
    'si': 'Singalese 『🇱🇰』', 'my': 'Birmano 『🇲🇲』', 'km': 'Khmer 『🇰🇭』', 'lo': 'Lao 『🇱🇦』',
    'ka': 'Georgiano 『🇬🇪』', 'am': 'Amarico 『🇪🇹』', 'sw': 'Swahili 『🇰🇪』', 'zu': 'Zulu 『🇿🇦』',
    'af': 'Afrikaans 『🇿🇦』', 'sq': 'Albanese 『🇦🇱』', 'az': 'Azero 『🇦🇿』', 'be': 'Bielorusso 『🇧🇾』',
    'bs': 'Bosniaco 『🇧🇦』', 'eu': 'Basco 『🇪🇸』', 'gl': 'Galiziano 『🇪🇸』', 'ca': 'Catalano 『🇪🇸』',
    'mk': 'Macedone 『🇲🇰』', 'mn': 'Mongolo 『🇲🇳』', 'uz': 'Uzbeco 『🇺🇿』', 'kk': 'Kazako 『🇰🇿』',
    'ky': 'Kirghiso 『🇰🇬』', 'tg': 'Tagiko 『🇹🇯』', 'tt': 'Tataro 『🇷🇺』', 'hy': 'Armeno 『🇦🇲』',
    'lb': 'Lussemburghese 『🇱🇺』'
};

const max = 5000;
const maxtts = 200; // Ridotto per evitare problemi con TTS

const splitText = (text, maxLength) => {
    if (text.length <= maxLength) return [text];
    
    const chunks = [];
    let current = '';
    const sentences = text.split(/[.!?]+/);
    
    for (const sentence of sentences) {
        if ((current + sentence).length <= maxLength) {
            current += sentence + '.';
        } else {
            if (current) chunks.push(current.trim());
            current = sentence + '.';
        }
    }
    
    if (current) chunks.push(current.trim());
    return chunks;
};

// Funzione migliorata per generare audio TTS
const generateTTS = async (text, lang, conn, m) => {
    try {
        // Pulisce il testo da caratteri speciali
        const cleanText = text.replace(/[^\w\s.,!?àèìòùáéíóúäëïöüñç]/gi, '').trim();
        
        if (!cleanText) {
            throw new Error('Testo vuoto dopo la pulizia');
        }

        // Limita la lunghezza del testo per TTS
        const audioText = cleanText.length > maxtts ? cleanText.substring(0, maxtts) : cleanText;
        
        // Prova diverse API TTS in ordine di preferenza
        const ttsApis = [
            // API Google TTS con headers migliorati
            {
                name: 'Google TTS',
                url: `https://translate.google.com/translate_tts?ie=UTF-8&client=tw-ob&q=${encodeURIComponent(audioText)}&tl=${lang}&total=1&idx=0&textlen=${audioText.length}`,
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Referer': 'https://translate.google.com/',
                    'Accept': 'audio/mpeg, */*'
                }
            },
            // API alternativa
            {
                name: 'Alternative TTS',
                url: `https://api.voicerss.org/?key=demo&hl=${lang}&src=${encodeURIComponent(audioText)}&f=44khz_16bit_stereo`,
                headers: {}
            }
        ];

        let audioBuffer = null;
        let usedApi = null;

        for (const api of ttsApis) {
            try {
                console.log(`Tentando con ${api.name}...`);
                
                const response = await fetch(api.url, {
                    method: 'GET',
                    headers: {
                        ...api.headers,
                        'Accept': 'audio/mpeg, audio/wav, audio/ogg, */*'
                    },
                    timeout: 10000
                });

                if (response.ok) {
                    audioBuffer = await response.arrayBuffer();
                    
                    // Verifica che il buffer non sia vuoto
                    if (audioBuffer && audioBuffer.length > 100) {
                        usedApi = api.name;
                        console.log(`Successo con ${api.name}, dimensione: ${audioBuffer.length} bytes`);
                        break;
                    } else {
                        console.log(`${api.name} ha restituito un buffer troppo piccolo`);
                    }
                }
            } catch (apiError) {
                console.log(`${api.name} fallito:`, apiError.message);
                continue;
            }
        }

        if (!audioBuffer || audioBuffer.length <= 100) {
            throw new Error('Tutte le API TTS hanno fallito o restituito audio vuoto');
        }

        // Invia l'audio
        await conn.sendMessage(m.chat, {
            audio: audioBuffer,
            mimetype: 'audio/mpeg',
            ptt: true,
        }, { quoted: m });

        return true;

    } catch (error) {
        console.error('Errore generazione TTS:', error);
        await m.reply(`『 ❌ 』- Errore nella generazione dell'audio: ${error.message}`);
        return false;
    }
};

const handler = async (m, { conn, args, usedPrefix, command }) => {
    const helpMsg = `
    ㅤㅤ⋆｡˚『 ╭ \`TRADUTTORE\` ╯ 』˚｡⋆\n╭\n│
│ 📝 \`Esempi:\`
│ ┌─⭓ \`${usedPrefix + command}\` _Ciao_
│ ├─⭓ \`${usedPrefix + command}\` *en* _Ciao_
│ ├─⭓ \`${usedPrefix + command}\` *ja* _Hello_
│ ├─⭓ \`${usedPrefix + command}\` *[rispondi ad un msg]*
│ └─⭓ \`${usedPrefix}parla\` *ar* _testo_\n│
│ 🌍 \`Lingue disponibili:\`
${Object.entries(languages).map(([code, name]) => `*├─⭓* *${code}: ${name}*`).join('\n')}
│
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`;

    if (command === 'ascolta_originale' || command === 'ascolta_traduzione') {
        const lang = args[0];
        const text = args.slice(1).join(' ');

        if (!text) return m.reply('『 ❌ 』- Testo mancante per la generazione audio!');
        if (!lang) return m.reply('『 ❌ 』- Lingua non specificata per la generazione audio!');
        
        await m.react('🔊');
        const success = await generateTTS(text, lang, conn, m);
        
        if (success) {
            await m.react('✅');
        } else {
            await m.react('❌');
        }
        return;
    }

    if (!args[0] && !m.quoted?.text) {
        return m.reply(helpMsg);
    }

    let sourceLang = 'auto';
    let targetLang = 'it';
    let text = args.join(' ');
    let audioOnly = /^(parla|say)$/i.test(command);

    if (languages[args[0]?.toLowerCase()]) {
        targetLang = args[0].toLowerCase();
        sourceLang = 'auto'; 
        text = args.slice(1).join(' ');
    }

    if (!text && m.quoted?.text) {
        text = m.quoted.text;
    }

    if (!text) {
        return m.reply('『 ❌ 』- \`E che dovrei tradurre quindi?\`');
    }

    if (text.length > max) {
        return m.reply(`『 ❌ 』- \`Testo troppo lungo! Massimo ${max} caratteri.\`\n\`Il tuo testo ha ${text.length} caratteri.\``);
    }

    await m.react('⌛');

    try {
        const textChunks = splitText(text, 1000);
        let fullTranslation = '';
        let detectedLang = sourceLang;

        for (const chunk of textChunks) {
            const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(chunk)}`;
            const res = await fetch(url, {
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                }
            });
            const json = await res.json();
            
            if (json && json[0]) {
                const chunkTranslation = json[0].map(item => item[0]).join('');
                fullTranslation += chunkTranslation;
                
                if (!detectedLang || detectedLang === 'auto') {
                    detectedLang = json[2] || sourceLang;
                }
            }
        }

        await m.react('✅');

        if (audioOnly) {
            const success = await generateTTS(fullTranslation, targetLang, conn, m);
            if (!success) {
                await m.reply(`Traduzione: ${fullTranslation}`);
            }
        } else {
            // Prepara i testi per i pulsanti audio (più corti)
            const shortOriginal = text.substring(0, 50);
            const shortTranslation = fullTranslation.substring(0, 50);
            
            const originalButtonId = `.ascolta_originale ${detectedLang} ${shortOriginal}`;
            const translationButtonId = `.ascolta_traduzione ${targetLang} ${shortTranslation}`;

            const buttons = [
                { buttonId: originalButtonId, buttonText: { displayText: '🔊 Ascolta Originale' }, type: 1 },
                { buttonId: translationButtonId, buttonText: { displayText: '🎵 Ascolta Traduzione' }, type: 1 }
            ];

            const buttonMessage = {
                text: `
ㅤㅤ⋆｡˚『 ╭ \`TRADUTTORE\` ╯ 』˚｡⋆\n
┌─⭓ \`Da:\` *${languages[detectedLang] || detectedLang}*
└─⭓ \`A:\` *${languages[targetLang]}*

┌─⭓ \`Traduzione:\`
└─⭓ ${fullTranslation}
                `,
                footer: 'vare ✧ bot',
                buttons: buttons,
                headerType: 1
            };

            await conn.sendMessage(m.chat, buttonMessage, { quoted: m });
        }
    } catch (err) {
        console.error('Errore traduzione:', err);
        await m.react('❌');
        await m.reply(`${global.errore || 'Si è verificato un errore durante la traduzione.'}`);
    }
};

handler.help = ['traduci [lingua] [testo]', 'parla [lingua] [testo]'];
handler.tags = ['strumenti'];
handler.command = /^(traduttore|traduci|tr|traduzione|parla|ascolta_originale|ascolta_traduzione)$/i;
handler.register = true;

export default handler;