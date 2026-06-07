let handler = async (m, { conn, text, args, groupMetadata, isAdmin, isOwner }) => {
  await conn.sendPresenceUpdate('composing', m.chat)

  let total = 0
  let sider = []
  let adesso = Date.now()
  let dueOre = 2 * 60 * 60 * 1000

  if (!global.db.data) global.db.data = {}
  if (!global.db.data.users) global.db.data.users = {}

  if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {}
  global.db.data.users[m.sender].lastseen = adesso

  let member = groupMetadata.participants.map(v => v.id)

  for (let i = 0; i < member.length; i++) {
    let jid = member[i]
    let numero = jid.split('@')[0]
    if (numero.length > 11) continue

    let users = groupMetadata.participants.find(u => u.id === jid)
    if (users?.isAdmin || users?.isSuperAdmin) continue

    let userData = global.db.data.users[jid]
    if (!userData) {
      let altJid = Object.keys(global.db.data.users).find(k => k.split('@')[0] === numero)
      if (altJid) userData = global.db.data.users[altJid]
    }

    let ultimoMessaggio = userData && userData.lastseen ? userData.lastseen : 0
    let isWhitelist = userData ? (userData.whitelist === true) : false
    let isBanned = userData ? (userData.banned === true) : false

    let eInattivo = (ultimoMessaggio === 0) || (adesso - ultimoMessaggio > trentaSecondi)

    if (eInattivo && !isWhitelist && !isBanned) {
      total++
      sider.push(jid)
    }
  }

  if (!args[0]) {
    const buttons = [
      {
        buttonId: `.inattivi lista`,
        buttonText: { displayText: '📋 Visualizza Lista' },
        type: 1
      },
      {
        buttonId: `.inattivi rimuovi`,
        buttonText: { displayText: '🗑️ Rimuovi Inattivi' },
        type: 1
      }
    ]

    const buttonMessage = {
      text: `╭━━━━━━━━━━━━━━━╮
┃ 𝐆𝐄𝐒𝐓𝐈𝐎𝐍𝐄 𝐈𝐍𝐀𝐓𝐓𝐈𝐕𝐈 😴
┃
┃ 𝐓𝐨𝐭𝐚𝐥𝐞: ${total}/${member.length}
┃ 𝐂𝐫𝐨𝐧𝐨𝐦𝐞𝐭𝐫𝐨: ⏱️ > 30 Sec
╰━━━━━━━━━━━━━━━╯`,
      footer: 'Bot di gestione gruppo',
      buttons: buttons,
      headerType: 1
    }

    return conn.sendMessage(m.chat, buttonMessage, { quoted: m })
  }

  if (args[0] === 'lista') {
    if (!isAdmin && !isOwner) {
      return conn.reply(m.chat, '❌ Solo gli *admin* possono vedere la lista degli inattivi.', m)
    }

    if (total === 0) {
      const successButton = {
        text: `╭━━• 𝐍𝐎 𝐈𝐍𝐀𝐓𝐓𝐈𝐕𝐈 •━━╮
╰━━━━━━━━━━━━━━━╯`,
        footer: 'Gestione gruppo',
        buttons: [{
          buttonId: `.inattivi`,
          buttonText: { displayText: '🔄 Torna al Menu' },
          type: 1
        }],
        headerType: 1
      }
      return conn.sendMessage(m.chat, successButton, { quoted: m })
    }

    const message = `╭━━━━━━━━━━━━━━━╮
┃ 𝐈𝐍𝐀𝐓𝐓𝐈𝐕𝐈 😴
┃
┃ 𝐓𝐨𝐭𝐚𝐥𝐞: ${sider.length}
${sider.map(v => '┣➤ @' + v.split('@')[0]).join('\n')}
╰━━━━━━━━━━━━━━━╯`

    const listButtons = [
      {
        buttonId: `.inattivi rimuovi`,
        buttonText: { displayText: '🗑️ Rimuovi Tutti' },
        type: 1
      },
      {
        buttonId: `.inattivi`,
        buttonText: { displayText: '🔄 Torna al Menu' },
        type: 1
      }
    ]

    const listMessage = {
      text: message,
      footer: 'Gestione gruppo - Lista inattivi',
      buttons: listButtons,
      headerType: 1,
      contextInfo: {
        mentionedJid: sider
      }
    }

    return conn.sendMessage(m.chat, listMessage, { quoted: m })
  }

  if (args[0] === 'rimuovi') {
    if (!isOwner && !isAdmin) {
      return conn.reply(m.chat, '❌ Solo gli *admin* del gruppo possono rimuovere gli inattivi.', m)
    }

    if (total === 0) {
      const noRemoveButton = {
        text: `╭━━• 𝐍𝐎 𝐈𝐍𝐀𝐓𝐓𝐈𝐕𝐈 •━━╮
╰━━━━━━━━━━━━━━━╯`,
        footer: 'Gestione gruppo',
        buttons: [{
          buttonId: `.inattivi`,
          buttonText: { displayText: '🔄 Torna al Menu' },
          type: 1
        }],
        headerType: 1
      }
      return conn.sendMessage(m.chat, noRemoveButton, { quoted: m })
    }

    const confirmButtons = [
      {
        buttonId: `.inattivi conferma`,
        buttonText: { displayText: '✅ Conferma Rimozione' },
        type: 1
      },
      {
        buttonId: `.inattivi`,
        buttonText: { displayText: '❌ Annulla' },
        type: 1
      }
    ]

    const confirmMessage = {
      text: `╭━━━━━━━━━━━━━━━╮
┃ 𝐂𝐎𝐍𝐅𝐄𝐑𝐌𝐀 ⚠️
┃
┃ 𝐒𝐭𝐚𝐢 𝐩𝐞𝐫 𝐫𝐢𝐦𝐮𝐨𝐯𝐞𝐫𝐞
┃ ${total} 𝐢𝐧𝐚𝐭𝐭𝐢𝐯𝐢!
╰━━━━━━━━━━━━━━━╯`,
      footer: 'Gestione gruppo - Conferma',
      buttons: confirmButtons,
      headerType: 1
    }

    return conn.sendMessage(m.chat, confirmMessage, { quoted: m })
  }

  if (args[0] === 'conferma') {
    if (!isOwner && !isAdmin) {
      return conn.reply(m.chat, '❌ Solo gli *admin* del gruppo possono rimuovere gli inattivi.', m)
    }

    if (total === 0) {
      return conn.reply(m.chat, `╭━━• 𝐍𝐎 𝐈𝐍𝐀𝐓𝐓𝐈𝐕𝐈 •━━╮
╰━━━━━━━━━━━━━━━╯`, m)
    }

    let removedCount = 0
    const errors = []

    for (const user of sider) {
      try {
        await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
        removedCount++
      } catch (e) {
        errors.push(user)
        console.error(`Errore nella rimozione di ${user}:`, e)
      }
    }

    const successMessage = removedCount > 0 
      ? `╭━━━━━━━━━━━━━━━╮
┃ 𝐑𝐈𝐌𝐎𝐙𝐈𝐎𝐍𝐄 🚫
┃
┃ 𝐑𝐢𝐦𝐨𝐬𝐬𝐢: ${removedCount}
╰━━━━━━━━━━━━━━━╯` 
      : `❌ Errore nella rimozione.`

    const resultButton = {
      text: successMessage,
      footer: 'Gestione gruppo - Risultato',
      buttons: [{
        buttonId: `.inattivi`,
        buttonText: { displayText: '🔄 Torna al Menu' },
        type: 1
      }],
      headerType: 1
    }

    return conn.sendMessage(m.chat, resultButton, { quoted: m })
  }

  const errorButton = {
    text: `❌ Opzione non valida.`,
    footer: 'Gestione gruppo',
    buttons: [{
      buttonId: `.inattivi`,
      buttonText: { displayText: '🔄 Torna al Menu' },
      type: 1
    }],
    headerType: 1
  }

  return conn.sendMessage(m.chat, errorButton, { quoted: m })
}

handler.help = ['inattivi']
handler.tags = ['gruppo']
handler.command = /^(inattivi)$/i
handler.group = true
handler.owner = false
handler.botAdmin = true

export default handler;
