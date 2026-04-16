let handler = m => m

handler.before = async function (m, { conn, isAdmin, isBotAdmin, isOwner, isSam }) {
  if (!m.isGroup) return false
  
  const chat = global.db.data.chats[m.chat]
  if (!chat?.antivoip) return false

  // Se il bot non è admin non può espellere
  if (!isBotAdmin) return false

  let decodedSender = conn.decodeJid(m.sender)
  let senderNumber = decodedSender.split('@')[0].split(':')[0]
  let domain = decodedSender.split('@')[1]
  let decodedBotJid = conn.decodeJid(conn.user.jid)

  // Immunità: Bot stesso, Admin, Owner, Sam e account LID (nascosti)
  if (decodedSender === decodedBotJid || isAdmin || isOwner || isSam || domain === 'lid') return false

  // Controllo prefisso internazionale (Solo +39 consentito)
  if (!senderNumber.startsWith('39')) {
    
    // Esecuzione eliminazione messaggio (opzionale ma consigliata)
    await conn.sendMessage(m.chat, { delete: m.key }).catch(() => {})

    const header = `⋆｡˚『 ╭ \`SISTEMA ANTIVOIP\` ╯ 』˚｡⋆`
    const footer = `╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒`
    const utente = formatPhoneNumber(senderNumber, true)

    const text = `${header}
╭
┃ 🛡️ \`Stato:\` *Protocollo Blood Attivo*
┃
┃ 『 👤 』 \`Target:\` ${utente}
┃ 『 🌍 』 \`Origine:\` *Estera / VOIP*
┃ 『 🚫 』 \`Azione:\` *ESPULSIONE IMMEDIATA*
┃
┃ ⚠️ \`Nota:\` In questo gruppo l'accesso è 
┃ consentito esclusivamente a numeri italiani.
╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒`

    await conn.sendMessage(m.chat, { 
      text, 
      mentions: [decodedSender],
      contextInfo: {
        externalAdReply: {
          title: 'BLOOD BORDER CONTROL',
          body: 'Accesso negato: Numero non autorizzato',
          thumbnailUrl: 'https://qu.ax/TfUj.jpg',
          mediaType: 1
        }
      }
    })

    // Espulsione dell'utente straniero
    await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove').catch(() => {})
    return true
  }

  return false
}

function formatPhoneNumber(number, includeAt = false) {
  if (!number || number === '?' || number === 'sconosciuto') return includeAt ? '@Sconosciuto' : 'Sconosciuto';
  return includeAt ? '@' + number : number;
}

export default handler
