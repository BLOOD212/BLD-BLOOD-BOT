import fetch from 'node-fetch'
import { FormData } from 'formdata-node'
import { createCanvas, loadImage } from 'canvas'
import { MsEdgeTTS, OUTPUT_FORMAT } from 'msedge-tts'
import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'

const __dirname = path.resolve()
const execPromise = promisify(exec)

function streamToBuffer(stream) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    stream.on('data', (chunk) => chunks.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(chunks)));
    stream.on('error', reject);
  });
}

async function generateImage(prompt) {
  const enhancedPrompt = `A professional TV news studio with a journalist, modern desk, and news ticker displaying "${prompt}" in the background, ultra-realistic, high-definition`
  const encodedPrompt = encodeURIComponent(enhancedPrompt)
  return `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1280&height=720&nologo=true&seed=${Math.floor(Math.random() * 1000000)}`
}

async function deleteFromImgbb(deleteUrl) {
  if (!deleteUrl) return
  await fetch(deleteUrl).catch(() => {})
}

async function createNewsImage(newsTitle, backgroundUrl) {
  const canvas = createCanvas(1280, 720)
  const ctx = canvas.getContext('2d')
  const image = await loadImage(backgroundUrl).catch(() => { throw new Error('Impossibile caricare immagine') })
  
  ctx.drawImage(image, 0, 0, 1280, 720)
  
  // Semi-transparent overlay for ticker
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)'
  ctx.fillRect(0, 560, 1280, 160)
  
  // Red breaking news bar
  ctx.fillStyle = '#CC0000'
  ctx.fillRect(0, 560, 1280, 50)
  
  // News title
  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 36px "Roboto Condensed"'
  ctx.textAlign = 'left'
  splitText(newsTitle, 50).forEach((line, i) => ctx.fillText(line, 30, 600 + i * 40))
  
  // Current date and time
  const days = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato']
  const now = new Date()
  const newsTime = `${days[now.getDay()]} ${now.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })} alle ${now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`
  ctx.font = '28px "Roboto"'
  ctx.fillText(newsTime, 30, 690)
  
  // News channel branding
  const channels = ['TG VAREBOT', 'VAREBOT NEWS 24', 'VAREBOT CHANNEL']
  const newsChannel = channels[Math.floor(Math.random() * channels.length)]
  ctx.font = 'bold 32px "Roboto Condensed"'
  ctx.textAlign = 'right'
  ctx.fillText(newsChannel, 1250, 690)
  
  // Live indicator (top-left corner)
  ctx.fillStyle = '#CC0000'
  ctx.beginPath()
  ctx.arc(30, 30, 10, 0, Math.PI * 2)
  ctx.fill()
  
  ctx.fillStyle = '#FFFFFF'
  ctx.font = 'bold 28px "Roboto"'
  ctx.textAlign = 'left'
  ctx.fillText('LIVE', 50, 35)
  
  ctx.strokeStyle = '#FFFFFF'
  ctx.lineWidth = 2
  ctx.beginPath()
  ctx.arc(30, 30, 10, 0, Math.PI * 2)
  ctx.stroke()
  
  return canvas.toBuffer('image/jpeg', { quality: 0.95 })
}

async function uploadImage(buffer) {
  const formData = new FormData()
  formData.append('key', '8ef100e30039c258e3029366f3af03c8')
  formData.append('image', buffer.toString('base64'))
  formData.append('name', 'tg_news')
  
  const response = await fetch('https://api.imgbb.com/1/upload', {
    method: 'POST',
    body: formData
  })
  return await response.json()
}

async function createNewsAudio(newsTitle) {
  const ttsFile = path.join(__dirname, './temp', 'news_text.mp3')
  const finalAudioFile = path.join(__dirname, './temp', 'final_news.mp3')
  const bgAudioPath = path.join(__dirname, './media/audio/tg.mp3')
  
  fs.mkdirSync(path.dirname(ttsFile), { recursive: true })
  
  const tts = new MsEdgeTTS()
  await tts.setMetadata('it-IT-GianniNeural', OUTPUT_FORMAT.AUDIO_24KHZ_96KBITRATE_MONO_MP3)
  const result = await tts.toStream(newsTitle)
  const ttsBuffer = await streamToBuffer(result.audioStream)

  fs.writeFileSync(ttsFile, ttsBuffer)
  
  await execPromise(`ffmpeg -i "${ttsFile}" -i "${bgAudioPath}" -filter_complex "[1:a]volume=0.3[a1];[0:a][a1]amix=inputs=2:duration=shortest" -c:a mp3 "${finalAudioFile}"`)
  
  return { ttsFile, finalAudioFile }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  if (!text) throw `*⚠️ Inserisci il testo per il titolo del TG*\n\n*Esempio:*\n${usedPrefix + command} Breaking News: varebot miglior bot di zozzap!`
  
  try {
    await m.reply('*🎥 Generazione notizia in corso...*')
    const newsTitle = text.slice(0, 100)
    const backgroundUrl = await generateImage(newsTitle)
    const buffer = await createNewsImage(newsTitle, backgroundUrl)
    
    const uploadData = await uploadImage(buffer)
    if (!uploadData.success) throw 'Errore caricamento immagine'
    
    const days = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato']
    const now = new Date()
    const newsTime = `${days[now.getDay()]} ${now.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' })} alle ${now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`
    const channels = ['TG VAREBOT', 'VAREBOT NEWS 24', 'VAREBOT CHANNEL']
    const newsChannel = channels[Math.floor(Math.random() * channels.length)]
    
    await conn.sendFile(m.chat, uploadData.data.url, 'tg.jpg',
      `*🔴 LIVE - ${newsChannel} 📺*\n*🕐 ${newsTime}*\n\n- *${newsTitle}*\n\n> vare ✧ bot`, m)
    
    await deleteFromImgbb(uploadData.data.delete_url)
    
    const { ttsFile, finalAudioFile } = await createNewsAudio(newsTitle)
    await conn.sendFile(m.chat, finalAudioFile, 'news.mp3', null, m, true, {
      mimetype: 'audio/mp4',
      ptt: true
    })
    
    if (fs.existsSync(ttsFile)) fs.unlinkSync(ttsFile)
    if (fs.existsSync(finalAudioFile)) fs.unlinkSync(finalAudioFile)
  } catch (error) {
    await m.reply(`*❌ Errore generazione news:*\n\n\`\`\`${error.message || 'Errore sconosciuto'}\`\`\``)
  }
}

handler.help = ['tg <testo>']
handler.tags = ['giochi']
handler.command = /^(tg|telegiornale|news)$/i
handler.register = true
handler.group = true
export default handler

function splitText(text, maxLength) {
  const words = text.split(' ')
  const lines = []
  let currentLine = ''
  
  words.forEach(word => {
    if ((currentLine + word).length <= maxLength) {
      currentLine += (currentLine ? ' ' : '') + word
    } else {
      lines.push(currentLine)
      currentLine = word
    }
  })
  if (currentLine) lines.push(currentLine)
  return lines
}
