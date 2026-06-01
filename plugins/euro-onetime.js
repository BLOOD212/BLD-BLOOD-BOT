var handler = async (m, { conn }) => {
    const oneTimeReward = {
        euro: Math.floor(Math.random() * (9000 - 5500 + 1)) + 5500,
        exp: Math.floor(Math.random() * (39000 - 25000 + 1)) + 25000,
    };
    const hasClaimed = global.db.data.users[m.sender].hasClaimedOneTime || false;

    if (hasClaimed) {
        return conn.reply(m.chat, `『 ❌ 』- *Hai gia reclamato il regalo, se sei un poraccio è l'ora di fare gambling.*`, m);
    }
    global.db.data.users[m.sender].euro += oneTimeReward.euro;
    global.db.data.users[m.sender].exp += oneTimeReward.exp;
    global.db.data.users[m.sender].hasClaimedOneTime = true;
    conn.reply(m.chat, `『 🎉 』- *Ricompensa onetime reclamata*\n
『 🪙 - ✨ 』 _Risorse:_
- \`Euro:\` *+${oneTimeReward.euro}*
- \`EXP:\` *+${oneTimeReward.exp}*
\n> \`BLD-BOT\``, m);
};

handler.help = ['onetime'];
handler.tags = ['euro'];
handler.command = ['onetime'];
handler.register = false;

export default handler;