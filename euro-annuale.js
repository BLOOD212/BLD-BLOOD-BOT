const annualReward = {
    euro: 1000,
    exp: 2500,
    diamond: 50,
};

var handler = async (m, { conn }) => {
    const lastClaim = global.db.data.users[m.sender].lastAnnualClaim || 0;
    const currentTime = new Date().getTime();
    const oneYear = 365 * 24 * 60 * 60 * 1000;

    if (currentTime - lastClaim < oneYear) {
        return conn.reply(m.chat, `『 🕚 』 *\`Hai già reclamato la tua ricompensa annuale. Torna tra ${msToTime(oneYear - (currentTime - lastClaim))}\`*`, m);
    }
    global.db.data.users[m.sender].euro += annualReward.euro;
    global.db.data.users[m.sender].money += annualReward.money;
    global.db.data.users[m.sender].diamond += annualReward.diamond;
    global.db.data.users[m.sender].exp += annualReward.exp;
    global.db.data.users[m.sender].lastAnnualClaim = currentTime;
    conn.reply(m.chat, `『 🎉 』 *\`Ricompensa reclamata\`*

    『 🧳 』*_Risorse:_*

『 🌟 』 \`Euro:\` *+${annualReward.euro}*
『 💎 』 \`Diamanti:\` *+${annualReward.diamond}*
『 ✨ 』 \`EXP:\` *+${annualReward.exp}*`, m);
}

handler.help = ['annuale'];
handler.tags = ['euro'];
handler.command = ['annuale'];
handler.group = true;
handler.register = true;
export default handler;

function msToTime(duration) {
    var milliseconds = parseInt((duration % 1000) / 100),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60),
    hours = Math.floor((duration / (1000 * 60 * 60)) % 24),
    days = Math.floor(duration / (1000 * 60 * 60 * 24));

    return `${days} Giorni ${hours < 10 ? '0' + hours : hours} Ore ${minutes < 10 ? '0' + minutes : minutes} Minuti ${seconds < 10 ? '0' + seconds : seconds} Secondi`;
}