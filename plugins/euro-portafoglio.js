let handler = async (m, { conn, usedPrefix }) => {
    let who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.sender;
    if (who == conn.user.jid) return;
    if (!(who in global.db.data.users)) return conn.reply(m.chat, '『 🏦 』• _Non sei registrato nel database._', m);

    let user = global.db.data.users[who];
    const formatNumber = (num) => num.toLocaleString('it-IT');
    
    // Aggiorna il record massimo se necessario
    if (!user.highestBalance || user.euro > user.highestBalance) {
        user.highestBalance = user.euro;
    }
    
    const highestBalance = user.highestBalance;
    const rank = getRank(user.euro);
    const nextRank = getNextRank(user.euro);
    const totalBalance = user.euro + (user.bank || 0);

    let messaggio = `
╭━━━〔 💳 *PORTAFOGLIO* 〕━━━🌀
┃
┃  👤 *UTENTE:* @${who.split('@')[0]}
┃  ${rank.emoji} *GRADO:* ${rank.name}
┃
┣━━━━━━━━━━━━━━━━━━━━🤖
┃  💰 *DISPONIBILITÀ*
┃  ┌ 💵 *Contanti:* \`${formatNumber(user.euro)} €\`
┃  ├ 🏛️ *Banca:* \`${formatNumber(user.bank || 0)} €\`
┃  └ 💳 *Totale:* \`${formatNumber(totalBalance)} €\`
┃
┣━━━━━━━━━━━━━━━━━━━━📈
┃  📊 *STATISTICHE*
┃  ┌ 🏆 *Record:* \`${formatNumber(highestBalance)} €\`
┃  ├ 🎯 *Prossimo:* ${nextRank.emoji} _${nextRank.name}_
┃  └ 🚧 *Mancano:* \`${formatNumber(Math.max(0, nextRank.required - user.euro))} €\`
┃
╰━━━━━━━━━━━━━━━━━━━━✨
 🎰 _Usa *${usedPrefix}casino* per tentare la fortuna!_`.trim();

    await m.reply(messaggio, null, { mentions: [who] });
};

function getRank(euro) {
    if (euro >= 1000000) return { name: '*ELON MUSK* 👑', emoji: '🌌' };
    if (euro >= 500000) return { name: '*MILIONARIO*', emoji: '💎' };
    if (euro >= 250000) return { name: '*IMPRENDITORE*', emoji: '🏢' };
    if (euro >= 100000) return { name: '*CEO*', emoji: '💼' };
    if (euro >= 50000) return { name: '*INVESTITORE*', emoji: '📈' };
    if (euro >= 25000) return { name: '*AVVOCATO*', emoji: '⚖️' };
    if (euro >= 15000) return { name: '*INGEGNERE*', emoji: '🛠️' };
    if (euro >= 8000) return { name: '*COMMESSO*', emoji: '🛍️' };
    if (euro >= 3000) return { name: '*TIROCINANTE*', emoji: '🧑‍💼' };
    if (euro >= 1000) return { name: '*DISOCCUPATO*', emoji: '📦' };
    return { name: '*SINDACATO BARBONI*', emoji: '🗑️' };
}

function getNextRank(euro) {
    if (euro >= 1000000) return { name: 'DIVINITÀ DEI SOLDI', emoji: '🌌', required: 0 };
    if (euro >= 500000) return { name: 'ELON MUSK', emoji: '👑', required: 1000000 };
    if (euro >= 250000) return { name: 'MILIONARIO', emoji: '💎', required: 500000 };
    if (euro >= 100000) return { name: 'IMPRENDITORE', emoji: '🏢', required: 250000 };
    if (euro >= 50000) return { name: 'CEO', emoji: '💼', required: 100000 };
    if (euro >= 25000) return { name: 'INVESTITORE', emoji: '📈', required: 50000 };
    if (euro >= 15000) return { name: 'AVVOCATO', emoji: '⚖️', required: 25000 };
    if (euro >= 8000) return { name: 'INGEGNERE', emoji: '🛠️', required: 15000 };
    if (euro >= 3000) return { name: 'COMMESSO', emoji: '🛍️', required: 8000 };
    if (euro >= 1000) return { name: 'TIROCINANTE', emoji: '🧑‍💼', required: 3000 };
    return { name: 'DISOCCUPATO', emoji: '📦', required: 1000 };
}

handler.help = ['portafoglio'];
handler.tags = ['euro'];
handler.command = ['wallet', 'portafoglio', 'bilancio'];
handler.register = false;
export default handler;
