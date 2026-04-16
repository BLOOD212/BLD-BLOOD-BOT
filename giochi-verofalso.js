import axios from 'axios'

const videos = [
  'https://files.catbox.moe/6zx6x3.mp4',// vero
  'https://files.catbox.moe/3dnfl0.mp4'// falso
]

const handler = async (m, { conn }) => {
  const randomVideo = videos[Math.floor(Math.random() * videos.length)]

  try {
    const res = await axios.get(randomVideo, {
      responseType: 'arraybuffer',
      headers: {
        'User-Agent': '𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙',
        'Accept': 'video/mp4'
      }
    })

    await conn.sendMessage(m.chat, {
      video: res.data,
      mimetype: 'video/mp4',
      ptv: true
    }, { quoted: m })

  } catch (err) {
    console.error('❌ Errore caricamento video:', err)
    m.reply(`${global.errore}`)
  }
}

handler.command = /^(vof|veroofalso|verofalso|veroefalso)$/i
handler.tags = ['giochi']
handler.help = ['veroofalso <testo>']
handler.register = true

export default handler
