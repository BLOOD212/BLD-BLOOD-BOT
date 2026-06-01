export async function before(m, { conn, isAdmin, isBotAdmin, isOwner, isSam }) {
  if (!m.isGroup) return false

  const chat = global.db.data.chats[m.chat]
  if (!chat?.antimedia) return false

  // Immunità per Admin, Owner, Sam e il bot stesso
  if (m.fromMe || isAdmin || isOwner || isSam || !isBotAdmin) return false

  // Lascia passare i media "Visualizza una volta"
  if (
    m.message?.viewOnceMessage ||
    m.message?.viewOnceMessageV2 ||
    m.message?.viewOnceMessageV2Extension
  ) {
    return false
  }

  // Rileva Foto o Video normali
  const hasNormalMedia = !!m.message?.imageMessage || !!m.message?.videoMessage
  if (!hasNormalMedia) return false

  // Eliminazione del messaggio
  await conn.sendMessage(m.chat, {
      delete: {
        remoteJid: m.chat,
        fromMe: false,
        id: m.key.id,
        participant: m.key.participant,
      },
    }).catch(() => {})

  // Messaggio estetico in stile 𝐁𝐋𝐎𝐎𝐃-𝐁𝐎𝐓
  const header = `⋆｡˚『 ╭ \`ANTIMEDIA SYSTEM\` ╯ 』˚｡⋆`
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

  await conn.sendMessage(m.chat, {
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
    }).catch(() => {})

  return true
}
