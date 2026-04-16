import fetch from 'node-fetch';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';
import axios from 'axios';
import { createWriteStream, unlinkSync, createReadStream, mkdirSync } from 'fs';
import { join } from 'path';

const chatHistory = new Map();
const CONFIG = {
    aiName: 'Siri',
    microsoftVoice: 'it-IT-IsabellaNeural',
    aiModel: 'openai'
};
const aud = 50 * 1024 * 1024;
const erpollo = 1000;
const mpt = 600000;
const createSystemPrompt = (mentionName) => `
Sei Siri.
Interlocutore: ${mentionName}.
Tono: Ironico, rapido, Apple-style (leggermente snob).
Regole:
- Niente liste o markdown complessi.
- Sii impertinente se la domanda è stupida.
- Se ti chiedono chi sei: "Sono Siri, ovviamente."
`.trim();

async function transcribeAudio(audioBuffer) {
    const assemblykey = global.APIKeys.assemblyai;
    if (!assemblykey) return "Chiave API AssemblyAI non configurata.";
    let tempPath;
    try {
        if (audioBuffer.length > aud) {
            return "File audio troppo grande. Max 25MB";
        }
        mkdirSync(join(process.cwd(), 'temp'), { recursive: true });
        tempPath = join(process.cwd(), 'temp', `audio_${Date.now()}.ogg`);
        const writeStream = createWriteStream(tempPath);
        writeStream.write(audioBuffer);
        writeStream.end();
        await new Promise((resolve, reject) => {
            writeStream.on('finish', resolve);
            writeStream.on('error', reject);
        });
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
                        timeout: 5000
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
                timeout: 5000
            }
        );
        let transcriptResult;
        const startTime = Date.now();
        const maxPollingTime = mpt;
        while (Date.now() - startTime < maxPollingTime) {
            transcriptResult = await axios.get(
                `https://api.assemblyai.com/v2/transcript/${transcriptResponse.data.id}`,
                {
                    headers: { 'authorization': assemblykey },
                    timeout: 3000
                }
            );
            if (transcriptResult.data.status === 'completed') {
                return transcriptResult.data.text.trim();
            }
            if (transcriptResult.data.status === 'error') {
                throw new Error(transcriptResult.data.error || 'Errore durante la trascrizione');
            }
            await new Promise(r => setTimeout(r, erpollo));
        }
        throw new Error('Timeout: trascrizione troppo lunga');
    } catch (error) {
        console.error('Error transcribing audio:', error);
        return "Non ho capito l'audio.";
    } finally {
        if (tempPath) {
            try { unlinkSync(tempPath); } catch {}
        }
    }
}

async function sendAudio(_this, m, text) {
    const cleanText = text
        .replace(/[*_~`]/g, '')
        .replace(/[\n\r]/g, ' ')
        .replace(/[^\w\s\d,.:;?!àèéìòùÀÈÉÌÒÙ]/g, '')
        .trim();

    if (!cleanText) return;

    try {
        const tts = new MsEdgeTTS();
        await tts.setMetadata(CONFIG.microsoftVoice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
        const result = await tts.toStream(cleanText);
        const readable = result.audioStream;
        const audioBuffer = await streamToBuffer(readable);
        await _this.sendPresenceUpdate('recording', m.chat);
        await _this.sendMessage(m.chat, {
            audio: audioBuffer,
            mimetype: 'audio/mp4',
            ptt: true
        }, { quoted: m });
    } catch (err) {
        console.error('Error in Microsoft Edge TTS:', err.message);
        await m.reply(text);
    }
}

function streamToBuffer(stream) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        stream.on('data', (chunk) => chunks.push(chunk));
        stream.on('end', () => resolve(Buffer.concat(chunks)));
        stream.on('error', reject);
    });
}

let handler = m => m
handler.all = async function (m, {}) {
    let user = global.db.data.users[m.sender]
    let chat = global.db.data.chats[m.chat]
    m.isBot = m.id.startsWith('BAE5') && m.id.length === 16 ||
              m.id.startsWith('3EB0') && m.id.length === 12 ||
              m.id.startsWith('3EB0') && (m.id.length === 20 || m.id.length === 22) ||
              m.id.startsWith('B24E') && m.id.length === 20;

    if (m.isBot || !chat.vocali || chat.isBanned) return

    let isTriggered = false;
    let query = '';

    if (m.message?.audioMessage || m.message?.pttMessage) {
        isTriggered = true;
        let audioBuffer = await m.download()
        query = await transcribeAudio(audioBuffer)
    } else if (m.mentionedJid.includes(this.user.jid) || (m.quoted && m.quoted.sender === this.user.jid)) {
        isTriggered = true;
        query = m.text;
    }

    if (isTriggered && !m.fromMe && user.registered) {
        try {
            await this.sendPresenceUpdate('recording', m.chat)
            let username = m.pushName
            let chatId = m.chat
            let mentionName = username || 'Utente'

            if (!chatHistory.has(chatId)) chatHistory.set(chatId, []);
            let history = chatHistory.get(chatId);

            const messages = [
                { role: 'system', content: createSystemPrompt(mentionName) },
                ...history,
                { role: 'user', content: query }
            ];

            let aiResponse = null;
            try {
                const aiReq = await fetch('https://text.pollinations.ai/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        messages: messages,
                        model: CONFIG.aiModel,
                        seed: Math.floor(Math.random() * 1000)
                    }),
                    timeout: 8000
                });

                if (!aiReq.ok) throw new Error('AI Server Busy');

                aiResponse = await aiReq.text();
                aiResponse = aiResponse.trim();
            } catch (error) {
                console.error('AI Error:', error);
                aiResponse = "Scusa, al momento non riesco a rispondere.";
            }

            if (!aiResponse || aiResponse.trim().length === 0) {
                aiResponse = "Ho ricevuto il tuo messaggio.";
            }
            if (aiResponse.length > 3000) {
                aiResponse = aiResponse.substring(0, 3000) + '...';
            }

            history.push({ role: 'user', content: query });
            history.push({ role: 'assistant', content: aiResponse });
            if (history.length > 4) history = history.slice(-4);
            chatHistory.set(chatId, history);

            await sendAudio(this, m, aiResponse);
        } catch (e) {
            console.error('[ERRORE] Errore in bot-vocali:', e)
        }
    }

    return true;
}

export default handler
