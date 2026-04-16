let handler = async (m, { conn, text, usedPrefix, command, args }) => {
  if (!m.isGroup) return m.reply('⚠️ Questo comando funziona solo nei gruppi')
  if (!global.owner.map(([number]) => number).includes(m.sender.split('@')[0])) {
    const ownerNumber = global.owner[0][0]
    return m.reply(`*⚠️ Solo il creatore può usare questo comando*\n\n👑 Creatore: @${ownerNumber}`, null, {
      mentions: [ownerNumber + '@s.whatsapp.net']
    })
  }
  if (!text || !args[1]) {
    return m.reply(`
⚠️ *Formato non valido*

📌 *Uso corretto:*
${usedPrefix + command} @utente comando

📝 *Esempio:*
${usedPrefix + command} @user play
`.trim())
  }

  try {
    const user = m.mentionedJid[0]
    const blockedCmd = args[1].toLowerCase()
    
    if (!user) return m.reply('⚠️ Devi taggare un utente')
    if (!global.db.data) global.db.data = {}
    if (!global.db.data.users) global.db.data.users = {}
    if (!global.db.data.users[user]) global.db.data.users[user] = {}
    if (!global.db.data.users[user].bannedCommands) global.db.data.users[user].bannedCommands = []
    if (global.db.data.users[user].bannedCommands.includes(blockedCmd)) {
      return m.reply(`❌ @${user.split('@')[0]} ha già il comando *${blockedCmd}* bloccato`, null, { mentions: [user] })
    }
    global.db.data.users[user].bannedCommands.push(blockedCmd)
    await global.db.write()

    m.reply(`✅ @${user.split('@')[0]} non può più usare il comando *${blockedCmd}*`, null, { mentions: [user] })

  } catch (e) {
    console.error('Errore in bancmd:', e)
    m.reply('❌ Errore durante il blocco del comando')
  }
}

handler.help = ['bancmd @user comando']
handler.tags = ['owner']
handler.command = /^(bancmd|blockcmd)$/i
handler.rowner = true 

export default handler