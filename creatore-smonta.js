const delay = ms => new Promise(r => setTimeout(r, ms))

var handler = async (m, { conn, isBotAdmin }) => {
  try {
    if (!m.isGroup) return

    // 🔹 METADATA
    const metadata = await conn.groupMetadata(m.chat)
    const participants = metadata.participants

    // 🔹 OWNER (tutti i formati)
    const owners = new Set(
      (global.owner || [])
        .flatMap(v => Array.isArray(v) ? v : [v])
        .filter(v => typeof v === 'string')
        .map(v => v.replace(/\D/g, '') + '@s.whatsapp.net')
    )

    // 🔹 JID BOT (ULTRA SAFE)
    const botJid =
      conn.user?.jid ||
      conn.user?.id?.split(':')[0] + '@s.whatsapp.net'

    // 🔹 PARTICIPANT BOT
    const botParticipant = participants.find(p => p.id === botJid)

    // 🔹 CONTROLLO ADMIN (3 LIVELLI)
    const botIsAdmin =
      isBotAdmin === true || // se il framework lo passa
      botParticipant?.admin === 'admin' ||
      botParticipant?.admin === 'superadmin'

    if (!botIsAdmin) {
      console.log('[DEBUG]', { botJid, botParticipant })
      return m.reply('❌ Il bot non è admin, quindi non può smontare nessuno.')
    }

    // 🔹 LISTA DA SMONTARE
    const toDemote = participants
      .filter(p =>
        p.admin &&
        p.id !== botJid &&
        !owners.has(p.id)
      )
      .map(p => p.id)

    if (!toDemote.length) {
      return m.reply('✅ Nessun admin da smontare.')
    }

    // 🔹 DEMOTE
    for (const jid of toDemote) {
      await conn.groupParticipantsUpdate(m.chat, [jid], 'demote').catch(() => {})
      await delay(800)
    }

    m.reply(`✅ Smontati ${toDemote.length} admin.`)

  } catch (e) {
    console.error(e)
    m.reply('❌ Errore durante lo smontaggio.')
  }
}

handler.command = /^smonta$/i
handler.group = true
handler.owner = true
handler.botAdmin = true

export default handler