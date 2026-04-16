const handler = async (m, { conn, args, text, usedPrefix, command }) => {
    let user;
    let db = global.db.data.users;
    if (m.quoted) {
        user = m.quoted.sender;
    } else if (args.length >= 1) {
        user = args[0].replace('@', '') + '@s.whatsapp.net';
    } else {
        await conn.reply(m.chat, 
`╭─❖ 令 [ SBAN UTENTE ] ❖─╮
│ Tagga o rispondi al messaggio dell'utente che vuoi sbannare.
│
│ Esempio:
│ → *${usedPrefix}sbanna @tag*
╰──────────────────────╯`, m);
        return;
    }
    if (db[user]) {
        db[user].banned = false;
        db[user].banRazon = '';
        const nametag = await conn.getName(user);
        const nn = await conn.getName(m.sender);
        await conn.reply(m.chat, 
`╭─❖ 令 [ UTENTE SBANNATO ] ❖─╮
│ ✅️ L'utente *${nametag}* è stato sbannato!
╰────────────────╯`, m, { mentions: [user] });
        conn.reply('393476686131@s.whatsapp.net', 
`╭─❖ 令 [ LOG SBAN ] ❖─╮
│ L'utente *${nametag}* è stato sbannato da *${nn}*
╰────────────────╯`, m);
    } else {
        await conn.reply(m.chat, 
`╭─❖ 令 [ ERRORE ] ❖─╮
│ L'utente non è registrato.
╰──────────────╯`, m);
    }
};
handler.help = ['sban <@tag>'];
handler.command = ['sbanna'];
handler.tags = ['creatore'];
handler.mods = true;
handler.group = true;
export default handler;