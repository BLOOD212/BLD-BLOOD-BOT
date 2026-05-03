import os from 'os'

let handler = async (m, { conn, usedPrefix }) => {
  try {
    // Calcolo latenza
    const start = process.hrtime.bigint()
    // Segna come letto solo se possibile, altrimenti ignora l'errore 403
    await conn.readMessages([m.key]).catch(() => {})
    const end = process.hrtime.bigint()

    const latency = (Number(end - start) / 1000000).toFixed(3)
    const uptimeMs = process.uptime() * 1000
    const uptimeStr = clockString(uptimeMs)

    const activationTime = new Date(Date.now() - uptimeMs).toLocaleString('it-IT', {
      hour: '2-digit', minute: '2-digit', second: '2-digit',
      day: '2-digit', month: '2-digit', year: 'numeric'
    })

    const message = `
╭━━━━━━•✦•━━━━━━╮
              ✨ ᴘɪɴɢ ✨
            ʙʟᴏᴏᴅ-ʙᴏᴛ
╰━━━━━━•✦•━━━━━━╯

◈ 𝖴ptim𝖾: \`${uptimeStr}\`
◈ 𝖫𝖺𝗍𝖾𝗇𝗓𝖺: \`${latency} ms\`
◈ 𝖠𝗏𝗏𝗂𝗈: \`${activationTime}\`

╭━━━━━━•✦•━━━━━━╮
   𝖮𝗐𝗇𝖾𝗋: *BLOOD*
   𝖲𝗍𝖺𝗍𝗈: _Online_
╰━━━━━━•✦•━━━━━━╯`.trim()

    // Invio con gestione errore per evitare il Forbidden (403)
    await conn.sendMessage(m.chat, {
      text: message,
      contextInfo: {
        externalAdReply: {
          title: `ʙʟᴏᴏᴅ ᴘᴇʀғᴏʀᴍᴀɴᴄᴇ ᴄᴏɴᴛʀᴏʟ`,
          body: `Latenza: ${latency}ms`,
          mediaType: 1,
          previewType: 0,
          renderLargerThumbnail: false,
          sourceUrl: ''
        }
      }
    }, { quoted: m }).catch(async (err) => {
      // Se fallisce l'invio "figo" (403), invia solo il testo semplice
      console.error("Errore 403 rilevato, invio testo semplice...")
      await conn.sendMessage(m.chat, { text: message }, { quoted: m })
    })

  } catch (e) {
    console.error("[ERRORE PING]:", e)
  }
}

function clockString(ms) {
  let h = Math.floor(ms / 3600000)
  let m = Math.floor((ms % 3600000) / 60000)
  let s = Math.floor((ms % 60000) / 1000)
  return [h, m, s].map(v => v.toString().padStart(2, '0')).join(':')
}

handler.help = ['ping']
handler.tags = ['info']
handler.command = /^(ping)$/i

export default handler
