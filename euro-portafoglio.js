let handler = async (m, { conn, usedPrefix }) => {
    let who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.sender;
    if (who == conn.user.jid) return;
    if (!(who in global.db.data.users)) return conn.reply(m.chat, '『 ㌌ 』- \`Non sei nel mio database.\`', m);
    let user = global.db.data.users[who];
    const formatNumber = (num) => num.toLocaleString('it-IT');
    const totalEarned = user.totalEarned || 0;
    const highestBalance = user.highestBalance || user.euro;
    const rank = getRank(user.euro);
    const nextRank = getNextRank(user.euro);
    
    let messaggio = `
ㅤㅤ⋆｡˚『 ╭ \`PORTAFOGLIO\` ╯ 』˚｡⋆\n╭\n│
│ 『 👤 』 \`Utente:\` @${who.split('@')[0]}
│ 『 ${rank.emoji} 』 \`Rank:\` ${rank.name}
│ 
│ 『 💰 』 _Bilancio Attuale:_
│ • \`In portafoglio:\` 『 *${formatNumber(user.euro)}* 』
│ • \`In banca:\` 『 *${formatNumber(user.bank || 0)}* 』
│ • \`Totale:\` 『 *${formatNumber((user.euro + (user.bank || 0)))}* 』
│
│ 『 📊 』 _Statistiche Globali:_
│ • \`Record guadagno:\` 『 *${formatNumber(highestBalance)}* 』
│ • \`Prossimo rank:\` 『 ${nextRank.name} ${nextRank.emoji} 』
│ • \`Mancano:\` 『 *${formatNumber(nextRank.required - user.euro)}* 』
│
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`;

    await m.reply(messaggio, null, { mentions: [who] });
};
function getRank(euro) {
    if (euro >= 100000) return { name: '*CEO*', emoji: '💼' };
    if (euro >= 50000) return { name: '*Investitore*', emoji: '📈' };
    if (euro >= 25000) return { name: '*Avvocato*', emoji: '⚖️' };
    if (euro >= 10000) return { name: '*Ingegnere*', emoji: '🛠️' };
    if (euro >= 5000) return { name: '*Commesso*', emoji: '🛍️' };
    return { name: '*Tirocinante*', emoji: '🧑‍💼' };
}

function getNextRank(euro) {
    if (euro >= 100000) return { name: '*MAX*', emoji: '💼', required: 0 };
    if (euro >= 50000) return { name: '*CEO*', emoji: '💼', required: 100000 };
    if (euro >= 25000) return { name: '*Investitore*', emoji: '📈', required: 50000 };
    if (euro >= 10000) return { name: '*Avvocato*', emoji: '⚖️', required: 25000 };
    if (euro >= 5000) return { name: '*Ingegnere*', emoji: '🛠️', required: 10000 };
    return { name: '*Commesso*', emoji: '🛍️', required: 5000 };
}

handler.help = ['portafoglio'];
handler.tags = ['euro'];
handler.command = ['wallet', 'portafoglio', 'bilancio'];
handler.register = true;
export default handler;