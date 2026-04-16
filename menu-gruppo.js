import { promises } from 'fs'
import { join } from 'path'
import { xpRange } from '../lib/levelling.js'
import moment from 'moment-timezone'
import os from 'os'

// --- PERCORSO IMMAGINE ---
const localImg = join(process.cwd(), 'menu-gruppo.jpeg');

const defaultMenu = {
  before: `
┎━━━━━━━━━━━━━━━━━━━┑
┃   ✧  𝐁𝐋𝐃 - 𝐆𝐑𝐎𝐔𝐏  ✧     ┃
┖━━━━━━━━━━━━━━━━━━━┙
┌───────────────────┐
  👤 𝚄𝚜𝚎𝚛: %name
  🛡️ 𝚁𝚘𝚕𝚎: %role
  🛰️ 𝚂𝚝𝚊𝚝𝚞𝚜: %prems
└───────────────────┘

*〘 ᴀᴄᴄᴇssɪɴɢ ᴀᴅᴍɪɴ ᴘᴀɴᴇʟ... 〙*
`.trimStart(),
  header: '┍━━━〔 %category 〕━━━┑',
  body: '┇ 👥  *%cmd*',
  footer: '┕━━━━━──ׄ──ׅ──ׄ──━━━━━┙\n',
  after: `_ꜱʏꜱᴛᴇᴍ ɢʀᴏᴜᴘ ᴍᴀɴᴀɢᴇᴍᴇɴᴛ_`
}

let handler = async (m, { conn, usedPrefix: _p, __dirname }) => {
  let tags = {
    'gruppo': 'ɢʀᴏᴜᴘ ᴄᴏɴᴛ𝚛ᴏʟ'
  }

  try {
    await conn.sendPresenceUpdate('composing', m.chat)
    
    let d = new Date(new Date().getTime() + 3600000)
    let name = await conn.getName(m.sender)
    let _uptime = process.uptime() * 1000
    let uptime = clockString(_uptime)

    let user = global.db.data.users[m.sender] || {}
    let { level, role = 'Utente' } = user
    let prems = user.premiumTime > 0 ? '𝐏𝐫𝐞𝐦𝐢𝐮𝐦' : '𝐒𝐭𝐚𝐧𝐝𝐚𝐫𝐝'

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
      name, level, role, prems, uptime,
      readmore: readMore
    }

    let text = _text.replace(new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join('|')})`, 'g'), (_, name) => '' + replace[name])

    await m.react('🛡️')

    // --- INVIO COME IMMAGINE (SOSTITUITO VIDEO) ---
    await conn.sendMessage(m.chat, {
      image: { url: localImg },
      caption: text.trim(),
      contextInfo: {
        mentionedJid: [m.sender],
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363232743845068@newsletter',
          newsletterName: "✧ 𝙱𝙻𝙳-𝙱𝙾𝚃 𝙶𝚁𝙾𝚄𝙿 𝙰𝙳𝙼𝙸𝙽 ✧"
        }
      }
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, `❌ Errore: Assicurati che il file 'menu-gruppo.jpeg' sia presente nella cartella principale.`, m)
  }
}

handler.help = ['menugruppo']
handler.tags = ['menu']
handler.command = ['menugruppo', 'menugp', 'menuadmin']

export default handler

const more = String.fromCharCode(8206)
const readMore = more.repeat(4001)

function clockString(ms) {
  let h = isNaN(ms) ? '00' : Math.floor(ms / 3600000).toString().padStart(2, '0')
  let m = isNaN(ms) ? '00' : (Math.floor(ms / 60000) % 60).toString().padStart(2, '0')
  let s = isNaN(ms) ? '00' : (Math.floor(ms / 1000) % 60).toString().padStart(2, '0')
  return `${h}:${m}:${s}`
}
