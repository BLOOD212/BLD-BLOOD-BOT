import { xpRange } from '../lib/levelling.js'
import moment from 'moment-timezone'
import os from 'os'
import { promises } from 'fs'
import { join } from 'path'

const defaultMenu = {
  before: `
┎━━━━━━━━━━━━━━━━━━━┑
┃   ✧  𝐁𝐋𝐃 - 𝐂𝐑𝐄𝐀𝐓𝐎𝐑  ✧   ┃
┖━━━━━━━━━━━━━━━━━━━┙
┌───────────────────┐
  👤 𝙾𝚠𝚗𝚎𝚛: %name
  ⚙️ 𝙼𝚘𝚍𝚎: %mode
  🖥️ 𝙿𝚕𝚊𝚝𝚏𝚘𝚛𝚖: %platform
└───────────────────┘

*〘 ᴀᴄᴄᴇssɪɴɢ ʀᴏᴏᴛ ᴘʀᴏᴛᴏᴄᴏʟ... 〙*
`.trimStart(),
  header: '┍━━━〔 %category 〕━━━┑',
  body: '┇ 👨‍💻  *%cmd*',
  footer: '┕━━━━━──ׄ──ׅ──ׄ──━━━━━┙\n',
  after: `_ʙʟᴅ-ʙᴏᴛ ᴀᴅᴍɪɴ ɪɴᴛᴇʀꜰᴀᴄᴇ_`
}

let handler = async (m, { conn, usedPrefix: _p, __dirname }) => {
  let tags = {
    'creatore': 'ꜱʏꜱᴛᴇᴍ ᴏᴠᴇʀʀɪᴅᴇ'
  }

  try {
    await conn.sendPresenceUpdate('composing', m.chat)
    
    let name = await conn.getName(m.sender)
    let _uptime = process.uptime() * 1000
    let uptime = clockString(_uptime)
    let mode = global.opts['self'] ? 'Privato' : 'Pubblico'
    let platform = os.platform()

    let help = Object.values(global.plugins).filter(p => !p.disabled).map(p => ({
      help: Array.isArray(p.help) ? p.help : [p.help],
      tags: Array.isArray(p.tags) ? p.tags : [p.tags],
      prefix: 'customPrefix' in p,
    }))

    let _text = [
      defaultMenu.before,
      ...Object.keys(tags).map(tag => {
        return defaultMenu.header.replace(/%category/g, tags[tag]) + '\n' + [
          ...help.filter(menu => menu.tags && menu.tags.includes(tag) && menu.help).map(menu => {
            return menu.help.map(help => {
              return defaultMenu.body.replace(/%cmd/g, menu.prefix ? help : _p + help)
                .trim()
            }).join('\n')
          }),
          defaultMenu.footer
        ].join('\n')
      }),
      defaultMenu.after
    ].join('\n')

    let replace = {
      '%': '%',
      p: _p,
      name, uptime, mode, platform,
      readmore: readMore
    }

    let text = _text.replace(new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join('|')})`, 'g'), (_, name) => '' + replace[name])

    await m.react('👨‍💻')

    // --- INVIO SOLO TESTO (RIMOSSO VIDEO/IMMAGINE) ---
    await conn.sendMessage(m.chat, {
      text: text.trim(),
      contextInfo: {
        mentionedJid: [m.sender],
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363232743845068@newsletter',
          newsletterName: "✧ 𝙱𝙻𝙳-𝙱𝙾𝚃 𝙲𝚁𝙴𝙰𝚃𝙾𝚁 ✧"
        }
      }
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, '❌ Error in Creator Module.', m)
  }
}

handler.help = ['menucreatore']
handler.tags = ['menu']
handler.command = ['menuowner', 'menucreatore', 'owner']

export default handler

const more = String.fromCharCode(8206)
const readMore = more.repeat(4001)

function clockString(ms) {
  let h = isNaN(ms) ? '00' : Math.floor(ms / 3600000).toString().padStart(2, '0')
  let m = isNaN(ms) ? '00' : (Math.floor(ms / 60000) % 60).toString().padStart(2, '0')
  let s = isNaN(ms) ? '00' : (Math.floor(ms / 1000) % 60).toString().padStart(2, '0')
  return `${h}:${m}:${s}`
}
