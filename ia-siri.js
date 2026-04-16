import fetch from 'node-fetch';
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts';

const chatHistory = new Map();
const CONFIG = {
    aiName: 'Siri',
    microsoftVoice: 'it-IT-IsabellaNeural',
    aiModel: 'openai'
};
const createSystemPrompt = (mentionName) => `
Sei Siri.
Interlocutore: ${mentionName}.
Tono: Ironico, rapido, Apple-style (leggermente snob).
Regole:
- Massimo 1 frase breve.
- Niente liste o markdown complessi.
- Sii impertinente se la domanda è stupida.
- Se ti chiedono chi sei: "Sono Siri, ovviamente."
`.trim();

let handler = async (m, { conn, usedPrefix, command }) => {
    try {
        const text = m.text?.trim();
        if (!text) return;
        const question = text.replace(new RegExp(`^${usedPrefix}${command}`, 'i'), '').trim();
        if (!question) {
            return m.reply(`『 🍎 』- \`Chiedimi qualcosa.\`\n*Es:* *${usedPrefix}siri raccontami una freddura*`);
        }
        const chatId = m.chat;
        const mentionName = m.pushName || 'Utente';
        if (!chatHistory.has(chatId)) chatHistory.set(chatId, []);
        let history = chatHistory.get(chatId);
        const messages = [
            { role: 'system', content: createSystemPrompt(mentionName) },
            ...history,
            { role: 'user', content: question }
        ];
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
        
        let aiResponse = await aiReq.text();
        aiResponse = aiResponse.trim();
        history.push({ role: 'user', content: question });
        history.push({ role: 'assistant', content: aiResponse });
        if (history.length > 2) history = history.slice(-2); 
        chatHistory.set(chatId, history);
        try {
            await sendAudio(conn, m, aiResponse);
        } catch (err) {
            await m.reply(aiResponse);
        }

    } catch (e) {
        console.error('Siri Error:', e);
        m.reply('Non riesco a connettermi al server Apple. Riprova.');
    }
};
async function sendAudio(conn, m, text) {
    const cleanText = text
        .replace(/[*_~`]/g, '')
        .replace(/[\n\r]/g, ' ')
        .replace(/[^\w\s\d,.:;?!àèéìòùÀÈÉÌÒÙ]/g, '')
        .trim();

    if (!cleanText) return;
    await conn.sendPresenceUpdate('recording', m.chat);
    try {
        console.log('Using Microsoft Edge TTS...');
        const tts = new MsEdgeTTS();
        await tts.setMetadata(CONFIG.microsoftVoice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);
        const result = await tts.toStream(cleanText);
        const readable = result.audioStream;
        const audioBuffer = await streamToBuffer(readable);
        await conn.sendMessage(m.chat, {
            audio: audioBuffer,
            mimetype: 'audio/mp4',
            ptt: true
        }, { quoted: m });
        console.log('Microsoft Edge TTS succeeded.');
    } catch (err) {
        console.error('Error in Microsoft Edge TTS:', err.message);
        throw new Error('Audio generation failed');
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

handler.help = ['siri'];
handler.tags = ['ai'];
handler.command = /^(siri|siriia)$/i;
export default handler;