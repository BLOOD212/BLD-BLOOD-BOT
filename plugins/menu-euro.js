import { promises } from 'fs'
import { join } from 'path'
import { xpRange } from '../lib/levelling.js'
import moment from 'moment-timezone'
import os from 'os'

// --- PERCORSO IMMAGINE ---
const localImg = join(process.cwd(), 'menu-euro.jpeg');

const defaultMenu = {
  testoInizio: `
⚡  〔 𝐁 𝐋 𝐃  •  𝐄 𝐂 𝐎 𝐍 𝐎 𝐌 𝐘 〕  ⚡

┃ 👤 𝚄𝚝𝚎𝚗𝚝𝚎 ⭔ @%user
┃ 💳 𝚂𝚊𝚕𝚍𝚘 ⭔ %eris 𝙴𝚛𝚒𝚜
┃ 🏆 𝙻𝚒𝚟𝚎𝚕𝚕𝚘 ⭔ %level
┃ 🛡️ 𝚁𝚊𝚗𝚐𝚘 ⭔ %role
`.trimStart(),

  header: '\n〔 %category 〕',
  body: '┃ ⌲ %emoji %cmd',
  footer: '',
  testoFine: `\n_SYSTEM OPERATIONAL V.2.0_`
}

let handler = async (m, { conn, usedPrefix: _p, __dirname, args, command}) => {
  let tags = {
    'euro': '⚡ 𝙱𝙻𝙳 𝙳𝙰𝚃𝙰𝙱𝙰𝚂𝙴 𝙴𝚄𝚁𝙾 ⚡'
  }

  try {
    await conn.sendPresenceUpdate('composing', m.chat)
    
    let _uptime = process.uptime() * 1000
    let uptime = clockString(_uptime)

    let user = global.db.data.users[m.sender] || {}
    let { level, role, eris } = user

    let help = Object.values(global.plugins).filter(plugin => !plugin.disabled).map(plugin => {
      return {
        help: Array.isArray(plugin.help) ? plugin.help : [plugin.help],
        tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags],
        prefix: 'customPrefix' in plugin,
      }
    })

    let _text = [
      defaultMenu.testoInizio,
      ...Object.keys(tags).map(tag => {
        let commands = help
          .filter(menu => menu.tags && menu.tags.includes(tag) && menu.help)
          .flatMap(menu => menu.help.map(h => {
            let rawCmd = menu.prefix ? h : _p + h
            let styledCmd = toTypewriter(rawCmd)
            return defaultMenu.body
              .replace(/%cmd/g, styledCmd)
              .replace(/%emoji/g, '🪙')
          })).join('\n')

        return defaultMenu.header.replace(/%category/g, tags[tag]) + '\n' + commands
      }),
      defaultMenu.testoFine
    ].join('\n')

    let userJid = m.sender.split('@')[0]
    let text = _text.replace(/%user/g, userJid)
                    .replace(/%eris/g, eris)
                    .replace(/%level/g, level)
                    .replace(/%role/g, role)

    await m.react('💳')

    await conn.sendMessage(m.chat, {
      image: { url: localImg },
      caption: text.trim(),
      contextInfo: {
        mentionedJid: [m.sender],
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363232743845068@newsletter',
          newsletterName: "✧ 𝙱𝙻𝙳-𝙱𝙾𝚃 𝙴𝙲𝙾𝙽𝙾𝙼𝚈 ✧"
        }
      }
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, '❌ Error in Core System: Check if menu-euro.jpeg exists.', m)
  }
}

handler.help = ['menueuro']
handler.tags = ['menu']
handler.command = ['menueuro']

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