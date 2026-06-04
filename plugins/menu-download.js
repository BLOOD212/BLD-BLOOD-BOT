import { promises } from 'fs'
import { join } from 'path'
import { xpRange } from '../lib/levelling.js'
import moment from 'moment-timezone'
import os from 'os'

// --- PERCORSO IMMAGINE ---
const localImg = join(process.cwd(), 'menu-download.jpeg');

const defaultMenu = {
  testoInizio: `
⚡  〔 𝐁 𝐋 𝐃  •  𝐃 𝐎 𝐖 𝐍 𝐋 𝐎 𝐀 𝐃 〕  ⚡

┃ 👤 𝚄𝚝𝚎𝚗𝚝𝚎 ⭔ @%user
┃ ⏳ 𝚄𝚙𝚝𝚒𝚖𝚎 ⭔ %uptime
┃ 📥 𝚂𝚝𝚊𝚝𝚞𝚜 ⭔ 𝚁𝚎𝚊𝚍𝚢
`.trimStart(),

  header: '\n〔 %category 〕',
  body: '┃ ⌲ %emoji %cmd',
  footer: '',
  testoFine: `\n_BLD-BOT NETWORK DATA_`
}

let handler = async (m, { conn, usedPrefix: _p, __dirname }) => {
  let tags = {
    'download': '⚡ 𝙱𝙻𝙳 𝙳𝙸𝙶𝙸𝚃𝙰𝙻 𝙰𝚂𝚂𝙴𝚃𝚂 ⚡'
  }

  try {
    await conn.sendPresenceUpdate('composing', m.chat)
    
    let _uptime = process.uptime() * 1000
    let uptime = clockString(_uptime)
    let totalreg = Object.keys(global.db.data.users).length

    let help = Object.values(global.plugins).filter(p => !p.disabled).map(p => ({
      help: Array.isArray(p.help) ? p.help : [p.help],
      tags: Array.isArray(p.tags) ? p.tags : [p.tags],
      prefix: 'customPrefix' in p,
    }))

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
              .replace(/%emoji/g, '📥')
          })).join('\n')

        return defaultMenu.header.replace(/%category/g, tags[tag]) + '\n' + commands
      }),
      defaultMenu.testoFine
    ].join('\n')

    let userJid = m.sender.split('@')[0]
    let text = _text.replace(/%user/g, userJid)
                    .replace(/%uptime/g, uptime)

    await m.react('📥')

    await conn.sendMessage(m.chat, {
      image: { url: localImg },
      caption: text.trim(),
      contextInfo: {
        mentionedJid: [m.sender],
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363232743845068@newsletter',
          newsletterName: "✧ 𝙱𝙻𝙳-𝙱𝙾𝚃 𝙳𝙾𝚆𝙽𝙻𝙾𝙰𝙳𝙴𝚁 ✧"
        }
      }
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, '❌ Error in Download Module: Check if menu-download.jpeg exists.', m)
  }
}

handler.help = ['menudl']
handler.tags = ['menu']
handler.command = ['menudl', 'menudownload']

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