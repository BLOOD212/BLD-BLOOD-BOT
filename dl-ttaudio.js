import fetch from 'node-fetch'

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) {
    await conn.reply(m.chat, `『 🎵 』 \`Inserisci un link di TikTok\`\n*✧ \`Esempio:\`\n- *${usedPrefix}${command} https://www.tiktok.com/@valentinalauretta1/video/7540456196881354006*`, m)
    return
  }
  await conn.sendMessage(m.chat, { react: { text: "🎶", key: m.key } })

  try {
    let d2 = await fetch(`https://eliasar-yt-api.vercel.app/api/search/tiktok?query=${encodeURIComponent(text)}`)
    let dp = await d2.json()
    if (!dp || !dp.results || !dp.results.audio) {
      return conn.reply(m.chat, '❌ Impossibile trovare l\'audio per quel link.', m)
    }
    const doc = {
      audio: { url: dp.results.audio },
      mimetype: 'audio/mp4',
      fileName: `tiktok_audio.mp3`,
      contextInfo: { ...global.fake.contextInfo }
    }
    await conn.sendMessage(m.chat, doc, { quoted: m })
  } catch (err) {
    console.error('Errore dl-ttaudio:', err)
    await conn.reply(m.chat, '❌ Errore durante il download. Riprova più tardi.', m)
  }
}
handler.help = ['ttaudio *<url>*']
handler.tags = ['download']
handler.command = /^(tiktokmp3|ttmp3|ttaudio)$/i

export default handler