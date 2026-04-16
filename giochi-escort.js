import { readFileSync, writeFileSync } from 'fs'
import { join } from 'path'

const ESCORTS_FILE = join(process.cwd(), 'media', 'database', 'escorts.json')
let escorts = []

try {
  escorts = JSON.parse(readFileSync(ESCORTS_FILE, 'utf-8'))
} catch (e) {
  writeFileSync(ESCORTS_FILE, '[]')
  escorts = []
}

let handler = async (m, { conn, text, command, isAdmin, isOwner, isROwner }) => {
  try {

    switch (command) {

      // 📋 LISTA
      case 'escort':
        if (!escorts.length)
          return m.reply('❌ *Nessuna escort disponibile*')

        let list = escorts.map((escort, i) =>
          `${i + 1}. @${escort.split('@')[0]}`
        ).join('\n')

        return conn.reply(m.chat,
`📋 *LISTA ESCORT*

${list}`, m, { mentions: escorts })


      // ➕ AGGIUNGI
      case 'addescort':

        if (!m.isGroup)
          return m.reply('⚠️ Solo nei gruppi')

        if (!isAdmin && !isOwner && !isROwner)
          return m.reply('⚠️ Solo gli admin possono aggiungere escort')

        let userAdd = m.quoted
          ? m.quoted.sender
          : text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'

        if (!userAdd || userAdd === '@s.whatsapp.net')
          return m.reply('❌ Tagga qualcuno o rispondi a un messaggio')

        if (escorts.includes(userAdd))
          return m.reply('⚠️ Questa escort è già in lista')

        escorts.push(userAdd)
        writeFileSync(ESCORTS_FILE, JSON.stringify(escorts, null, 2))

        return conn.reply(
          m.chat,
          `✅ @${userAdd.split('@')[0]} aggiunta alla lista escort!`,
          m,
          { mentions: [userAdd] }
        )


      // ➖ RIMUOVI
      case 'delescort':

        if (!m.isGroup)
          return m.reply('⚠️ Solo nei gruppi')

        if (!isAdmin && !isOwner && !isROwner)
          return m.reply('⚠️ Solo gli admin possono rimuovere escort')

        let userDel = m.quoted
          ? m.quoted.sender
          : text.replace(/[^0-9]/g, '') + '@s.whatsapp.net'

        if (!escorts.includes(userDel))
          return m.reply('⚠️ Questa persona non è nella lista escort')

        escorts = escorts.filter(e => e !== userDel)
        writeFileSync(ESCORTS_FILE, JSON.stringify(escorts, null, 2))

        return conn.reply(
          m.chat,
          `✅ @${userDel.split('@')[0]} rimossa dalla lista escort!`,
          m,
          { mentions: [userDel] }
        )
    }

  } catch (e) {
    console.error('Errore escort:', e)
    m.reply('❌ Errore durante l\'operazione')
  }
}

handler.help = ['escort', 'addescort', 'delescort']
handler.tags = ['divertimento']
handler.command = /^(escort|addescort|delescort)$/i

export default handler
