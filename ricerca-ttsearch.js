import axios from 'axios';

global.tiktokSeenVideosByChat = global.tiktokSeenVideosByChat || new Map();

let handler = async (m, { conn, usedPrefix, command, text }) => {
    if (!text) {
        return conn.reply(m.chat, `
ㅤㅤ⋆｡˚『 ╭ \`TITOLO?\` ╯ 』˚｡⋆\n╭\n│
│  \`inserisci il titolo del video.\`
│
│ 『 📚 』 \`Esempio d'uso:\`
│ *${usedPrefix}${command} edit massimo bossetti*
│
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`, m)
    }

    await m.react('🔍');

    try {
        let allFetchedVideos = await tiktoks(text);

        if (allFetchedVideos.length === 0) {
            return conn.reply(m.chat, `\`Non ho trovato nessun video per "${text}", Prova con una ricerca diversa\``, m)
        }
        let selectedVideos = allFetchedVideos.slice(0, 5);
        const cards = selectedVideos.map((video, index) => {
            const title = video.title ? video.title.replace(/#[^\s#]+/g, '').replace(/\s+/g, ' ').trim() : 'Video TikTok';
            const author = video.author?.unique_id || 'Utente TikTok';
            const views = video.play_count ? video.play_count.toLocaleString() : '?';
            const likes = video.digg_count ? video.digg_count.toLocaleString() : '?';
            const cover = video.cover || video.origin_cover || 'https://i.ibb.co/N25rgPrX/Gaara.jpg';
            const duration = video.duration ? `${Math.floor(video.duration / 60)}:${(video.duration % 60).toString().padStart(2, '0')}` : '?';
            
            return {
                video: { url: video.play },
                title: `\`${title.substring(0, 80) + (title.length > 80 ? '...' : '')}\``,
                body: `『 👤 』 *${author}*\n『 ⏱️ 』 *${duration}*\n『 👁️ 』 *${views} visual*\n『 ❤️ 』 ${likes} *mi piace*`,
                footer: '˗ˏˋ ☾ 𝚟𝚊𝚛𝚎𝚋𝚘𝚝 ☽ ˎˊ˗',
                buttons: [
                    {
                        name: "cta_url",
                        buttonParamsJson: JSON.stringify({
                            display_text: "📱 Apri su TikTok",
                            url: video.web_video_url || `https://www.tiktok.com/@${author}/video/${video.video_id}`
                        })
                    }
                ]
            };
        });

        await conn.sendMessage(
            m.chat,
            {
                text: `『 🔍 』 \`Risultati per:\` `,
                title: '',
                subtitle: 'varebot',
                footer: `*${text}*`,
                cards: cards
            },
            { quoted: m }
        );

    } catch (e) {
        console.error('ERRORE nella ricerca TikTok:', e.message || e);
        await conn.reply(m.chat, `${global.errore}`, m);
    }
};

handler.help = ['tts <testo>'];
handler.tags = ['ricerca'];
handler.command = ['ttsearch', 'tiktoksearch', 'tts'];
handler.register = true;

export default handler;

async function tiktoks(query) {
    try {
        const response = await axios({
            method: 'POST',
            url: 'https://tikwm.com/api/feed/search',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                'Cookie': 'current_language=it',
                'User-Agent': 'varebot/2.5'
            },
            data: {
                keywords: query,
                count: 20,
                cursor: 0,
                HD: 1
            }
        });

        const videos = response.data?.data?.videos;
        if (!videos || videos.length === 0) {
            return [];
        }

        const validVideos = videos.filter(v => v.play);
        return validVideos;
    } catch (error) {
        console.error("Errore nella funzione tiktoks (API TikTok):", error.message || error);
        return [];
    }
}