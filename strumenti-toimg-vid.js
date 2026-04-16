// tovideo.js
import { toVideo } from '../lib/converter.js'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!m.quoted) throw `⚠️ Rispondi a un video/audio/immagine con *${usedPrefix + command}*`
  let q = m.quoted
  let mime = (q.msg || q).mimetype || ''
  if (!/video|audio|image/.test(mime)) throw `⚠️ Il file deve essere un video, audio o immagine.`

  let media = await q.download()
  let out = await toVideo(media, mime.split('/')[1])
  
  await conn.sendMessage(m.chat, {
    video: out.data,
    caption: `✅ Convertito in video MP4`
  }, { quoted: m })

  await out.delete()
}
handler.help = ['tovideo (rispondi a file)']
handler.tags = ['tools']
handler.command = /^tovideo$/i

export default handler
