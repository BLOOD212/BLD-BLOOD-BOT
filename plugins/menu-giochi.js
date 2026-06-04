import { promises } from 'fs'
import { join } from 'path'
import { xpRange } from '../lib/levelling.js'
import moment from 'moment-timezone'

const localImg = join(process.cwd(), 'menu-giochi.jpeg'); 

const defaultMenu = {
  before: `
⚡  〔 𝐁 𝐋 𝐃  •  𝐆 𝐀 𝐌 𝐄 𝐒 〕  ⚡

┃ 👤 𝚄𝚝𝚎𝚗𝚝𝚎 ⭔ @%user
┃ 🏆 𝙻𝚒𝚟𝚎𝚕𝚕𝚘 ⭔ %level
┃ 💰 𝙴𝚛𝚒𝚜 ⭔ %eris
┃ 🎖️ 𝚁𝚊𝚗𝚐𝚘 ⭔ %role
`.trimStart(),

  header: '\n〔 %category 〕',
  body: '┃ ⌲ %emoji %cmd %islimit%isPremium',
  footer: '',
  after: `\n_Usa %p [comando] per giocare_`,
}

let handler = async (m, { conn, usedPrefix: _p, __dirname }) => {
  let tags = { 'giochi': '⚡ 𝙱𝙻𝙳 𝙶𝙰𝙼𝙴 𝙲𝙴𝙽𝚃𝙴𝚁 ⚡' }

  try {
    await conn.sendPresenceUpdate('composing', m.chat)
    
    let user = global.db.data.users[m.sender] || {}
    let { exp = 0, level = 1, role = 'Utente', eris = 0, limit = 10 } = user
    let uptime = clockString(process.uptime() * 1000)

    let help = Object.values(global.plugins)
      .filter(p => !p.disabled)
      .map(p => ({
        help: Array.isArray(p.help) ? p.help : [p.help],
        tags: Array.isArray(p.tags) ? p.tags : [p.tags],
        prefix: 'customPrefix' in p,
        limit: p.limit,
        premium: p.premium
      }))

    let groups = {}
    for (let tag in tags) {
      groups[tag] = help.filter(menu => menu.tags && menu.tags.includes(tag) && menu.help[0])
    }

    let _text = [
      defaultMenu.before,
      ...Object.keys(tags).map(tag => {
        let commands = groups[tag].flatMap(menu =>
          menu.help.map(cmd => {
            let rawCmd = menu.prefix ? cmd : _p + cmd
            let styledCmd = toTypewriter(rawCmd)
            return defaultMenu.body
              .replace(/%cmd/g, styledCmd)
              .replace(/%emoji/g, '🎮')
              .replace(/%islimit/g, menu.limit ? ' ⚠️' : '')
              .replace(/%isPremium/g, menu.premium ? ' 💎' : '')
              .trimEnd()
          })
        ).join('\n')

        return defaultMenu.header.replace(/%category/g, tags[tag]) + '\n' + commands
      }),
      defaultMenu.after
    ].join('\n')

    let userJid = m.sender.split('@')[0]
    let replace = {
      '%': '%', p: _p, eris, user: userJid, level, limit, role, uptime
    }

    let text = _text.replace(new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join('|')})`, 'g'), (_, name) => '' + replace[name])

    await conn.sendMessage(m.chat, {
      image: { url: localImg },
      caption: text.trim(),
      mentions: [m.sender]
    }, { quoted: m })

    await m.react('🎮')

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, `❌ Errore: Il file 'menu-giochi.jpeg' non è stato trovato nella cartella principale.`, m)
  }
}

handler.help = ['menugiochi']
handler.tags = ['menu']
handler.command = ['menugiochi', 'menugame']

export default handler

function clockString(ms) {
  let h = Math.floor(ms / 3600000)
  let m = Math.floor(ms / 60000) % 60
  let s = Math.floor(ms / 1000) % 60
  return [h, 'h ', m, 'm ', s, 's'].map(v => v.toString().padStart(2, '0')).join('')
}

function toTypewriter(str) {
  const normal = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  const typewriter = "𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿"
  return str.split('').map(char => {
    const index = normal.indexOf(char)
    return index !== -1 ? typewriter.substr(index * 2, 2) : char
  }).join('')
}