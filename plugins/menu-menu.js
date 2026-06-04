import { promises as fs } from 'fs'
import { join } from 'path'

const emojicategoria = {
  info: '⚡',
  main: '🌩️',
  sicurezza: '🛡️'
}

let tags = {
  main: '⚡ 𝙱𝙻𝙳 𝙼𝙰𝙸𝙽 𝚂𝚈𝚂𝚃𝙴𝙼 ⚡',
  info: '⚡ 𝙱𝙻𝙳 𝙸𝙽𝙵𝙾 𝙱𝙰𝚂𝙴 ⚡'
}

const defaultMenu = {
  testoInizio: `
⚡  〔 𝐁 𝐋 𝐃  •  𝐁 𝐎 𝐓 〕  ⚡

┃ 👤 𝚄𝚝𝚎𝚗𝚝𝚎 ⭔ @%user
┃ ⏳ 𝚄𝚙𝚝𝚒𝚖𝚎 ⭔ %uptime
┃ 👥 𝚄𝚝𝚎𝚗𝚝𝚒 ⭔ %totalreg
`.trimStart(),

  header: '\n〔 %category 〕',
  body: '┃ ⌲ %emoji %cmd',
  footer: '',
  testoFine: `\n_Powered by BLD-BOT Interface_`,
}

const localImg = './menu-principale.jpeg'

const bldButtons = [
  { title: "🛡️ SICUREZZA", command: "attiva" },
  { title: "🎮 GIOCHI", command: "menugiochi" },
  { title: "🤖 IA", command: "menuia" },
  { title: "👥 GRUPPO", command: "menugruppo" },
  { title: "📥 DOWNLOAD", command: "menudownload" },
  { title: "🛠️ STRUMENTI", command: "menustrumenti" },
  { title: "⭐ PREMIUM", command: "menupremium" },
  { title: "💰 EURO", command: "menueuro" }
]

let handler = async (m, { conn, usedPrefix: _p }) => {
  try {
    await conn.sendPresenceUpdate('composing', m.chat)

    let who = m.sender
    let uptime = clockString(process.uptime() * 1000)
    let totalreg = Object.keys(global.db.data.users).length

    let help = Object.values(global.plugins).filter(p => !p.disabled).map(p => ({
      help: Array.isArray(p.help) ? p.help : [p.help],
      tags: Array.isArray(p.tags) ? p.tags : [p.tags],
      prefix: 'customPrefix' in p
    }))

    let menuTags = Object.keys(tags)

    let _text = [
      defaultMenu.testoInizio,
      ...menuTags.map(tag => {
        let commands = help
          .filter(menu => menu.tags.includes(tag))
          .flatMap(menu => menu.help.map(h => {
            let rawCmd = menu.prefix ? h : _p + h
            let styledCmd = toTypewriter(rawCmd)
            return defaultMenu.body
              .replace(/%cmd/g, styledCmd)
              .replace(/%emoji/g, emojicategoria[tag])
          })).join('\n')

        return defaultMenu.header.replace(/%category/g, tags[tag]) + '\n' + commands
      }),
      defaultMenu.testoFine
    ].join('\n')

    let userJid = who.split('@')[0]
    let text = _text.replace(/%user/g, userJid)
                    .replace(/%uptime/g, uptime)
                    .replace(/%totalreg/g, totalreg)

    const buttons = bldButtons.map(btn => ({
      buttonId: _p + btn.command,
      buttonText: { displayText: btn.title },
      type: 1
    }))

    let imageBuffer = null
    try {
      imageBuffer = await fs.readFile(localImg)
    } catch (e) {
      console.log("⚠️ Immagine NON trovata")
    }

    await conn.sendMessage(m.chat, {
      ...(imageBuffer ? { image: imageBuffer } : {}),
      caption: text.trim(),
      footer: "⚡ BLD-BOT Core System",
      buttons: buttons,
      headerType: 4,
      viewOnce: true,
      mentions: [who]
    }, { quoted: m })

    await m.react('⚡')

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, `❌ Errore BLD-SYS: ${e.message}`, m)
  }
}

handler.help = ['menu']
handler.command = ['menu', 'help']

export default handler

function clockString(ms) {
  let h = Math.floor(ms / 3600000)
  let m = Math.floor(ms / 60000) % 60
  let s = Math.floor(ms / 1000) % 60
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}

function toTypewriter(str) {
  const normal = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  const typewriter = "𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿"
  return str.split('').map(char => {
    const index = normal.indexOf(char)
    return index !== -1 ? typewriter.substr(index * 2, 2) : char
  }).join('')
}