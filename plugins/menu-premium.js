import { xpRange } from '../lib/levelling.js'
import { join } from 'path'

// --- PERCORSO IMMAGINE ---
const localImg = join(process.cwd(), 'menu-premium.jpeg');

const defaultMenu = {
  testoInizio: `
⚡  〔 𝐁 𝐋 𝐃  •  𝐏 𝐑 𝐄 𝐌 𝐈 𝐔 𝐌 〕  ⚡

┃ 👤 𝚄𝚝𝚎𝚗𝚝𝚎 ⭔ @%user
┃ 🏆 𝚁𝚊𝚗𝚔 ⭔ %role
┃ ✨ 𝚂𝚝𝚊𝚝𝚞𝚜 ⭔ 𝙴𝚕𝚒𝚝𝚎
`.trimStart(),

  header: '\n〔 %category 〕',
  body: '┃ ⌲ %emoji %cmd',
  footer: '',
  testoFine: `\n_BLD-BOT EXCLUSIVE SYSTEM_`
}

let handler = async (m, { conn, usedPrefix: _p }) => {
  let tags = {
    'prem': '⚡ 𝙱𝙻𝙳 𝙴𝙻𝙸𝚃𝙴 𝙿𝚁𝙾𝚃𝙾𝙲𝙾𝙻 ⚡'
  }

  try {
    await conn.sendPresenceUpdate('composing', m.chat)
    
    let user = global.db.data.users[m.sender] || {}
    let { level = 0, role = 'User' } = user
    let _uptime = process.uptime() * 1000
    let uptime = clockString(_uptime)

    // Filtraggio plugin premium (controlla le varie varianti dei tag premium)
    let help = Object.values(global.plugins)
      .filter(p => !p.disabled && p.tags && (p.tags.includes('premium') || p.tags.includes('prem') || p.tags.includes('premio')))
      .map(p => ({
        help: Array.isArray(p.help) ? p.help : [p.help],
        prefix: 'customPrefix' in p,
      }))

    // Costruzione dinamica dei comandi mappati
    let commands = help.flatMap(menu => 
      menu.help.map(cmd => {
        let rawCmd = menu.prefix ? cmd : _p + cmd
        let styledCmd = toTypewriter(rawCmd)
        return defaultMenu.body
          .replace(/%cmd/g, styledCmd)
          .replace(/%emoji/g, '👑')
      })
    ).join('\n')

    let _text = [
      defaultMenu.testoInizio,
      defaultMenu.header.replace(/%category/g, tags['prem']) + '\n' + commands,
      defaultMenu.testoFine
    ].join('\n')

    let userJid = m.sender.split('@')[0]
    let text = _text.replace(/%user/g, userJid)
                    .replace(/%role/g, role)

    await m.react('⭐')

    await conn.sendMessage(m.chat, {
      image: { url: localImg },
      caption: text.trim(),
      contextInfo: {
        mentionedJid: [m.sender],
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363232743845068@newsletter',
          newsletterName: "✧ 𝙱𝙻𝙳-𝙱𝙾𝚃 𝙿𝚁𝙴𝙼𝙸𝚄𝙼 ✧"
        }
      }
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, '❌ Errore nel caricamento del modulo Premium. Verifica menu-premium.jpeg.', m)
  }
}

handler.help = ['menupremium']
handler.tags = ['menu']
handler.command = ['menupremium', 'menuprem']

export default handler

function clockString(ms) {
  let h = isNaN(ms) ? '00' : Math.floor(ms / 3600000).toString().padStart(2, '0')
  let m = isNaN(ms) ? '00' : (Math.floor(ms / 60000) % 60).toString().padStart(2, '0')
  let s = isNaN(ms) ? '00' : (Math.floor(ms / 1000) % 60).toString().padStart(2, '0')
  return `${h}:${m}:${s}`
}

function toTypewriter(str) {
  const normal = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  const typewriter = "𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿"
  return str.split('').map(char => {
    const index = normal.indexOf(char)
    return index !== -1 ? typewriter.substr(index * 2, 2) : char
  }).join('')
}