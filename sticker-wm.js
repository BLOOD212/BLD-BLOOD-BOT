import { addExif } from '../lib/sticker.js'

let handler = async (m, { conn, text, usedPrefix }) => {
  if (!m.quoted) return m.reply(`『 ✧ 』 - \`Rispondi allo sticker che vuoi personalizzare\``)
  
  let stiker = false
  try {
    if (!text) {
      let name = conn.getName(m.sender)
      text = `${name}|𝖇𝖑𝖔𝖔𝖉𝖇𝖔𝖙`
    }
    
    let [packname, ...author] = text.split('|')
    author = (author || []).join('|')
    let mime = m.quoted.mimetype || ''
    if (!/webp/.test(mime)) return m.reply(`『 ✧ 』- \`Rispondi a uno sticker\``)
    
    let img = await m.quoted.download()
    if (!img) return m.reply(`${global.errore}`)
    stiker = await addExif(img, packname || '', author || '')
    
  } catch (e) {
    console.error('Errore in sticker-wm:', e)
    if (Buffer.isBuffer(e)) stiker = e
  } finally {
    if (stiker) {
      await conn.sendFile(m.chat, stiker, 'wm.webp', '', m)
    } else {
      m.reply(`${global.errore}`)
    }
  }
}

handler.help = ['wm']
handler.tags = ['sticker', 'strumenti']
handler.command = ['take', 'wm']
handler.register = false
export default handler