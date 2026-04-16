import axios from 'axios';
import { createWriteStream, unlinkSync, createReadStream } from 'fs';
import { join } from 'path';
import { FormData } from 'formdata-node';

const aud = 25 * 1024 * 1024;
const img = 10 * 1024 * 1024;
const vid = 50 * 1024 * 1024;
const erpollo = 1000;
const mpt = 600000;
const opto = 25000;
const lingue = ['it', 'en', 'es', 'fr', 'de', 'pt'];

const requestCache = new Map();
const CACHE_TTL = 3600000;

function getCachedResult(key) {
    const cached = requestCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        return cached.result;
    }
    return null;
}

function setCachedResult(key, result) {
    requestCache.set(key, {
        result,
        timestamp: Date.now()
    });
}

setInterval(() => {
    const now = Date.now();
    for (const [key, value] of requestCache.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
            requestCache.delete(key);
        }
    }
}, CACHE_TTL);

function generateCacheKey(m, quoted) {
    const timestamp = Math.floor(Date.now() / 1000);
    const mediaId = quoted?.key?.id || quoted?.id || timestamp;
    return `${m.sender}_${mediaId}_${timestamp}`;
}

function createTimeoutPromise(ms, message = '『 ❌ 』- Timeout raggiunto, riprova più tardi..') {
    return new Promise((_, reject) => {
        setTimeout(() => reject(new Error(message)), ms);
    });
}

let handler = async (m, { conn, usedPrefix, command }) => {
    const ocrkey = global.APIKeys.ocrspace;
    const assemblykey = global.APIKeys.assemblyai;
    let tempPath;
    let operationStartTime = Date.now();

    try {
        if (!m.quoted) {
            return m.reply(`
ㅤㅤ⋆｡˚『 ╭ \`TRASCRIZIONE\` ╯ 』˚｡⋆\n╭\n│
│ 『 📝 』 - \`Uso:\` *${usedPrefix + command} rispondendo*
│                   *ad un audio/immagine/video*
│
│ 『 ⚠️ 』- _Limiti:_
│ ➤ \`Audio:\` *max 25MB*
│ ➤ \`Immagine:\` *max 10MB*
│ ➤ \`Video:\` *max 50MB*
│ ➤ \`Lingue supportate:\` *${lingue.join(', ')}*
│
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`);
        }

        const quoted = m.quoted;
        const mime = quoted.mimetype || '';

        if (!mime.includes('audio') && !mime.includes('image') && !mime.includes('video')) {
            throw new Error('\`Il messaggio deve essere un audio, immagine o video\`');
        }

        const cacheKey = generateCacheKey(m, quoted);
        const cachedResult = getCachedResult(cacheKey);
        if (cachedResult) {
            return m.reply(cachedResult);
        }

        await conn.sendPresenceUpdate('composing', m.chat);

        const operationPromise = (async () => {
            const media = await quoted.download();

            const maxSize = mime.includes('audio') ? aud : 
                           mime.includes('video') ? vid : 
                           img;

            if (media.length > maxSize) {
                throw new Error(`File troppo grande. Max ${mime.includes('audio') ? '25MB' : mime.includes('video') ? '50MB' : '10MB'}`);
            }

            if (mime.includes('audio') || mime.includes('video')) {
                const extension = mime.includes('audio') ? 'mp3' : 'mp4';
                tempPath = join(process.cwd(), 'temp', `media_${Date.now()}.${extension}`);

                const writeStream = createWriteStream(tempPath);
                writeStream.write(media);
                writeStream.end();

                let uploadResponse;
                for (let attempt = 0; attempt < 3; attempt++) {
                    try {
                        uploadResponse = await axios.post('https://api.assemblyai.com/v2/upload',
                            createReadStream(tempPath),
                            {
                                headers: {
                                    'authorization': assemblykey,
                                    'content-type': 'application/octet-stream',
                                    'transfer-encoding': 'chunked'
                                },
                                maxContentLength: Infinity,
                                maxBodyLength: Infinity,
                                timeout: Math.max(5000, opto - (Date.now() - operationStartTime))
                            }
                        );
                        break;
                    } catch (e) {
                        if (attempt === 2) throw new Error('Errore durante l\'upload del file');
                        await new Promise(r => setTimeout(r, 1000));
                    }
                }

                const transcriptResponse = await axios.post('https://api.assemblyai.com/v2/transcript',
                    {
                        audio_url: uploadResponse.data.upload_url,
                        language_detection: true,
                        speed_boost: false,
                        punctuate: true,
                        format_text: true
                    },
                    {
                        headers: {
                            'authorization': assemblykey,
                            'content-type': 'application/json'
                        },
                        timeout: Math.max(5000, opto - (Date.now() - operationStartTime))
                    }
                );

                let transcriptResult;
                const startTime = Date.now();
                const maxPollingTime = Math.min(mpt, opto - (Date.now() - operationStartTime));

                while (Date.now() - startTime < maxPollingTime) {
                    if (Date.now() - operationStartTime >= opto - 2000) {
                        throw new Error('Timeout: operazione troppo lunga');
                    }

                    transcriptResult = await axios.get(
                        `https://api.assemblyai.com/v2/transcript/${transcriptResponse.data.id}`,
                        {
                            headers: { 'authorization': assemblykey },
                            timeout: Math.max(3000, opto - (Date.now() - operationStartTime))
                        }
                    );

                    if (transcriptResult.data.status === 'completed') {
                        const detectedLang = transcriptResult.data.language_code || '?';
                        const confidence = transcriptResult.data.confidence || 0;
                        const duration = transcriptResult.data.audio_duration || 0;

                        const response = `『 📊 』 \`Accuratezza:\` *${(confidence * 100).toFixed(1)}%*\n` +
                            `『 📝 』 \`Testo:\`\n- ${transcriptResult.data.text.trim()}`;

                        setCachedResult(cacheKey, response);
                        return response;
                    }

                    if (transcriptResult.data.status === 'error') {
                        throw new Error(transcriptResult.data.error || 'Errore durante la trascrizione');
                    }

                    await new Promise(r => setTimeout(r, erpollo));
                }

                if (!transcriptResult?.data?.text) {
                    throw new Error('Timeout: trascrizione troppo lunga');
                }

            } else {
                
                const validImageMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp'];
                if (!validImageMimes.includes(mime)) {
                    throw new Error('Formato immagine non supportato. Usa JPEG, PNG, GIF o BMP.');
                }

                const formData = new FormData();
                formData.append('apikey', ocrkey);
                formData.append('language', 'ita');
                formData.append('OCREngine', '3');
                formData.append('scale', 'true');
                formData.append('detectOrientation', 'true');
                formData.append('isTable', 'true');
                const fileExtension = mime.split('/')[1] || 'jpg';
                formData.append('file', media, `image.${fileExtension}`);
                console.log('OCR FormData:', {
                    apikey: ocrkey.replace(/.(?=.{4})/g, '*'),
                    language: 'ita',
                    OCREngine: '3',
                    scale: 'true',
                    detectOrientation: 'true',
                    isTable: 'true',
                    fileExtension
                });

                let response;
                try {
                    response = await axios.post('https://api.ocr.space/parse/image',
                        formData,
                        {
                            headers: {
                                'accept': 'application/json'
                            },
                            timeout: Math.max(10000, opto - (Date.now() - operationStartTime))
                        }
                    );
                } catch (err) {
                    console.error('OCR API error:', err.response?.data);
                    if (err.response?.data?.ErrorMessage?.includes('language')) {
                        console.log('Retrying with language "eng"...');
                        formData.set('language', 'eng');
                        try {
                            response = await axios.post('https://api.ocr.space/parse/image',
                                formData,
                                {
                                    headers: {
                                        'accept': 'application/json'
                                    },
                                    timeout: Math.max(10000, opto - (Date.now() - operationStartTime))
                                }
                            );
                        } catch (err) {
                            console.error('OCR retry error:', err.response?.data);
                            throw new Error(err.response?.data?.ErrorMessage || 'Errore durante il tentativo con lingua eng');
                        }
                    } else {
                        throw new Error(err.response?.data?.ErrorMessage || 'Errore durante l\'elaborazione dell\'immagine');
                    }
                }

                if (!response.data.ParsedResults || response.data.IsErroredOnProcessing) {
                    console.error('OCR response:', response.data);
                    throw new Error(response.data.ErrorMessage || 'Errore durante l\'elaborazione dell\'immagine');
                }

                const result = response.data.ParsedResults[0];
                const text = result.ParsedText;
                let confidence = 0;
                if (result.TextOverlay?.Lines?.length > 0) {
                    let totalConf = 0;
                    let count = 0;
                    for (const line of result.TextOverlay.Lines) {
                        for (const word of line.Words) {
                            totalConf += word.WordConfidence;
                            count++;
                        }
                    }
                    confidence = count > 0 ? totalConf / count : 0;
                }

                if (!text.trim()) {
                    throw new Error('Nessun testo rilevato nell\'immagine');
                }

                const responseText = `『 📊 』 \`Accuratezza:\` *${(confidence * 100).toFixed(1)}%*\n` +
                                     `『 📝 』 \`Testo:\`\n- ${text.trim()}`;

                setCachedResult(cacheKey, responseText);
                return responseText;
            }
        })();

        const result = await Promise.race([
            operationPromise,
            createTimeoutPromise(opto)
        ]);
        await conn.sendMessage(m.chat, { text: result }, { quoted: m });

    } catch (e) {
        console.error('Errore elaborazione:', e);
        const isTimeout = e.message.includes('timeout') || e.message.includes('Timeout');
        const errorMsg = isTimeout ? `${global.errore}` : e.message;
        await m.react('❌');
        m.reply(errorMsg);
    } finally {
        if (tempPath) {
            try { unlinkSync(tempPath); } catch {}
        }
    }
};

handler.help = ['trascrivi', 'totext'];
handler.tags = ['strumenti'];
handler.command = ['trascrivi', 'totext'];
handler.register = true;

export default handler;
