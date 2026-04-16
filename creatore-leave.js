let handler = async (m, { conn, text, command }) => {
  // Verifica permessi: Solo Owner
  const isOwner = [...global.owner.map(([number]) => number), ...global.mods]
    .map(v => v.replace(/[^0-9]/g, '') + '@s.whatsapp.net')
    .includes(m.sender)

  if (!isOwner) {
    return await conn.reply(m.chat, `*｢ ⚠️ OWNER ONLY ｣*\n\nQuesto comando può essere eseguito solo dal mio *Creatore*.`, m)
  }

  let id = text ? text : m.chat
  
  // Design Estetico BLD-BLOOD
  let leaveMessage = `
┏━━━━━━━〔 🩸 *BLD-BLOOD* 〕━━━━━━━┓
┃
┃ 👋 *ADDIO GRUPPO*
┃
┃ Il bot sta abbandonando questa chat.
┃ È stato un onore servire qui.
┃
┃ 🛑 *Status:* Disconnessione...
┃
┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛`.trim()

  try {
    await conn.reply(id, leaveMessage)
    await conn.groupLeave(id)
  } catch (e) {
    console.error('Errore durante l\'uscita:', e)
    await m.reply('❌ Errore critico durante la procedura di uscita.')
  }
}

handler.help = ['out']
handler.tags = ['owner']
handler.command = /^(esci|leavegc|leave|voltati|out)$/i

handler.group = true 
handler.owner = true // Proprietà attivata per sicurezza extra

export default handler
