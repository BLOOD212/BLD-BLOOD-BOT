import axios from 'axios';

let handler = async (m, { conn, args }) => {

    if (!args[0])
        return m.reply('⚠️ Inserisci un link TikTok!');

    let url = args[0];

    if (!url.includes('tiktok.com'))
        return m.reply('❌ Link TikTok non valido!');

    try {

        await m.reply('⏳ Scaricando video...');

        // Risolve redirect vm.tiktok
        const resolved = await axios.get(url, {
            maxRedirects: 5,
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        });

        const finalUrl = resolved.request.res.responseUrl;

        // API stabile
        const api = `https://www.tikwm.com/api/?url=${encodeURIComponent(finalUrl)}&hd=1`;

        const { data } = await axios.get(api, {
            headers: {
                'User-Agent': 'Mozilla/5.0'
            }
        });

        if (!data?.data?.play)
            return m.reply('❌ API non ha restituito il video.');

        await conn.sendMessage(m.chat, {
            video: { url: data.data.play },
            caption: `🎥 TikTok scaricato!

👤 ${data.data.author.nickname}
❤️ ${data.data.digg_count} like
👁️ ${data.data.play_count} views

> BLD-BLOOD`
        }, { quoted: m });

    } catch (err) {
        console.error("ERRORE TTDL:", err.response?.data || err.message);
        m.reply('❌ Errore VPS durante il download.');
    }
};

handler.help = ['ttdl <link>'];
handler.tags = ['downloader'];
handler.command = /^(ttdl)$/i;

export default handler;