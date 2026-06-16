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
    if (isNaN(quota)) return m.reply(`⚠️ Specifica una quantità valida di euro da rimuovere.\n\nEsempio: \`${usedPrefix}${command} 5000\``);

    global.db = global.db || { data: { users: {} } };
    global.db.data.users[target] = global.db.data.users[target] || { euro: 0, creatura: null };
    
    let saldoAttuale = global.db.data.users[target].euro;
    global.db.data.users[target].euro = Math.max(0, saldoAttuale - quota);

    return m.reply(`📉 *DECRETO DI RIMOZIONE* 📉\n\nSono stati sottratti *${quota}€* dal profilo di @${target.split('@')[0]}.\nSaldo rimanente: *${global.db.data.users[target].euro}€*.`, null, { mentions: [target] });
};

handler.help = ['removemoney'];
handler.tags = ['owner'];
handler.command = ['removemoney', 'removecredit', 'togli-soldi'];
handler.rowner = true;

export default handler;
