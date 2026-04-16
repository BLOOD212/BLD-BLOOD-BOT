const baseCoinReward = 20000;

var handler = async (m, { conn }) => {
    if (!m.isGroup) return m.reply("❌ Questo comando può essere usato solo nei gruppi.");

    let user = global.db.data.users[m.sender] || {};
    user.monthly = user.monthly || 0;

    const cooldown = 604800000 * 4;

    let timeRemaining = user.monthly + cooldown - new Date();

    if (timeRemaining > 0) {
        return m.reply(`⏱️ Hai già reclamato il tuo regalo mensile! Torna tra:\n *${msToTime(timeRemaining)}*`);
    }

    let coinReward = pickRandom([5000, 10000, 15000, 20000, baseCoinReward]);
    let euroReward = pickRandom([1, 2, 3, 4, 5]);
    let expReward = pickRandom([500, 1000, 1500, 2000, 2500]);
    let diamondReward = pickRandom([1, 2, 3]);

    user.coin = (user.coin || 0) + coinReward;
    user.euro = (user.euro || 0) + euroReward;
    user.exp = (user.exp || 0) + expReward;
    user.diamonds = (user.diamonds || 0) + diamondReward;

    m.reply(`
\`\`\`È passato un mese! Goditi il tuo regalo mensile! 『 🌸 』\`\`\`

『 🌟 』 *Euro* : +${euroReward}
『 ✨ 』 *Exp* : +${expReward}
『 💎 』 *Diamanti* : +${diamondReward}`);

    user.monthly = new Date * 1;
}

handler.help = ['mensile'];
handler.tags = ['euro'];
handler.command = ['mensile', 'monthly'];

export default handler;

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
}

function msToTime(duration) {
    var days = Math.floor(duration / (1000 * 60 * 60 * 24));
    var hours = Math.floor((duration % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

    return `${days} giorni ${hours} ore ${minutes} minuti`;
}