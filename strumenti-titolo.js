import { createCanvas, loadImage } from 'canvas'
import { webp2png, webp2mp4 } from '../lib/webp2png.js'
import { tmpdir } from 'os'
import path from 'path'
import fs from 'fs'
import { spawn } from 'child_process'

function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ')
  let lines = []
  let currentLine = ''

  for (let word of words) {
    const testLine = currentLine ? currentLine + ' ' + word : word
    const { width: testWidth } = ctx.measureText(testLine)
    if (testWidth > maxWidth && currentLine) {
      lines.push(currentLine)
      currentLine = word
    } else {
      currentLine = testLine
    }
  }

  if (currentLine) lines.push(currentLine)
  return lines
}

async function getVideoDimensions(videoPath) {
  return new Promise((resolve, reject) => {
    const ffprobe = spawn('ffprobe', [
      '-v', 'quiet',
      '-print_format', 'json',
      '-show_format',
      '-show_streams',
      videoPath
    ])
    
    let output = ''
    ffprobe.stdout.on('data', (data) => {
      output += data.toString()
    })
    
    ffprobe.on('close', (code) => {
      if (code === 0) {
        try {
          const data = JSON.parse(output)
          const videoStream = data.streams.find(s => s.codec_type === 'video')
          if (videoStream) {
            resolve({
              width: parseInt(videoStream.width),
              height: parseInt(videoStream.height)
            })
          } else {
            reject(new Error('No video stream found'))
          }
        } catch (error) {
          reject(error)
        }
      } else {
        reject(new Error(`ffprobe failed with code ${code}`))
      }
    })
  })
}

function calculateTextLayout(width, height, titolo, posizione) {
  const maxDimension = 2000
  let canvasWidth = width
  let canvasHeight = height
  
  if (width > maxDimension || height > maxDimension) {
    const scale = Math.min(maxDimension / width, maxDimension / height)
    canvasWidth = Math.floor(width * scale)
    canvasHeight = Math.floor(height * scale)
  }
  
  let fontSize = Math.max(30, Math.min(80, Math.floor(canvasWidth / 15)))
  const maxTextWidth = canvasWidth * 0.85

  const canvas = createCanvas(canvasWidth, canvasHeight)
  const ctx = canvas.getContext('2d')
  ctx.font = `bold ${fontSize}px Arial, sans-serif`

  let lines = wrapText(ctx, titolo, maxTextWidth)

  while (lines.length > 4 && fontSize > 24) {
    fontSize -= 3
    ctx.font = `bold ${fontSize}px Arial, sans-serif`
    lines = wrapText(ctx, titolo, maxTextWidth)
  }

  const lineHeight = fontSize * 1.2
  const paddingTop = 15
  const paddingBottom = 15
  const bgHeight = Math.ceil(lineHeight * lines.length + paddingTop + paddingBottom)

  return {
    fontSize,
    lines,
    lineHeight,
    paddingTop,
    paddingBottom,
    bgHeight,
    canvasWidth,
    canvasHeight,
    maxTextWidth
  }
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!m.quoted) throw `『 📎 』 \`Rispondi a un'immagine, video, GIF o sticker\`\n\n\`Esempio:\`\n*${usedPrefix + command} my honest reaction*`

    const mime = m.quoted.mimetype || ''
    if (!mime) throw '⚠️ \`Impossibile determinare il tipo di file.\`'

    const media = await m.quoted.download()
    if (!media || media.length === 0) throw '⚠️ \`Errore nel download del file.\`'

    const textParts = text ? text.split('|').map(s => s.trim()) : []
    const [posRaw, ...rest] = textParts
    
    const posizioni = ['alto', 'basso', 'sinistra', 'destra']
    const posizione = posizioni.includes(posRaw?.toLowerCase()) ? posRaw.toLowerCase() : 'alto'
    
    let titolo = ''
    if (rest.length > 0) {
      titolo = rest.join(' ')
    } else if (posRaw && !posizioni.includes(posRaw?.toLowerCase())) {
      titolo = posRaw
    } else {
      titolo = 'MY HONEST REACTION'
    }
    
    titolo = titolo.toUpperCase().substring(0, 200)

    if (/video|gif|webp/.test(mime) && (mime.includes('video') || mime.includes('gif') || (mime.includes('webp') && m.quoted.seconds))) {
      const inputPath = path.join(tmpdir(), `input_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.mp4`)
      const outputPath = path.join(tmpdir(), `output_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.mp4`)
      
      try {
        let vidBuffer
        if (/webp/.test(mime)) {
          vidBuffer = await webp2mp4(media)
        } else {
          vidBuffer = media
        }
        
        fs.writeFileSync(inputPath, vidBuffer)
        const { width, height } = await getVideoDimensions(inputPath)
        const textLayout = calculateTextLayout(width, height, titolo, posizione)
        let overlayCanvas
        if (posizione === 'alto' || posizione === 'basso') {
          overlayCanvas = createCanvas(textLayout.canvasWidth, textLayout.bgHeight)
        } else {
          overlayCanvas = createCanvas(textLayout.bgHeight, textLayout.canvasHeight)
        }
        
        const overlayCtx = overlayCanvas.getContext('2d')
        overlayCtx.font = `bold ${textLayout.fontSize}px Arial, sans-serif`
        overlayCtx.textAlign = 'center'
        overlayCtx.textBaseline = 'middle'
        overlayCtx.imageSmoothingEnabled = true
        overlayCtx.imageSmoothingQuality = 'high'
        overlayCtx.fillStyle = 'white'
        overlayCtx.fillRect(0, 0, overlayCanvas.width, overlayCanvas.height)
        overlayCtx.fillStyle = 'black'
        
        if (posizione === 'sinistra' || posizione === 'destra') {
          overlayCtx.save()
          if (posizione === 'sinistra') {
            overlayCtx.translate(textLayout.bgHeight / 2, textLayout.canvasHeight / 2)
            overlayCtx.rotate(-Math.PI / 2)
          } else {
            overlayCtx.translate(textLayout.bgHeight / 2, textLayout.canvasHeight / 2)
            overlayCtx.rotate(Math.PI / 2)
          }
          
          const totalTextHeight = textLayout.lines.length * textLayout.lineHeight
          const startY = -totalTextHeight / 2 + textLayout.lineHeight / 2
          
          for (let i = 0; i < textLayout.lines.length; i++) {
            overlayCtx.fillText(textLayout.lines[i], 0, startY + i * textLayout.lineHeight)
          }
          overlayCtx.restore()
        } else {
          for (let i = 0; i < textLayout.lines.length; i++) {
            const y = textLayout.paddingTop + i * textLayout.lineHeight + textLayout.lineHeight / 2
            overlayCtx.fillText(textLayout.lines[i], overlayCanvas.width / 2, y)
          }
        }
        const overlayPath = path.join(tmpdir(), `overlay_${Date.now()}_${Math.random().toString(36).substr(2, 9)}.png`)
        const overlayBuffer = overlayCanvas.toBuffer('image/png')
        fs.writeFileSync(overlayPath, overlayBuffer)
        let filterComplex = ''
        let scaleFilter = ''
        if (width > 2000 || height > 2000) {
          const scale = Math.min(2000 / width, 2000 / height)
          const newWidth = Math.floor(width * scale)
          const newHeight = Math.floor(height * scale)
          scaleFilter = `scale=${newWidth}:${newHeight}`
        }
        
        switch (posizione) {
          case 'alto':
            if (scaleFilter) {
              filterComplex = `[0:v]${scaleFilter}[scaled];[1:v][scaled]vstack=inputs=2`
            } else {
              filterComplex = '[1:v][0:v]vstack=inputs=2'
            }
            break
          case 'basso':
            if (scaleFilter) {
              filterComplex = `[0:v]${scaleFilter}[scaled];[scaled][1:v]vstack=inputs=2`
            } else {
              filterComplex = '[0:v][1:v]vstack=inputs=2'
            }
            break
          case 'sinistra':
            if (scaleFilter) {
              filterComplex = `[0:v]${scaleFilter}[scaled];[1:v][scaled]hstack=inputs=2`
            } else {
              filterComplex = '[1:v][0:v]hstack=inputs=2'
            }
            break
          case 'destra':
            if (scaleFilter) {
              filterComplex = `[0:v]${scaleFilter}[scaled];[scaled][1:v]hstack=inputs=2`
            } else {
              filterComplex = '[0:v][1:v]hstack=inputs=2'
            }
            break
        }

        await new Promise((resolve, reject) => {
          const ffmpeg = spawn('ffmpeg', [
            '-y', 
            '-i', inputPath,
            '-i', overlayPath,
            '-filter_complex', filterComplex,
            '-c:a', 'copy',
            '-preset', 'fast',
            outputPath
          ])
          
          let errorOutput = ''
          ffmpeg.stderr.on('data', (data) => {
            errorOutput += data.toString()
          })
          
          ffmpeg.on('close', code => {
            if (fs.existsSync(outputPath) && code === 0) {
              resolve()
            } else {
              console.error('FFmpeg error:', errorOutput)
              reject(new Error(`❌ Errore con ffmpeg (code: ${code})`))
            }
          })
          
          ffmpeg.on('error', (err) => {
            reject(new Error(`${global.errore}`))
          })
        })

        const out = fs.readFileSync(outputPath)
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath)
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath)
        if (fs.existsSync(overlayPath)) fs.unlinkSync(overlayPath)
        
        return conn.sendFile(m.chat, out, 'video_titolo.mp4', '', m)
        
      } catch (error) {
        if (fs.existsSync(inputPath)) fs.unlinkSync(inputPath)
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath)
        throw error
      }
    }
    let buffer
    if (/webp/.test(mime)) {
      buffer = await webp2png(media)
    } else if (/image/.test(mime)) {
      buffer = media
    } else {
      throw '⚠️ \`Tipo file non supportato. Usa immagini, video, GIF o sticker.\`'
    }

    const img = await loadImage(buffer)
    let width = img.width
    let height = img.height

    const maxDimension = 2000
    if (width > maxDimension || height > maxDimension) {
      const scale = Math.min(maxDimension / width, maxDimension / height)
      width = Math.floor(width * scale)
      height = Math.floor(height * scale)
    }
    
    let fontSize = Math.max(30, Math.min(80, Math.floor(width / 15)))
    const maxTextWidth = width * 0.85

    let canvas = createCanvas(width, height)
    let ctx = canvas.getContext('2d')
    ctx.font = `bold ${fontSize}px Arial, sans-serif`

    let lines = wrapText(ctx, titolo, maxTextWidth)

    while (lines.length > 4 && fontSize > 24) {
      fontSize -= 3
      ctx.font = `bold ${fontSize}px Arial, sans-serif`
      lines = wrapText(ctx, titolo, maxTextWidth)
    }

    const lineHeight = fontSize * 1.2
    const paddingTop = 15
    const paddingBottom = 15
    const bgHeight = Math.ceil(lineHeight * lines.length + paddingTop + paddingBottom)

    if (posizione === 'alto' || posizione === 'basso') {
      canvas = createCanvas(width, height + bgHeight)
    } else {
      canvas = createCanvas(width + bgHeight, height)
    }

    ctx = canvas.getContext('2d')
    ctx.font = `bold ${fontSize}px Arial, sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    ctx.imageSmoothingEnabled = true
    ctx.imageSmoothingQuality = 'high'

    switch (posizione) {
      case 'alto':
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, width, bgHeight)
        
        ctx.drawImage(img, 0, bgHeight, width, height)
   
        ctx.fillStyle = 'black'
        for (let i = 0; i < lines.length; i++) {
          const y = paddingTop + i * lineHeight + lineHeight / 2
          ctx.fillText(lines[i], width / 2, y)
        }
        break

      case 'basso':
        ctx.drawImage(img, 0, 0, width, height)
    
        ctx.fillStyle = 'white'
        ctx.fillRect(0, height, width, bgHeight)

        ctx.fillStyle = 'black'
        for (let i = 0; i < lines.length; i++) {
          const y = height + paddingTop + i * lineHeight + lineHeight / 2
          ctx.fillText(lines[i], width / 2, y)
        }
        break

      case 'sinistra':
        ctx.fillStyle = 'white'
        ctx.fillRect(0, 0, bgHeight, height)
        ctx.drawImage(img, bgHeight, 0, width, height)
        ctx.fillStyle = 'black'
        ctx.save()
        ctx.translate(bgHeight / 2, height / 2)
        ctx.rotate(-Math.PI / 2)
        
        const totalTextHeight = lines.length * lineHeight
        const startY = -totalTextHeight / 2 + lineHeight / 2
        
        for (let i = 0; i < lines.length; i++) {
          ctx.fillText(lines[i], 0, startY + i * lineHeight)
        }
        ctx.restore()
        break

      case 'destra':
        ctx.drawImage(img, 0, 0, width, height)

        ctx.fillStyle = 'white'
        ctx.fillRect(width, 0, bgHeight, height)
        
        ctx.fillStyle = 'black'
        ctx.save()
        ctx.translate(width + bgHeight / 2, height / 2)
        ctx.rotate(Math.PI / 2)
        
        const totalTextHeight2 = lines.length * lineHeight
        const startY2 = -totalTextHeight2 / 2 + lineHeight / 2
        
        for (let i = 0; i < lines.length; i++) {
          ctx.fillText(lines[i], 0, startY2 + i * lineHeight)
        }
        ctx.restore()
        break
    }

    const out = canvas.toBuffer('image/png')
    return conn.sendFile(m.chat, out, 'titolo.png', '', m)

  } catch (error) {
    console.error('Errore nel comando titolo:', error)
    return m.reply(`${global.errore}`)
  }
}

handler.help = ['titolo [posizione] | [testo]']
handler.tags = ['strumenti']
handler.command = /^titolo$/i
handler.register = true
export default handler