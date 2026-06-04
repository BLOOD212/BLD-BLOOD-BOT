import { promises } from 'fs'
import { join } from 'path'

// --- PERCORSO IMMAGINE ---
const localImg = join(process.cwd(), 'menu-strumenti.jpeg');

const defmenu = {
  testoInizio: `
⚡  〔 𝐁 𝐋 𝐃  •  𝐓 𝐎 𝐎 𝐋 𝐒 〕  ⚡

┃ 👤 𝚄ﺘ𝚎𝚗𝚝𝚎 ⭔ @%user
┃ ⚙️ 𝙼𝚘𝚍𝚞𝚕𝚒 ⭔ 𝚂𝚝𝚛𝚞𝚖𝚎𝚗𝚝𝚒
┃ ⚠️ 𝚂𝚝𝚊𝚝𝚞𝚜 ⭔ 𝙳𝚎𝚎𝚙 𝚂𝚌𝚊𝚗
`.trimStart(),

  header: '\n〔 %category 〕',
  body: '┃ ⌲ %emoji %cmd',
  footer: '',
  testoFine: `\n_☣️ Estrazione dati completata._`
}

let handler = async (m, { conn, usedPrefix: _p }) => {
  let tags = {
    'strumenti': '⚡ 𝙱𝙻𝙳 𝙻𝙰𝙱𝙾𝚁𝙰𝚃𝙾𝚁𝙸𝙾 ⚡'
  }

  try {
    await conn.sendPresenceUpdate('composing', m.chat)
    
    // Filtro plugin per la categoria strumenti
    let help = Object.values(global.plugins)
      .filter(plugin => !plugin.disabled && plugin.tags && plugin.tags.includes('strumenti'))
      .map(plugin => ({
        help: Array.isArray(plugin.help) ? plugin.help : [plugin.help],
        prefix: 'customPrefix' in plugin,
      }))

    // Costruzione del testo
    let commands = help.flatMap(menu => 
      menu.help.map(cmd => {
        let rawCmd = menu.prefix ? cmd : _p + cmd
        let styledCmd = toTypewriter(rawCmd)
        return defmenu.body
          .replace(/%cmd/g, styledCmd)
          .replace(/%emoji/g, '🧪')
      })
    ).join('\n')

    let _text = [
      defmenu.testoInizio,
      defmenu.header.replace(/%category/g, tags['strumenti']) + '\n' + commands,
      defmenu.testoFine
    ].join('\n')

    let userJid = m.sender.split('@')[0]
    let text = _text.replace(/%user/g, userJid)

    let fake = global.fake || {};

    await m.react('🧪')

    await conn.sendMessage(m.chat, {
      image: { url: localImg },
      caption: text.trim(),
      contextInfo: {
        ...fake.contextInfo,
        mentionedJid: [m.sender],
        forwardedNewsletterMessageInfo: {
          ...fake.contextInfo?.forwardedNewsletterMessageInfo,
          newsletterJid: '120363232743845068@newsletter',
          newsletterName: "🩸 Cyber Blood - Tools ☣️"
        }
      }
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    conn.reply(m.chat, '☣️ ERRORE NEL SETTORE STRUMENTI: File immagine mancante o corrotto.', m)
  }
}

handler.help = ['menustrumenti']
handler.tags = ['menu']
handler.command = ['menutools', 'menustrumenti']

export default handler

function toTypewriter(str) {
  const normal = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  const typewriter = "𝚊𝚋𝚌𝚍𝚎𝚏𝚐𝚑𝚒𝚓𝚔𝚕𝚖𝚗𝚘𝚙𝚚𝚛𝚜𝚝𝚞𝚟𝚠𝚡𝚢𝚣𝙰𝙱𝙲𝙳𝙴𝙵𝙶𝙷𝙸𝙹𝙺𝙻𝙼𝙽𝙾𝙿𝚀𝚁𝚂𝚃𝚄𝚅𝚆𝚇𝚈𝚉𝟶𝟷𝟸𝟹𝟺𝟻𝟼𝟽𝟾𝟿"
  return str.split('').map(char => {
    const index = normal.indexOf(char)
    return index !== -1 ? typewriter.substr(index * 2, 2) : char
  }).join('')
}