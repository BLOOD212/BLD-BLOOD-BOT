const handler = async (m, { conn, args }) => {
  const groupMetadata = await conn.groupMetadata(m.chat).catch(() => null)
  if (!groupMetadata) return conn.reply(m.chat, `${global.errore}`, m)
  const nuovaDescrizione = args.join(' ')
  if (!nuovaDescrizione) return conn.reply(m.chat, '『 ✏️ 』 *\`Scrivi la nuova descrizione\`*', m)

  try {
    await conn.groupUpdateDescription(m.chat, nuovaDescrizione)
    await conn.reply(m.chat, `『 ✅ 』 \`Descrizione del gruppo aggiornata:\`\n\n${nuovaDescrizione}`, m)
  } catch (e) {
    console.error('Errore durante aggiornamento descrizione:', e)
    return conn.reply(m.chat, `${global.errore}`, m)
  }
}

handler.help = ['descrizionegp <testo>']
handler.tags = ['gruppo']
handler.command = /^(descrizionegp|setdescgp|setgroupdesc|descgp)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
