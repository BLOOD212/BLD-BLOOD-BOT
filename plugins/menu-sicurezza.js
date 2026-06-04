import { promises as fs } from 'fs'
import { join } from 'path'

let handler = async (m, { conn, usedPrefix: _p, command, args, isOwner, isAdmin }) => {
  const localImg = join(process.cwd(), 'menu-sicurezza.jpeg')

  global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {}
  global.db.data.settings[conn.user.jid] = global.db.data.settings[conn.user.jid] || {}
  let chat = global.db.data.chats[m.chat]
  let bot = global.db.data.settings[conn.user.jid]

  const securityFeatures = [
    { key: 'modoadmin', name: '🛡️ Soloadmin', desc: 'Solo gli admin usano il bot' },
    { key: 'antivoip', name: '📞 Antivoip', desc: 'Rifiuta chiamate nel gruppo' },
    { key: 'antilink', name: '🔗 Antilink', desc: 'Elimina link gruppi WhatsApp' },
    { key: 'antilinksocial', name: '🌐 Antilinksocial', desc: 'Elimina link social (IG, TT, ecc)' },
    { key: 'antitrava', name: '🧱 Antitrava', desc: 'Blocca crash/messaggi lunghi' },
    { key: 'antinuke', name: '☢️ Antinuke', desc: 'Sicurezza avanzata del gruppo' },
    { key: 'antiviewonce', name: '👁️ Antiviewonce', desc: 'Invia messaggi visualizza una volta' },
    { key: 'antispam', name: '🛑 Antispam', desc: 'Blocca spam di comandi' }
  ]

  const automationFeatures = [
    { key: 'ai', name: '🧠 IA', desc: 'Intelligenza artificiale attiva' },
    { key: 'vocali', name: '🎤 Siri', desc: 'Risponde con audio ai messaggi' },
    { key: 'reaction', name: '😎 Reazioni', desc: 'Reazioni automatiche ai messaggi' },
    { key: 'autolevelup', name: '⬆️ Autolivello', desc: 'Messaggio di livello automatico' },
    { key: 'welcome', name: '👋 Welcome', desc: 'Messaggio di benvenuto' }
  ]

  const defaultMenu = {
    testoInizio: `
⚡  〔 𝐁 𝐋 𝐃  •  𝐒 𝐄 𝐂 𝐔 𝐑 𝐈 𝐓 𝐘 〕  ⚡

┃ 👤 𝚄𝚝𝚎𝚗𝚝𝚎 ⭔ @%user
┃ 📡 𝚂𝚝𝚊𝚝𝚞𝚜 ⭔ 𝙾𝚗𝚕𝚒𝚗𝚎
`,
    header: '\n〔 %category 〕',
    body: '┃ ⌲ %emoji %cmd',
    testoFine: `\n_Powered by BLD-BOT Interface_`
  }

  if (!args.length || /menu|help/i.test(args[0])) {
    let commandsSec = securityFeatures.map(f => {
        let styledCmd = toTypewriter(_p + 'attiva ' + f.key)
        return defaultMenu.body.replace(/%cmd/g, styledCmd).replace(/%emoji/g, '🛡️')
    }).join('\n')

    let commandsAuto = automationFeatures.map(f => {
        let styledCmd = toTypewriter(_p + 'attiva ' + f.key)
        return defaultMenu.body.replace(/%cmd/g, styledCmd).replace(/%emoji/g, '🤖')
    }).join('\n')

    let text = [
      defaultMenu.testoInizio,
      defaultMenu.header.replace(/%category/g, '⚡ 𝙱𝙻𝙳 𝚂𝙴𝙲𝚄𝚁𝙸𝚃𝚈 ⚡') + '\n' + commandsSec,
      defaultMenu.header.replace(/%category/g, '⚡ 𝙱𝙻𝙳 𝙰𝚄𝚃𝙾𝙼𝙰𝚉𝙸𝙾𝙽𝙴 ⚡') + '\n' + commandsAuto,
      defaultMenu.testoFine
    ].join('\n')

    let userJid = m.sender.split('@')[0]
    let formattedText = text.replace(/%user/g, userJid)

    let imageBuffer = null
    try {
      imageBuffer = await fs.readFile(localImg)
    } catch (e) {
      console.log("Immagine menu-sicurezza.jpeg non trovata")
    }

    await conn.sendMessage(m.chat, { 
      ...(imageBuffer ? { image: imageBuffer } : {}),
      caption: formattedText.trim(),
      contextInfo: {
        mentionedJid: [m.sender],
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363232743845068@newsletter',
          newsletterName: "🛡️ 𝐒𝐘𝐒𝐓𝐄𝐌 𝐒𝐄𝐂𝐔𝐑𝐈𝐓𝐘 𝐂𝐎𝐍𝐓𝐑𝐎𝐋 🛡️"
        }
      }
    }, { quoted: m })
    return
  }

  let isEnable = !/disattiva|off|0/i.test(command)
  let type = args[0].toLowerCase()
  let status = isEnable ? 'ATTIVATO ✅' : 'DISATTIVATO ❌'

  let dbKey = type
  if (type === 'antilink') dbKey = 'antiLink'
  if (type === 'antilinksocial') dbKey = 'antiLink2'
  if (type === 'antiviewonce') dbKey = 'antioneview'

  const allFeats = [...securityFeatures, ...automationFeatures]
  if (allFeats.some(f => f.key === type)) {
    if (m.isGroup && !isAdmin && !isOwner) return m.reply('🛡️ Solo per Admin')
    chat[dbKey] = isEnable
  } else {
    return m.reply('❓ Modulo non trovato.')
  }

  await m.react(isEnable ? '✅' : '❌')
  m.reply(`『 🛡️ 』 *SISTEMA AGGIORNATO*\n\nModulo: *${type.toUpperCase()}*\nStato: *${status}*`)
}

handler.command = ['attiva', 'disattiva', 'on', 'off', 'enable', 'disable', 'menusicurezza']
export default handler

function toTypewriter(str) {
  const normal = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 /"
  const typewriter = "𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿 /"
  return str.split('').map(char => {
    const index = normal.indexOf(char)
    return index !== -1 ? typewriter.substr(index * 2, 2) : char
  }).join('')
}
