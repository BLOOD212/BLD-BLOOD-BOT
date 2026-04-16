import fetch from 'node-fetch'
import { join } from 'path'

let handler = async (m, { conn, usedPrefix: _p, command, args, isOwner, isAdmin }) => {
  const userName = m.pushName || 'Utente'
  
  // --- PERCORSO IMMAGINE LOCALE ---
  const localImg = join(process.cwd(), 'menu-sicurezza.jpeg')

  global.db.data.chats[m.chat] = global.db.data.chats[m.chat] || {}
  global.db.data.settings[conn.user.jid] = global.db.data.settings[conn.user.jid] || {}
  let chat = global.db.data.chats[m.chat]
  let bot = global.db.data.settings[conn.user.jid]

  // --- CONFIGURAZIONE MODULI ---
  const securityFeatures = [
    { key: 'antigore', name: '🚫 Antigore', desc: 'Blocca contenuti splatter/gore' },
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

  // --- GENERAZIONE MENU ---
  if (!args.length || /menu|help/i.test(args[0])) {
    let text = `
┎━━━━━━━━━━━━━━━━━━━━┑
┃   ✧  𝐁𝐋𝐃 - 𝐌𝐀𝐒𝐓𝐄𝐑 𝐂𝐎𝐍𝐓𝐑𝐎𝐋  ✧   ┃
┖━━━━━━━━━━━━━━━━━━━━┙
┌────────────────────┐
  👤 𝚄𝚜𝚎𝚛: ${userName}
  📡 𝚂𝚝𝚊𝚝𝚞𝚜: 𝙾𝚗𝚕𝚒𝚗𝚎
└────────────────────┘

*〘 ɪɴsᴛʀᴜᴢɪᴏɴɪ ᴏᴘᴇʀᴀᴛɪᴠᴇ 〙*
> Attiva o disattiva i moduli:
*│ ➤* ${_p}*attiva* <nome>
*│ ➤* ${_p}*disattiva* <nome>

*┍━━━━━〔 🛡️ sɪᴄᴜʀᴇᴢᴢᴀ 〕━━━━━┑*
${securityFeatures.map(f => `┇ ${f.name}\n┇ _${f.desc}_\n┇ ➤ *${f.key}*\n┇`).join('\n')}
*┕━━━━━━━──ׄ──ׅ──ׄ──━━━━━━━┙*

*┍━━━━━〔 🤖 ᴀᴜᴛᴏᴍᴀᴢɪᴏɴᴇ 〕━━━━━┑*
${automationFeatures.map(f => `┇ ${f.name}\n┇ _${f.desc}_\n┇ ➤ *${f.key}*\n┇`).join('\n')}
*┕━━━━━━━──ׄ──ׅ──ׄ──━━━━━━━┙*

_ʙʟᴅ-ʙᴏᴛ sᴇᴄᴜʀɪᴛʏ ɪɴᴛᴇʀꜰᴀᴄᴇ_`

    // Invio con immagine locale
    await conn.sendMessage(m.chat, { 
      image: { url: localImg }, 
      caption: text.trim(),
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

  // --- LOGICA DI ATTIVAZIONE ---
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
