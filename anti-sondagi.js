export async function before(m, { conn, isAdmin, isBotAdmin, isOwner, isSam }) {
  if (!m.isGroup) return false

  const chat = global.db.data.chats[m.chat]
  if (!chat?.antisondaggi) return false

  // Immunità per Admin, Blood e il bot
  if (m.fromMe || isAdmin || isOwner || isSam) return false

  // Verifica se il messaggio è la creazione di un sondaggio
  const isPollCreation =
    !!m.message?.pollCreationMessage ||
    !!m.message?.pollCreationMessageV3 ||
    !!m.message?.pollCreationMessageV3Extension

  if (!isPollCreation) return false

  // Se il bot è admin, procede con l'eliminazione
  if (isBotAdmin) {
    await conn
      .sendMessage(m.chat, {
        delete: {
          remoteJid: m.chat,
          fromMe: false,
          id: m.key.id,
          participant: m.key.participant,
        },
      })
      .catch(() => {})
  }

  // Messaggio estetico BLD-BLOOD
  const header = `⋆｡˚『 ╭ \`ANTISONDAGGI SYSTEM\` ╯ 』˚｡⋆`
  const footer = `╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒`
  
  const statusNote = isBotAdmin 
    ? `┃ 🚫 \`Azione:\` *Eliminazione immediata*` 
    : `┃ ⚠️ \`Nota:\` Non sono admin, impossibile eliminare.`

  const text = `${header}
╭
┃ 🛡️ \`Stato:\` *Protocollo Blood Attivo*
┃
┃ 『 👤 』 \`Target:\` @${m.sender.split('@')[0]}
┃ 『 📊 』 \`Rilevato:\` *Creazione Sondaggio*
${statusNote}
┃
┃ ⚠️ \`Avviso:\` In questo gruppo l'uso dei 
┃ sondaggi è severamente vietato.
╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒`

  await conn
    .sendMessage(m.chat, {
      text,
      mentions: [m.sender],
      contextInfo: {
        externalAdReply: {
          title: 'BLOOD SECURITY',
          body: 'Restrizione sondaggi attiva',
          thumbnailUrl: 'https://qu.ax/TfUj.jpg',
          mediaType: 1,
          renderLargerThumbnail: true
        }
      }
    })
    .catch(() => {})

  return true
}

export { before as handler }
