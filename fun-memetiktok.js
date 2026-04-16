const playAgainButtons = (prefix) => [
    {
        buttonId: `${prefix}meme`,
        buttonText: { displayText: '🎥 Altro Meme TikTok' },
        type: 1
    }
];

let handler = async (m, { conn, usedPrefix }) => {

    const cooldownKey = `tiktokmeme_${m.chat}`;
    const now = Date.now();
    const lastUse = global.cooldowns?.[cooldownKey] || 0;
    const cooldownTime = 5000;

    if (now - lastUse < cooldownTime) {
        const remaining = Math.ceil((cooldownTime - (now - lastUse)) / 1000);
        return m.reply(`⏳ Aspetta ${remaining}s prima di richiedere un altro meme!`);
    }

    global.cooldowns = global.cooldowns || {};
    global.cooldowns[cooldownKey] = now;

    const categorie = {
        meme: [
            "https://vm.tiktok.com/ZNRfPMFgv/",
            "https://vm.tiktok.com/ZNRfPL2Qb/",
            "https://vm.tiktok.com/ZNRffWdg6/",
            "https://vm.tiktok.com/ZNRffTVcs/",
            "https://vm.tiktok.com/ZNRfPFGPk/",
            "https://vm.tiktok.com/ZNRff7bbs/",
            "https://vm.tiktok.com/ZNRfPFxaH/",
            "https://vm.tiktok.com/ZNRff3mP3/"
        ],
        fail: [
            "https://vm.tiktok.com/ZNRff7wcy/",
            "https://vm.tiktok.com/ZNRffwAYD/",
            "https://vm.tiktok.com/ZNRffTeKx/",
            "https://vm.tiktok.com/ZNRfPjaaM/",
            "https://vm.tiktok.com/ZNRffEbrk/",
            "https://vm.tiktok.com/ZNRffoyY6/"
        ],
        dance: [
            "https://vm.tiktok.com/ZNRffKTXx/",
            "https://vm.tiktok.com/ZNRffKNjt/",
            "https://vm.tiktok.com/ZNRffw8wK/",
            "https://vm.tiktok.com/ZNRfPesF4/",
            "https://vm.tiktok.com/ZNRffEpwA/",
            "https://vm.tiktok.com/ZNRfPjeBn/"
        ],
        viral: [
            "https://vm.tiktok.com/ZNRffEWd7/",
            "https://vm.tiktok.com/ZNRffWos4/",
            "https://vm.tiktok.com/ZNRfPRmJV/",
            "https://vm.tiktok.com/ZNRffWHxT/",
            "https://vm.tiktok.com/ZNRfPFF7k/",
            "https://vm.tiktok.com/ZNRfP2cgm/"
        ],
        audio: [
            "https://vm.tiktok.com/ZNRff7Q7h/",
            "https://vm.tiktok.com/ZNRffnMx5/",
            "https://vm.tiktok.com/ZNRffnvHq/",
            "https://vm.tiktok.com/ZNRfP8Dga/",
            "https://vm.tiktok.com/ZNRffEWux/",
            "https://vm.tiktok.com/ZNRfP1y6F/"
        ]
    };

    const keys = Object.keys(categorie);
    const randomCategory = keys[Math.floor(Math.random() * keys.length)];
    const lista = categorie[randomCategory];
    const randomLink = lista[Math.floor(Math.random() * lista.length)];

    const emojiCategoria = {
        meme: "😂",
        fail: "💀",
        dance: "🕺",
        viral: "🔥",
        audio: "🎵"
    };

    await conn.sendMessage(m.chat, {
        text: `${emojiCategoria[randomCategory]} *TikTok ${randomCategory.toUpperCase()} Random!*\n\n🔗 ${randomLink}\n\n> usa: .ttdl (link) per scaricare il video`,
        buttons: playAgainButtons(usedPrefix),
        headerType: 1
    }, { quoted: m });
};

handler.help = ['tiktokmeme'];
handler.tags = ['divertimento'];
handler.command = /^(meme)$/i;
handler.group = true;

export default handler;