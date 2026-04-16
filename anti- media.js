export async function before(m, { conn, isAdmin, isBotAdmin, isOwner, isSam }) {
  if (!m.isGroup) return false

  const chat = global.db.data.chats[m.chat]
  if (!chat?.antimedia) return false

  // Immunità per Admin, Blood e il bot stesso
  if (m.fromMe || isAdmin || isOwner || isSam) return false
  if (!isBotAdmin) return false

  // Se è un messaggio View Once, lo lascia passare
  if (
    m.message?.viewOnceMessage ||
    m.message?.viewOnceMessageV2 ||
    m.message?.viewOnceMessageV2Extension
  ) {
    return false
  }

  // Verifica se il messaggio contiene Foto o Video normali
  const hasNormalMedia =
    !!m.message?.imageMessage ||
    !!m.message?.videoMessage
  
  if (!hasNormalMedia) return false

  // Esecuzione eliminazione
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

  // Messaggio estetico BLD-BLOOD
  const header = `⋆｡˚『 ╭ \`ANTIMEDIA SYSTEM\` ╯ 』˚｡⋆`
  const footer = `╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒`
  
  const text = `${header}
╭
┃ 🛡️ \`Stato:\` *Protocollo Blood Attivo*
┃
┃ 『 👤 』 \`Target:\` @${m.sender.split('@')[0]}
┃ 『 🖼️ 』 \`Rilevato:\` *Media Permanente*
┃ 『 🚫 』 \`Azione:\` *Eliminazione immediata*
┃
┃ ⚠️ \`Nota:\` In questo gruppo sono ammessi 
┃ solo media *Visualizza una volta*.
╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒`

  await conn
    .sendMessage(m.chat, {
      text,
      mentions: [m.sender],
      contextInfo: {
        externalAdReply: {
          title: 'BLOOD SECURITY',
          body: 'Restrizione media attiva',
          thumbnailUrl: 'https://qu.ax/TfUj.jpg',
          mediaType: 1
        }
      }
    })
    .catch(() => {})

  return true
}

export { before as handler }
