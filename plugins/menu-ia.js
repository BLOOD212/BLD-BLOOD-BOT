import { xpRange } from '../lib/levelling.js'
import { join } from 'path'

const localImg = join(process.cwd(), 'menu-ia.jpeg');

const emojicategoria = {
  iatesto: '📝',
  iaaudio: '🎧',
  iaimmagini: '🖼️'
}

let tags = {
  'iatesto': '⚡ 𝙱𝙻𝙳 𝙸𝙰 𝚃𝙴𝚂𝚃𝙾 ⚡',
  'iaaudio': '⚡ 𝙱𝙻𝙳 𝙸𝙰 𝙰𝚄𝙳𝙸𝙾 ⚡',
  'iaimmagini': '⚡ 𝙱𝙻𝙳 𝙸𝙰 𝙸𝙼𝙼𝙰𝙶𝙸𝙽𝙸 ⚡'
}

const defaultMenu = {
  testoInizio: `
⚡  〔 𝐁 𝐋 𝐃  •  𝐈 𝐀 〕  ⚡

┃ 👤 𝚄𝚝𝚎𝚗𝚝𝚎 ⭔ @%user
┃ 🏆 𝙻𝚒𝚟𝚎𝚕𝚕𝚘 ⭔ %level
┃ ⏳ 𝚄𝚙𝚝𝚒𝚖𝚎 ⭔ %uptime
┃ 👥 𝚄𝚝𝚎𝚗𝚝𝚒 ⭔ %totalreg
`.trimStart(),

  header: '\n〔 %category 〕',
  body: '┃ ⌲ %emoji %cmd',
  footer: '',
  testoFine: `\n_SYSTEM IA OPERATIONAL_`
}

let handler = async (m, { conn, usedPrefix: _p, __dirname }) => {
  try {
    await conn.sendPresenceUpdate('composing', m.chat)
    
    let { level = 0, role = 'User' } = global.db.data.users[m.sender] || {}
    let uptime = clockString(process.uptime() * 1000)
    let totalreg = Object.keys(global.db.data.users).length

    let help = Object.values(global.plugins)
      .filter(plugin => !plugin.disabled && plugin.tags)
      .filter(plugin => ['iatesto', 'iaaudio', 'iaimmagini'].some(t => plugin.tags.includes(t)))
      .map(plugin => ({
        help: Array.isArray(plugin.help) ? plugin.help : [plugin.help],
        tags: Array.isArray(plugin.tags) ? plugin.tags : [plugin.tags],
        prefix: 'customPrefix' in plugin
      }))

    let menuTags = Object.keys(tags)
    let _text = [
      defaultMenu.testoInizio,
      ...menuTags.map(tag => {
        let commands = help
          .filter(menu => menu.tags.includes(tag) && menu.help)
          .flatMap(menu => menu.help.map(cmd => {
            let rawCmd = menu.prefix ? cmd : _p + cmd
            let styledCmd = toTypewriter(rawCmd)
            return defaultMenu.body
              .replace(/%cmd/g, styledCmd)
              .replace(/%emoji/g, emojicategoria[tag] || '🧠')
          })).join('\n')

        return defaultMenu.header.replace(/%category/g, tags[tag]) + '\n' + commands
      }),
      defaultMenu.testoFine
    ].join('\n')

    let userJid = m.sender.split('@')[0]
    let text = _text.replace(/%user/g, userJid)
                    .replace(/%level/g, level)
                    .replace(/%uptime/g, uptime)
                    .replace(/%totalreg/g, totalreg)

    await m.react('🧠')

    await conn.sendMessage(m.chat, {
      image: { url: localImg },
      caption: text.trim(),
      contextInfo: {
        mentionedJid: [m.sender],
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363232743845068@newsletter',
          newsletterName: "✧ 𝙱𝙻𝙳-𝙱𝙾𝚃 𝙸format𝙸format ✧"
        }
      }
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, '❌ Errore nel caricamento del modulo IA.', m)
  }
}

handler.help = ['menuia']
handler.tags = ['menu']
handler.command = ['menuia', 'menuai']

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