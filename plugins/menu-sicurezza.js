import fetch from 'node-fetch'
import { join } from 'path'

let handler = async (m, { conn, usedPrefix: _p, command, args, isOwner, isAdmin }) => {
  const userName = m.pushName || 'Utente'
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

  const ownerFeatures = [
    { key: 'anticall', name: '📵 Antichiamate', desc: 'Blocca chiamate al bot (Global)' },
    { key: 'antiprivate', name: '🔒 Antiprivato', desc: 'Blocca uso del bot in privato' },
    { key: 'solocreatore', name: '👑 Solo Creatore', desc: 'Bot risponde solo all\'owner' }
  ]

  if (!args.length || /menu|help/i.test(args[0])) {
    let text = `
⚡  〔 𝐁 𝐋 𝐃  •  𝐒 𝐄 𝐂 𝐔 𝐑 𝐈 𝐓 𝐘 〕  ⚡

┃ 👤 𝚄𝚝𝚎𝚗𝚝𝚎 ⭔ @%user
┃ 📡 𝚂𝚝𝚊𝚝𝚞𝚜 ⭔ 𝙾𝚗𝚕𝚒𝚗𝚎

〔 ⚙️ 𝙸𝚂𝚃𝚁𝚄𝚉𝙸𝙾𝙽𝙸 𝙾𝙿𝙴𝚁𝙰𝚃𝙸𝚅𝙴 〕
┃ ⌲ Attiva: ${_p}attiva <nome>
┃ ⌲ Disattiva: ${_p}disattiva <nome>

〔 🛡️ 𝙱𝙻𝙳 𝚂𝙴𝙲𝚄𝚁𝙸𝚃𝚈 〕
${securityFeatures.map(f => `┃ ⌲ ${f.name} ( comando: ${toTypewriter(f.key)} )`).join('\n')}

〔 🤖 𝙱𝙻𝙳 𝙰𝚄𝚃𝙾𝙼𝙰𝚉𝙸𝙾𝙽𝙴 〕
${automationFeatures.map(f => `┃ ⌲ ${f.name} ( comando: ${toTypewriter(f.key)} )`).join('\n')}

_Powered by BLD-BOT Interface_`

    let userJid = m.sender.split('@')[0]
    let formattedText = text.replace(/%user/g, userJid)

    await conn.sendMessage(m.chat, { 
      image: { url: localImg }, 
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
  if (type === 'antiprivate') dbKey = 'antiPrivate'
  if (type === 'solocreatore') dbKey = 'soloCreatore'

  const isSecurity = securityFeatures.some(f => f.key.toLowerCase() === type)
  const isAuto = automationFeatures.some(f => f.key.toLowerCase() === type)
  const isOwnerKey = ownerFeatures.some(f => f.key.toLowerCase() === type)

  if (isSecurity || isAuto) {
    if (!m.isGroup && !isOwner) return m.reply('❌ Solo nei gruppi')
    if (m.isGroup && !isAdmin && !isOwner) return m.reply('🛡️ Solo per Admin')
    chat[dbKey] = isEnable
  } else if (isOwnerKey) {
    if (!isOwner) return m.reply('👑 Solo per l\'Owner')
    bot[dbKey] = isEnable
  } else {
    return m.reply('❓ Modulo non trovato.')
  }

  await m.react(isEnable ? '✅' : '❌')
  m.reply(`『 🛡️ 』 *SISTEMA AGGIORNATO*\n\nModulo: *${type.toUpperCase()}*\nStato: *${status}*`)
}

handler.command = ['attiva', 'disattiva', 'on', 'off', 'enable', 'disable']
export default handler

function toTypewriter(str) {
  const normal = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  const typewriter = "𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿"
  return str.split('').map(char => {
    const index = normal.indexOf(char)
    return index !== -1 ? typewriter.substr(index * 2, 2) : char
  }).join('')
}