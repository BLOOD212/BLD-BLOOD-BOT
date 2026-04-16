const handler = async (m, { conn, text, participants }) => {
  try {

    if (!m.isGroup)
      return m.reply("❌ Solo nei gruppi.")

    // CONTROLLO OWNER UNIVERSALE
    const senderNumber = m.sender.split('@')[0]
    const owners = global.owner || []

    const isOwner = owners.some(v => {
      if (Array.isArray(v)) return v[0] === senderNumber
      return v === senderNumber
    }) || m.isOwner

    if (!isOwner)
      return m.reply("❌ Solo l'OWNER del bot può usare questo comando.")

    if (!participants || participants.length === 0)
      return m.reply("❌ Nessun partecipante trovato.")

    const users = participants.map(u => conn.decodeJid(u.id))

    if (!text && !m.quoted)
      return m.reply("❌ Inserisci numero + testo oppure rispondi a un messaggio.")

    // 📌 Estrazione numero
    let args = text ? text.split(" ") : []
    let count = parseInt(args[0])

    if (isNaN(count)) {
      count = 10 // default se non metti numero
    }

    if (count > 30)
      return m.reply("⚠️ Massimo 30 volte per sicurezza.")

    let messageText = args.slice(1).join(" ")

    const sendTag = async () => {

      if (m.quoted) {
        const quoted = m.quoted

        if (quoted.mtype === 'imageMessage') {
          const media = await quoted.download()
          return conn.sendMessage(m.chat, {
            image: media,
            caption: messageText || quoted.text || '',
            mentions: users
          }, { quoted: m })
        }

        if (quoted.mtype === 'videoMessage') {
          const media = await quoted.download()
          return conn.sendMessage(m.chat, {
            video: media,
            caption: messageText || quoted.text || '',
            mentions: users
          }, { quoted: m })
        }

        if (quoted.mtype === 'stickerMessage') {
          const media = await quoted.download()
          return conn.sendMessage(m.chat, {
            sticker: media,
            mentions: users
          }, { quoted: m })
        }

        return conn.sendMessage(m.chat, {
          text: messageText || quoted.text || '',
          mentions: users
        }, { quoted: m })

      } else {
        return conn.sendMessage(m.chat, {
          text: messageText,
          mentions: users
        }, { quoted: m })
      }
    }

    // 🔥 RIPETE count VOLTE
    for (let i = 0; i < count; i++) {
      await sendTag()
    }

  } catch (e) {
    console.error("Errore bigtag:", e)
    m.reply(global.errore || "❌ Si è verificato un errore.")
  }
}

handler.help = ['bigtag <numero> <testo>']
handler.tags = ['owner']
handler.command = /^(\.?bigtag)$/i
handler.group = true

export default handler