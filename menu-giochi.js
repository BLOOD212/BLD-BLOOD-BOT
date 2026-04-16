import { promises } from 'fs'
import { join } from 'path'
import { xpRange } from '../lib/levelling.js'
import moment from 'moment-timezone'

// --- PERCORSO DIRETTO AL FILE ---
// Il file si chiama 'menu-giochi.jpeg' ed è nella cartella principale del bot
const localImg = join(process.cwd(), 'menu-giochi.jpeg'); 

const defaultMenu = {
  before: `
╔════════════════════╗
  🎮  *G A M E  C E N T E R* 🎮
╚════════════════════╝
 ┌───────────────────
 │ 👤 *Utente:* %name
 │ 🏆 *Livello:* %level
 │ 💰 *Eris:* %eris
 │ 🎖️ *Rango:* %role
 └───────────────────
 
 *Seleziona una sfida:*
`.trimStart(),
  header: '╭──〔 %category 〕──✦',
  body: '│ 🕹️  %cmd %islimit%isPremium',
  footer: '╰───────────────━━━━\n',
  after: `_Usa %p [comando] per giocare_`,
}

let handler = async (m, { conn, usedPrefix: _p, __dirname }) => {
  let tags = { 'giochi': 'GIOCHI DISPONIBILI' }

  try {
    await conn.sendPresenceUpdate('composing', m.chat)
    
    // Dati Utente
    let user = global.db.data.users[m.sender] || {}
    let { exp = 0, level = 1, role = 'Utente', eris = 0, limit = 10 } = user
    let name = await conn.getName(m.sender)
    let uptime = clockString(process.uptime() * 1000)

    // Filtro Plugin
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

    // Costruzione Testo
    let _text = [
      defaultMenu.before,
      ...Object.keys(tags).map(tag => {
        return defaultMenu.header.replace(/%category/g, tags[tag]) + '\n' +
          [
            ...groups[tag].map(menu =>
              menu.help.map(cmd => defaultMenu.body
                .replace(/%cmd/g, menu.prefix ? cmd : _p + cmd)
                .replace(/%islimit/g, menu.limit ? ' ⚠️' : '')
                .replace(/%isPremium/g, menu.premium ? ' 💎' : '')
                .trimEnd()
              ).join('\n')
            ),
            defaultMenu.footer
          ].join('\n')
      }),
      defaultMenu.after
    ].join('\n')

    let replace = {
      '%': '%', p: _p, eris, name, level, limit, role, uptime
    }

    let text = _text.replace(new RegExp(`%(${Object.keys(replace).sort((a, b) => b.length - a.length).join('|')})`, 'g'), (_, name) => '' + replace[name])

    // --- INVIO CON L'IMMAGINE SPECIFICA ---
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
