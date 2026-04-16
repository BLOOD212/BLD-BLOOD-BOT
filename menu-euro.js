import { promises } from 'fs'
import { join } from 'path'
import { xpRange } from '../lib/levelling.js'
import moment from 'moment-timezone'
import os from 'os'

// --- PERCORSO IMMAGINE ---
const localImg = join(process.cwd(), 'menu-euro.jpeg');

const defaultMenu = {
  before: `
┎━━━━━━━━━━━━━━━━━━━┑
┃   ✧  𝐁𝐋𝐃 - 𝐄𝐂𝐎𝐍𝐎𝐌𝐘  ✧   ┃
┖━━━━━━━━━━━━━━━━━━━┙
┌───────────────────┐
  👤 𝚄𝚜𝚎𝚛: %name
  💳 𝚂𝚊𝚕𝚍𝚘: %eris ᴇʀɪs
  🏆 𝙻𝚟𝚕: %level
  🛡️ 𝚁𝚊𝚗𝚔: %role
└───────────────────┘

*〘 ᴇxᴛʀᴀᴄᴛɪɴɢ ᴅᴀᴛᴀ... 〙*
`.trimStart(),
  header: '┍━━━〔 %category 〕━━━┑',
  body: '┇ 🪙  *%cmd*',
  footer: '┕━━━━━──ׄ──ׅ──ׄ──━━━━━┙\n',
  after: `_ꜱʏꜱᴛᴇᴍ ᴏᴘᴇʀᴀᴛɪᴏɴᴀʟ ᴠ.2.0_`
}

let handler = async (m, { conn, usedPrefix: _p, __dirname, args, command}) => {
  let tags = {
    'euro': '🗂️ ᴅᴀᴛᴀʙᴀsᴇ ᴇᴜʀᴏ'
  }

  try {
    await conn.sendPresenceUpdate('composing', m.chat)
    
    let d = new Date(new Date().getTime() + 3600000)
    let _uptime = process.uptime() * 1000
    let uptime = clockString(_uptime)

    let user = global.db.data.users[m.sender] || {}
    let { level, role, eris } = user
    let name = await conn.getName(m.sender)

    let help = Object.values(global.plugins).filter(plugin => !plugin.disabled).map(plugin => {
      return {
        help: Array.isArray(plugin.help) ? plugin.help : [plugin.help],
        tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags],
        prefix: 'customPrefix' in plugin,
      }
    })

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
      name, eris, level, role, uptime
    }

    let text = _text.replace(new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join`|`})`, 'g'), (_, name) => '' + replace[name])

    await m.react('💳')

    // --- INVIO COME IMMAGINE (SOSTITUITO VIDEO) ---
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
