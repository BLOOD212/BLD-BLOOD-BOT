// Gestore Whitelist per singolo Gruppo
// Creato per funzionare con Antinuke separati

let handler = async (m, { conn, text, command, usedPrefix }) => {
    // Inizializza il database della chat se non esiste
    if (!global.db.data.chats[m.chat]) global.db.data.chats[m.chat] = {}
    if (!global.db.data.chats[m.chat].whitelist) global.db.data.chats[m.chat].whitelist = []

    let chat = global.db.data.chats[m.chat]
    let who;

    if (command === 'whitelist') {
        let list = chat.whitelist.map(jid => `┃ ➤ @${jid.split('@')[0]}`).join('\n')
        let caption = `
  ⋆｡˚『 ╭ \`WHITELIST GRUPPO\` ╯ 』˚｡⋆
╭
${list ? list : '┃ 『 ⚠️ 』 \`Nessun utente autorizzato\`'}
┃
╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒`
        return m.reply(caption, null, { mentions: conn.parseMention(list) })
    }

    // Per add e del, cerchiamo l'utente
    who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : false;

    if (!who) return m.reply(`『 ⚠️ 』- \`Esempio: ${usedPrefix + command} @tag\``)

    switch (command) {
        case 'addwhitelist':
            if (chat.whitelist.includes(who)) return m.reply('『 ✨ 』- `L\'utente è già in questa whitelist!`')
            chat.whitelist.push(who)
            await conn.sendMessage(m.chat, {
                text: `
  ⋆｡˚『 ╭ \`AUTORIZZATO\` ╯ 』˚｡⋆
╭
┃ 『 👤 』 \`Utente:\` @${who.split('@')[0]}
┃ 『 ✅ 』 \`Ambito:\` *Questo Gruppo*
┃
┃ ➤  \`Ora è esente dai controlli Antinuke.\`
╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒`,
                contextInfo: { mentionedJid: [who] }
            }, { quoted: m })
            break

        case 'delwhitelist':
            if (!chat.whitelist.includes(who)) return m.reply('『 ❌ 』- `L\'utente non è in lista.`')
            chat.whitelist = chat.whitelist.filter(jid => jid !== who)
            m.reply(`『 🗑️ 』- \`@${who.split('@')[0]} rimosso dalla whitelist locale.\``, null, { mentions: [who] })
            break
    }
}

handler.help = ['addwhitelist', 'delwhitelist', 'whitelist']
handler.tags = ['owner', 'group']
handler.command = /^(addwhitelist|delwhitelist|whitelist)$/i
handler.rowner = true
handler.group = true

export default handler
