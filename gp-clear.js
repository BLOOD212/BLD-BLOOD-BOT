import { join } from 'path'
import { existsSync } from 'fs'

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

let handler = async (m, { conn, isOwner, isAdmin, args }) => {
  const chatId = m.chat
  const isGroup = m.isGroup

  if (isGroup && !isAdmin && !isOwner) return m.reply('❌ Solo admin o owner.')
  if (!isGroup && !isOwner) return m.reply('❌ Solo il creatore può usare questo comando.')

  let count = 10
  let target = null

  if (/^\d+$/.test(args[0])) {
    count = parseInt(args[0]) || 10
  } else if (m.mentionedJid?.length) {
    target = m.mentionedJid[0]
    count = parseInt(args[1]) || 10
  } else if (/^\d{5,}$/.test(args[0])) {
    target = args[0] + '@s.whatsapp.net'
    count = parseInt(args[1]) || 10
  } else if (m.quoted) {
    target = m.quoted.sender
    count = parseInt(args[0]) || 10
  }

  if (isNaN(count) || count <= 0) count = 10
  if (count > 20) count = 20

  let msgs = []
  try {
    if (conn.loadMessages) {
      msgs = await conn.loadMessages(chatId, count * 2)
    } else {
      const chat = conn.chats[chatId]
      if (chat && chat.messages) {
        msgs = Object.values(chat.messages)
          .filter(msg => msg && msg.key && msg.key.id)
          .sort((a, b) => (b.messageTimestamp || 0) - (a.messageTimestamp || 0))
          .slice(0, count * 2)
      }
    }
  } catch (e) {
    console.log('Errore nel caricamento messaggi:', e.message)
  }

  if (!msgs.length) return m.reply('❌ Nessun messaggio trovato per la cancellazione.')

  let deleted = 0
  let errors = 0

  for (let msg of msgs) {
    if (!msg?.key?.id) continue
    if (deleted >= count) break

    const sender = msg.key.participant || msg.key.remoteJid
    if (target && sender !== target) continue

    try {
      const deleteKey = {
        remoteJid: chatId,
        fromMe: msg.key.fromMe,
        id: msg.key.id
      }

      if (isGroup && msg.key.participant) {
        deleteKey.participant = msg.key.participant
      }

      await conn.sendMessage(chatId, { delete: deleteKey })
      deleted++
      await delay(1000)
    } catch (e) {
      errors++
      console.log(`Errore durante la delete di ${msg.key.id}:`, e.message)
      if (errors > 5) break
    }
  }

  try {
    const videoPath = join(process.cwd(), 'media', 'innocente.mov')
    if (existsSync(videoPath)) {
      await conn.sendMessage(chatId, {
        video: { url: videoPath },
        ptv: true,
      }, { quoted: m })
    }
  } catch (videoError) {
    console.log('Errore invio video:', videoError.message)
    await m.reply(`✅ Cancellati ${deleted} messaggi${errors > 0 ? ` (${errors} errori)` : ''}.`)
  }
}

handler.help = ['clear [@tag/numero/(quote)']
handler.tags = ['gruppo']
handler.command = /^clear$/i
handler.owner = false
handler.group = true
handler.admin = true

export default handler