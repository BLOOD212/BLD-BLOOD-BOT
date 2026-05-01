let handler = async (m, { conn, text, command, isAdmin, isOwner }) => {
  const chat = global.db.data.chats[m.chat]
  const isAntinukeOn = chat?.antinuke || false
  const sender = m.sender
  
  // Recupera la lista dei moderatori dal database
  const mods = chat?.moderatori || []
  const isMod = mods.includes(sender)

  // 1. CONTROLLO AUTORIZZAZIONE (Modificato per i Moderatori)
  // Se è un moderatore (ma non owner), gli vietiamo specificamente questo comando
  if (isMod && !isOwner) {
    return conn.reply(m.chat, '『 🚫 』 𝐀𝐜𝐜𝐞𝐬𝐬𝐨 𝐃𝐞𝐧𝐞𝐠𝐚𝐭𝐨: Come Moderatore non hai il permesso di gestire i ruoli (Promote/Demote).', m)
  }

  // Controllo standard per gli altri utenti
  if (!isAdmin && !isOwner) {
    return conn.reply(m.chat, '『 ❌ 』 𝐀𝐜𝐜𝐞𝐬𝐬𝐨 𝐃𝐞𝐧𝐞𝐠𝐚𝐭𝐨: Solo gli amministratori possono usare questo comando.', m)
  }

  // 2. CONTROLLO ANTINUKE
  if (isAntinukeOn && !isOwner) {
    return conn.reply(m.chat, '『 🛡️ 』 𝐀𝐧𝐭𝐢𝐧𝐮𝐤𝐞 𝐀𝐭𝐭𝐢𝐯𝐨: In questa modalità solo il Creatore può gestire i gradi per sicurezza.', m)
  }

  // 3. IDENTIFICAZIONE UTENTE (Target)
  let number
  if (m.mentionedJid && m.mentionedJid[0]) {
    number = m.mentionedJid[0]
  } else if (m.quoted && m.quoted.sender) {
    number = m.quoted.sender
  } else if (text) {
    number = text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'
  }

  if (!number || number.length < 10) {
    return conn.reply(m.chat, '『 👤 』 𝐌𝐞𝐧𝐳𝐢𝐨𝐧𝐚 un utente, quota un messaggio o scrivi il numero.', m)
  }

  // 4. EVITARE AUTO-MODERAZIONE
  if (number === sender) {
    return conn.reply(m.chat, '『 🤡 』 Non puoi promuovere o retrocedere te stesso.', m)
  }

  if (number === conn.user.jid) {
    return conn.reply(m.chat, '『 🤖 』 Non posso modificare i miei stessi permessi.', m)
  }

  // 5. DEFINIZIONE AZIONE
  const isPromote = ['promote', 'promuovi', 'p'].includes(command)
  const action = isPromote ? 'promote' : 'demote'

  const successMsg = isPromote 
    ? `『 👑 』 𝐋’𝐮𝐭𝐞𝐧𝐭𝐞 @${number.split('@')[0]} 𝐞̀ 𝐬𝐭𝐚𝐭𝐨 𝐢𝐧𝐜𝐨𝐫𝐨𝐧𝐚𝐭𝐨/𝐚\n𝐃𝐚: @${sender.split('@')[0]}`
    : `『 ⚠️ 』 𝐋’𝐮𝐭𝐞𝐧𝐭𝐞 @${number.split('@')[0]} 𝐞̀ 𝐬𝐭𝐚𝐭𝐨 𝐫𝐞𝐭𝐫𝐨𝐜𝐞𝐬𝐬𝐨\n𝐃𝐚: @${sender.split('@')[0]}`

  const errorMsg = isPromote
    ? '『 ❌ 』 Errore: L\'utente è già admin o non è presente nel gruppo.'
    : '『 ❌ 』 Errore: L\'utente non è admin o è già un membro semplice.'

  // 6. ESECUZIONE
  try {
    await conn.groupParticipantsUpdate(m.chat, [number], action)
    await conn.reply(m.chat, successMsg, m, {
      mentions: [sender, number]
    })
  } catch (e) {
    console.error(e)
    conn.reply(m.chat, errorMsg, m)
  }
}

handler.help = ['promote', 'demote']
handler.tags = ['group']
handler.command = /^(promote|promuovi|p|demote|retrocedi|r)$/i
handler.group = true
handler.botAdmin = true 

export default handler
