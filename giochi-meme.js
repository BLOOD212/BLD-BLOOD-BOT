import fetch from 'node-fetch';

let handler = async (m, { conn }) => {
    const tiktokLinks = [
        'https://www.tiktok.com/@chri_il.tiktoker/video/7488322661639048470',
        'https://www.tiktok.com/@chri_il.tiktoker/video/7490544488516209942',
        'https://www.tiktok.com/@giothevoice1988/video/7489032733876882710',
        'https://www.tiktok.com/@sawavy._/video/7494756488280395030',
        'https://www.tiktok.com/@clamo111/video/7495756421712055574',
        'https://www.tiktok.com/@videoacaso195/video/7473573450917924118',
        'https://www.tiktok.com/@flashy100k/video/7483289301195787550',
        'https://www.tiktok.com/@reallyrich.huncho/photo/7495533986266074390',
        'https://www.tiktok.com/@olaoflagos_/video/7494938150830148869',
        'https://www.tiktok.com/@lucianitoff142/video/7492922609726704951',
        'https://www.tiktok.com/@yarttweakproductions/photo/7491382666684697902',
        'https://www.tiktok.com/@2021donpollo/video/7491725495613066527',
        'https://www.tiktok.com/@ilcobradiroblox/video/7490505111811247382',
        'https://www.tiktok.com/@bologne.ali/video/7488067567655947542',
        'https://www.tiktok.com/@igorlukenyoficial/video/7481634980674669830',
        'https://www.tiktok.com/@sigmanev0/video/7486298284491918635',
        'https://www.tiktok.com/@anna.5177/video/7485410536037846294',
        'https://www.tiktok.com/@mango34563635/video/7482096295486803222',
        'https://www.tiktok.com/@2021donpollo/video/7483178076512324895',
        'https://www.tiktok.com/@primo.nero/video/7481250269502737686',
        'https://www.tiktok.com/@un_saluto13/video/7492406454566128918',
        'https://www.tiktok.com/@sandroercaciaraofficial/video/7473192729342659862',
        'https://www.tiktok.com/@rep_pet/video/7469887788226202902',
        'https://www.tiktok.com/@sfornacchi8/video/7473105695903141142',
        'https://www.tiktok.com/@moufakir77/video/7490600214835891478'
    ];

    global.db.data = global.db.data || {};
    global.db.data.memeVideo = global.db.data.memeVideo || {};
    let userId = m.sender;
    let userData = global.db.data.memeVideo[userId] || {};

    userData.views = userData.views || {};

    let available = tiktokLinks.filter(link => (userData.views[link] || 0) < 2);

    if (available.length === 0) {
        return m.reply('🎉 *Sei arrivato alla fine!*\nUsa il comando .sug per suggerire altri video.');
    }

    let randomTikTok = available[Math.floor(Math.random() * available.length)];

    let apiUrl = `https://www.tikwm.com/api/?url=${randomTikTok}?hd=1`;
    let res = await fetch(apiUrl);
    let json = await res.json();

    if (!json.data || !json.data.play) {
        return m.reply(`${global.errore}`);
    }

    userData.views[randomTikTok] = (userData.views[randomTikTok] || 0) + 1;
    global.db.data.memeVideo[userId] = userData;

    await conn.sendMessage(
        m.chat,
        {
            video: { url: json.data.play },
            caption: ""
        },
        { quoted: m }
    );
};

handler.help = ['meme'];
handler.tags = ['giochi'];
handler.command = ['meme'];

export default handler;