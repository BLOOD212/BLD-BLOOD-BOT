let handler = async (m, { conn, args, usedPrefix, command }) => {
    let target;
    if (m.quoted) {
        target = m.quoted.sender;
    } else if (m.mentionedJid && m.mentionedJid[0]) {
        target = m.mentionedJid[0];
    } else {
        return m.reply(`⚠️ Rispondi al messaggio di qualcuno o taggalo.\n\nEsempio: \`${usedPrefix}${command} 5000 @utente\``);
    }

    let quota = parseInt(args[0]);
    if (isNaN(quota)) return m.reply(`⚠️ Specifica una quantità valida di euro.\n\nEsempio: \`${usedPrefix}${command} 5000\``);

    global.db = global.db || { data: { users: {} } };
    global.db.data.users[target] = global.db.data.users[target] || { euro: 0, creatura: null };
    
    global.db.data.users[target].euro += quota;

    return m.reply(`🪙 *TRANSAZIONE DI STATO* 🪙\n\nSono stati accreditati *+${quota}€* al profilo di @${target.split('@')[0]}.`, null, { mentions: [target] });
};

handler.help = ['addmoney'];
handler.tags = ['owner'];
handler.command = ['addmoney', 'addcredit', 'daisoldi'];
handler.rowner = true;

export default handler;
