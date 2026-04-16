import fs from 'fs/promises' 
import path from 'path'
import Canvas from 'canvas'
async function drawTextWithEmoji(ctx, text, x, y, fontSize = 30) {
  ctx.font = `${fontSize}px "Segoe UI", Arial, sans-serif`
  ctx.textBaseline = 'top'
  ctx.fillStyle = ctx.fillStyle || '#000'
  const emojiMap = {
    '🪙': 'https://emojicdn.elk.sh/🪙?style=apple',
    '👤': 'https://emojicdn.elk.sh/👤?style=apple',
    '🆔': 'https://emojicdn.elk.sh/🆔?style=apple',
    '📅': 'https://emojicdn.elk.sh/📅?style=apple',
    '💳': 'https://emojicdn.elk.sh/💳?style=apple',
    '💎': 'https://emojicdn.elk.sh/💎?style=apple',
    '💰': 'https://emojicdn.elk.sh/💰?style=apple',
    '🎁': 'https://emojicdn.elk.sh/🎁?style=apple',
    '📦': 'https://emojicdn.elk.sh/📦?style=apple',
    '🌟': 'https://emojicdn.elk.sh/🌟?style=apple',
    '✨': 'https://emojicdn.elk.sh/✨?style=apple'
  }
  
  let processedText = text
  let currentX = x
  for (const [emoji, url] of Object.entries(emojiMap)) {
    if (processedText.includes(emoji)) {
      const parts = processedText.split(emoji)
      let tempX = currentX
      processedText = ''
      
      for (let i = 0; i < parts.length; i++) {
        if (parts[i]) {
          ctx.fillText(parts[i], tempX, y)
          tempX += ctx.measureText(parts[i]).width
        }
        if (i < parts.length - 1) {
          try {
            const emojiImage = await Canvas.loadImage(url)
            const emojiSize = fontSize * 1.1
            ctx.drawImage(emojiImage, tempX, y - fontSize * 0.05, emojiSize, emojiSize)
            tempX += emojiSize + 2
          } catch (error) {
            ctx.fillText(emoji, tempX, y)
            tempX += ctx.measureText(emoji).width
          }
        }
      }
      return
    }
  }
  ctx.fillText(text, x, y)
}
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
  if (typeof stroke === 'undefined') stroke = true
  if (typeof radius === 'undefined') radius = 5
  if (typeof radius === 'number') {
    radius = { tl: radius, tr: radius, br: radius, bl: radius }
  } else {
    const defaultRadius = { tl: 0, tr: 0, br: 0, bl: 0 }
    for (const side in defaultRadius) {
      radius[side] = radius[side] || defaultRadius[side]
    }
  }
  ctx.beginPath()
  ctx.moveTo(x + radius.tl, y)
  ctx.lineTo(x + width - radius.tr, y)
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr)
  ctx.lineTo(x + width, y + height - radius.br)
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height)
  ctx.lineTo(x + radius.bl, y + height)
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl)
  ctx.lineTo(x, y + radius.tl)
  ctx.quadraticCurveTo(x, y, x + radius.tl, y)
  ctx.closePath()
  if (fill) ctx.fill()
  if (stroke) {
    ctx.strokeStyle = 'rgba(200,200,200,0.3)'
    ctx.stroke()
  }
}

const xpPerEuro = 100

async function handler(messageInfo) {
  const conn = messageInfo.conn
  const m = messageInfo
  const sender = messageInfo.key?.remoteJid
  const messageText = messageInfo.message?.conversation || messageInfo.message?.extendedTextMessage?.text || ''
  const usedPrefix = '.'
  const commandMatch = messageText.match(/^\.(\w+)(.*)/)
  const command = commandMatch ? commandMatch[1] : ''
  const argsText = commandMatch ? commandMatch[2].trim() : ''
  const args = argsText ? argsText.split(/\s+/) : []
  if (!conn) {
    return
  }
  
  if (!m) {
    return
  }
  
  if (!sender) {
    return
  } // oml mezz'ora pe sta roba
  const enhancedMessage = {
    ...m,
    sender: sender,
    chat: sender,
    from: sender,
    isGroup: false
  }
  
  const messageForOperations = enhancedMessage
  if (!global.db.data.users[sender]) {
    global.db.data.users[sender] = {
      exp: 0,
      euro: 0
    }
  }

  if (!args || args.length === 0 || !args[0]) {
    return conn.reply(
      messageForOperations.chat,
      `
ㅤㅤ⋆｡˚『 ╭ \`SHOP DI EURO\` ╯ 』˚｡⋆
╭
│ 『 💡 』 compra euro in cambio di xp
│
│ \`Usa il comando così:\`
│ *${usedPrefix}compra (numero)*
│ *${usedPrefix}compratutto*
│                           
│ 『 💰 』 \`Prezzo:\` *${xpPerEuro} per 1 euro*
│                           
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`,
      messageForOperations)
  }

  let count = command.replace(/^compra/i, '')
  count = count
    ? /tutto/i.test(count)
      ? Math.floor(global.db.data.users[sender].exp / xpPerEuro)
      : parseInt(count)
    : args[0]
    ? parseInt(args[0])
    : 1
  count = Math.max(1, count)

  if (global.db.data.users[sender].exp < xpPerEuro * count) {
    return conn.reply(
      messageForOperations.chat,
      `『 🧌 』- *Non hai* abbastanza *XP* per acquistare *${count}*`,
      messageForOperations)
  }
  global.db.data.users[sender].exp -= xpPerEuro * count
  global.db.data.users[sender].euro += count
  const canvasWidth = 600
  const canvasHeight = 800
  const canvas = Canvas.createCanvas(canvasWidth, canvasHeight)
  const ctx = canvas.getContext('2d')
  let background
  try {
    const backgroundPath = path.join(process.cwd(), 'media', 'ricevuta.png')
    background = await Canvas.loadImage(backgroundPath)
    ctx.drawImage(background, 0, 0, canvasWidth, canvasHeight)
  } catch (error) {
    const bgGradient = ctx.createLinearGradient(0, 0, 0, canvasHeight)
    bgGradient.addColorStop(0, '#f8f9fa')
    bgGradient.addColorStop(0.5, '#e9ecef')
    bgGradient.addColorStop(1, '#dee2e6')
    ctx.fillStyle = bgGradient
    ctx.fillRect(0, 0, canvasWidth, canvasHeight)
  }
  const headerGradient = ctx.createLinearGradient(0, 0, 0, 200)
  headerGradient.addColorStop(0, 'rgba(248, 249, 250, 0.95)')
  headerGradient.addColorStop(0.5, 'rgba(233, 236, 239, 0.9)')
  headerGradient.addColorStop(1, 'rgba(222, 226, 230, 0.8)')
  ctx.fillStyle = headerGradient
  ctx.fillRect(0, 0, canvasWidth, 200)
  ctx.font = 'bold 48px "Segoe UI", Arial, sans-serif'
  ctx.textAlign = 'center'
  ctx.fillStyle = '#212529'
  ctx.shadowColor = 'rgba(0, 0, 0, 0.3)'
  ctx.shadowBlur = 10
  ctx.shadowOffsetX = 2
  ctx.shadowOffsetY = 4
  ctx.fillText('VARE BOT SHOP', canvasWidth / 2, 60)
  ctx.font = '24px "Segoe UI", Arial, sans-serif'
  ctx.fillStyle = '#495057'
  ctx.shadowColor = 'rgba(0,0,0,0.2)'
  ctx.shadowBlur = 4
  ctx.shadowOffsetX = 1
  ctx.shadowOffsetY = 2
  ctx.fillText("RICEVUTA D'ACQUISTO VALIDA", canvasWidth / 2, 130)
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0
  ctx.strokeStyle = '#adb5bd'
  ctx.lineWidth = 3
  ctx.setLineDash([12, 6])
  ctx.beginPath()
  ctx.moveTo(50, 200)
  ctx.lineTo(canvasWidth - 50, 200)
  ctx.stroke()
  ctx.setLineDash([])
  const boxX = 40
  const boxY = 230
  const boxWidth = canvasWidth - 80
  const boxHeight = 460
  const boxGradient = ctx.createLinearGradient(0, boxY, 0, boxY + boxHeight)
  boxGradient.addColorStop(0, 'rgba(255, 255, 255, 0.98)')
  boxGradient.addColorStop(1, 'rgba(248, 249, 250, 0.95)')
  ctx.fillStyle = boxGradient
  ctx.shadowColor = 'rgba(0,0,0,0.25)'
  ctx.shadowBlur = 20
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 10
  roundRect(ctx, boxX, boxY, boxWidth, boxHeight, 25, true, false)
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 0
  ctx.textAlign = 'left'
  ctx.font = '28px "Segoe UI", Arial, sans-serif'
  ctx.fillStyle = '#212529'
  
  const customerName = conn.getName ? conn.getName(sender) : 'Cliente'
  const orderId = Math.random().toString(36).substr(2, 9).toUpperCase()
  const currentDate = new Date().toLocaleDateString('it-IT')
  
  const details = [
    `👤 Cliente: ${customerName}`,
    `🆔 Ordine: #${orderId}`,
    `📅 Data: ${currentDate}`,
    '',
    '─────────────────────────────────',
    '',
    `💳 Metodo di pagamento: XP`,
    `💎 Prezzo unitario: ${xpPerEuro.toLocaleString()} XP`,
    `💰 Prezzo totale: ${(xpPerEuro * count).toLocaleString()} XP`,
    '',
    `🎁 Prodotto: Euro`,
    `📦 Quantità: x${count}`,
    `🌟 Euro totali: ${global.db.data.users[sender].euro.toLocaleString()}`,
    '',
    '─────────────────────────────────'
  ]

  let y = boxY + 30
  for (const line of details) {
    if (line === '') {
      y += 15
    } else if (line.includes('─')) {
      ctx.fillStyle = '#868e96'
      ctx.font = '20px "Segoe UI", Arial, sans-serif'
      ctx.shadowColor = 'rgba(31, 29, 29, 0.8)'
      ctx.shadowBlur = 2
      ctx.shadowOffsetY = 1
      ctx.fillText(line, boxX + 30, y)
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetY = 0
      ctx.fillStyle = '#212529'
      ctx.font = '28px "Segoe UI", Arial, sans-serif'
      y += 25
    } else {
      ctx.shadowColor = 'rgba(0,0,0,0.1)'
      ctx.shadowBlur = 1
      ctx.shadowOffsetY = 1
      await drawTextWithEmoji(ctx, line, boxX + 30, y, 28)
      ctx.shadowColor = 'transparent'
      ctx.shadowBlur = 0
      ctx.shadowOffsetY = 0
      y += 35
    }
  }

  const footerHeight = 90
  const footerY = canvasHeight - footerHeight
  const footerGradient = ctx.createLinearGradient(0, footerY, 0, canvasHeight)
  footerGradient.addColorStop(0, '#495057')
  footerGradient.addColorStop(1, '#343a40')
  ctx.fillStyle = footerGradient
  ctx.shadowColor = 'rgba(0,0,0,0.3)'
  ctx.shadowBlur = 15
  ctx.shadowOffsetY = -5
  ctx.fillRect(0, footerY, canvasWidth, footerHeight)
  ctx.shadowColor = 'transparent'
  ctx.shadowBlur = 0
  ctx.shadowOffsetY = 0
  ctx.textAlign = 'center'
  ctx.font = 'bold 32px "Segoe UI", Arial, sans-serif'
  ctx.fillStyle = '#ffffff'
  ctx.shadowColor = 'rgba(0, 0, 0, 0.93)'
  ctx.shadowBlur = 8
  ctx.shadowOffsetX = 2
  ctx.shadowOffsetY = 3
  
  const thanksMsg = count > 1 
    ? 'Grazie per il tuo acquisto!'
    : 'Grazie per averci scelto!'
  
  await drawTextWithEmoji(ctx, thanksMsg, canvasWidth / 2, footerY + 25, 32)
  const tempDir = path.join(process.cwd(), 'temp')
  await fs.mkdir(tempDir, { recursive: true })
  const tempFile = path.join(tempDir, `receipt_${sender}_${Date.now()}.png`)
  const buffer = canvas.toBuffer('image/png')
  await fs.writeFile(tempFile, buffer) 
  
  try {
    await conn.sendFile(messageForOperations.chat, tempFile, 'ricevuta.png', null, messageForOperations)
  } catch (error) {
    await conn.reply(messageForOperations.chat, 
      `✅ Acquisto completato!\n\n💰 Hai acquistato ${count} 🪙 euro per ${(xpPerEuro * count).toLocaleString()} XP\n🌟 Euro totali: ${global.db.data.users[sender].euro.toLocaleString()}`, 
      messageForOperations)
  }
  await fs.unlink(tempFile).catch(() => {})
}

handler.help = ['compra (numero)']
handler.tags = ['euro']
handler.command = ['compra', 'compratutto']
handler.register = true
export default handler