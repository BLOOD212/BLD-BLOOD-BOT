let handler = async (m, { conn }) => {
  if (!m.quoted) return conn.reply(m.chat, `『 🗑️ 』 *\`Rispondi al messaggio che vuoi eliminare.\`*`, m)
  try {
    const re = m.message.extendedTextMessage?.contextInfo
    const targetMsg = {
      remoteJid: m.chat,
      fromMe: false,
      id: re?.stanzaId || m.quoted.id,
      participant: re?.participant || m.quoted.sender
    }
    await conn.sendMessage(m.chat, { delete: targetMsg })
    await conn.sendMessage(m.chat, { delete: m.key })
  } catch (err) {
    try {
      if (m.quoted?.vM?.key) {
        await conn.sendMessage(m.chat, { delete: m.quoted.vM.key })
        await conn.sendMessage(m.chat, { delete: m.key })
      }
    } catch (e) {
      console.error('Errore durante eliminazione:', e)
      conn.reply(m.chat, `${global.errore}`, m)
    }
  }
}

handler.help = ['delete']
handler.tags = ['gruppo']
handler.command = /^(del|delete|cancella|eliminare)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler