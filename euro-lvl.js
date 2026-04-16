import { canLevelUp, xpRange } from '../lib/levelling.js'
import { createCanvas, loadImage } from 'canvas'
import { roles } from './bot-ruoli.js'

let handler = async (m, { conn }) => {
  try {
    // Ottieni la foto profilo dell'utente
    let profilePic
    try {
      profilePic = await conn.profilePictureUrl(m.sender, 'image')
    } catch {
      profilePic = 'https://i.ibb.co/BKHtdBNp/default-avatar-profile-icon-1280x1280.jpg'
    }

    let name = await conn.getName(m.sender)
    let user = global.db.data.users[m.sender]
    
    // Usa gli stessi calcoli dell'autolivello
    let { min, xp, max } = xpRange(user.level, global.multiplier)
    
    // Calcola il ruolo attuale e prossimo
    let currentRole = Object.entries(roles)
      .sort((a, b) => b[1] - a[1])
      .find(([, minLevel]) => user.level >= minLevel)?.[0] || Object.keys(roles)[0]

    let nextRole = Object.entries(roles)
      .sort((a, b) => a[1] - b[1])
      .find(([, minLevel]) => user.level < minLevel)?.[0] || Object.keys(roles).slice(-1)[0]

    // Calcoli per la progress bar
    let currentXP = user.exp - min
    let neededXP = max - user.exp
    let totalXPforLevel = max - min
    let percentage = Math.min((currentXP / totalXPforLevel) * 100, 100)

    // Crea il canvas con la stessa estetica dell'autolivello
    const width = 1200
    const height = 600
    const canvas = createCanvas(width, height)
    const ctx = canvas.getContext('2d')

    // Sfondo con gradiente (stesso dell'autolivello)
    const gradient = ctx.createLinearGradient(0, 0, width, height)
    gradient.addColorStop(0, '#0b0033')    
    gradient.addColorStop(0.5, '#1a1040')  
    gradient.addColorStop(1, '#2c1654')    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, width, height)

    // Stelle di sfondo (stesso dell'autolivello)
    for(let i = 0; i < 150; i++) {
      const size = Math.random() * 3
      const x = Math.random() * width
      const y = Math.random() * height
      const opacity = Math.random() * 0.8 + 0.2
      ctx.shadowColor = 'white'
      ctx.shadowBlur = 15
      ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`
      ctx.beginPath()
      ctx.arc(x, y, size, 0, Math.PI * 2)
      ctx.fill()
    }
    ctx.shadowBlur = 0

    // Box principale (stesso dell'autolivello)
    const boxGradient = ctx.createLinearGradient(50, 50, width - 50, height - 50)
    boxGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)')
    boxGradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.05)')
    boxGradient.addColorStop(1, 'rgba(255, 255, 255, 0.1)')
    ctx.fillStyle = boxGradient
    ctx.strokeStyle = '#6f42c1'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.roundRect(50, 50, width - 100, height - 100, 30)
    ctx.fill()
    ctx.stroke()

    // Carica e disegna la foto profilo
    try {
      const avatar = await loadImage(profilePic)
      const avatarSize = 120
      const avatarX = 150
      const avatarY = 180

      // Cerchio per la foto profilo
      ctx.save()
      ctx.beginPath()
      ctx.arc(avatarX + avatarSize/2, avatarY + avatarSize/2, avatarSize/2, 0, Math.PI * 2)
      ctx.closePath()
      ctx.clip()
      ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize)
      ctx.restore()

      // Bordo del cerchio
      ctx.strokeStyle = '#6f42c1'
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.arc(avatarX + avatarSize/2, avatarY + avatarSize/2, avatarSize/2, 0, Math.PI * 2)
      ctx.stroke()
    } catch (avatarError) {
      console.log('Errore caricamento avatar:', avatarError)
    }

    // Titolo "STATISTICHE"
    ctx.shadowColor = '#8653ecff'
    ctx.shadowBlur = 25
    ctx.font = 'bold 80px Arial, sans-serif'
    ctx.textAlign = 'center'
    ctx.strokeStyle = '#9265eeff'
    ctx.lineWidth = 4
    ctx.strokeText('✧ STATISTICHE ✧', width/2, 130)
    ctx.fillStyle = '#fff'
    ctx.fillText('✧ STATISTICHE ✧', width/2, 130)

    // Nome utente
    ctx.shadowBlur = 15
    ctx.font = 'bold 50px Arial, sans-serif'
    ctx.fillStyle = '#9f7aea'
    ctx.fillText(`❈ ${name} ❈`, width/2, 200)

    // Statistiche
    ctx.shadowBlur = 0
    ctx.textAlign = 'left'
    ctx.font = 'bold 40px Arial, sans-serif'
    const statsGradient = ctx.createLinearGradient(320, 250, 320, 450)
    statsGradient.addColorStop(0, '#6f42c1')
    statsGradient.addColorStop(1, '#9f7aea')
    ctx.fillStyle = statsGradient
    ctx.fillText(`✧ Livello: ${user.level}`, 320, 260)
    ctx.fillText(`❈ Ruolo: ${currentRole}`, 320, 310)
    ctx.fillText(`✦ EXP: ${user.exp}/${max}`, 320, 360)
    ctx.fillText(`🔼 Prossimo: ${nextRole}`, 320, 410)

    // Barra di progresso (stessa estetica dell'autolivello)
    const barWidth = 900
    const barHeight = 40
    const barX = (width - barWidth)/2
    const barY = 480
    const barProgress = Math.min(currentXP/totalXPforLevel, 1)

    // Sfondo della barra
    const barBgGradient = ctx.createLinearGradient(barX, barY, barX, barY + barHeight)
    barBgGradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)')
    barBgGradient.addColorStop(1, 'rgba(255, 255, 255, 0.05)')
    ctx.fillStyle = barBgGradient
    ctx.strokeStyle = '#6f42c1'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.roundRect(barX, barY, barWidth, barHeight, 20)
    ctx.fill()
    ctx.stroke()

    // Progresso della barra
    if (barProgress > 0) {
      const progressGradient = ctx.createLinearGradient(barX, 0, barX + barWidth, 0)
      progressGradient.addColorStop(0, '#6f42c1')
      progressGradient.addColorStop(0.5, '#9f7aea')
      progressGradient.addColorStop(1, '#d6bcfa')
      ctx.fillStyle = progressGradient
      ctx.beginPath()
      ctx.roundRect(barX, barY, barWidth * barProgress, barHeight, 20)
      ctx.fill()
    }

    // Percentuale sopra la barra
    ctx.shadowColor = '#fff'
    ctx.shadowBlur = 10
    ctx.font = 'bold 25px Arial, sans-serif'
    ctx.fillStyle = '#fff'
    ctx.textAlign = 'center'
    ctx.fillText(`${percentage.toFixed(1)}%`, width/2, barY - 10)

    // Footer
    ctx.shadowBlur = 0
    ctx.font = '30px Arial, sans-serif'
    ctx.fillStyle = '#9f7aea'
    ctx.textAlign = 'center'
    ctx.fillText('✧ ⋆ ┈ ┈ ⋆ ☾⋆⁺₊✧ varebot ✧₊⁺⋆☽ ⋆ ┈ ┈ ⋆ ✧', width/2, height - 40)

    const buffer = canvas.toBuffer('image/jpeg')

    // Verifica se può salire di livello
    if (!canLevelUp(user.level, user.exp, global.multiplier)) {
      const caption = `
ㅤㅤ⋆｡˚『 ╭ \`STATISTICHE\` ╯ 』˚｡⋆\n╭
│ 『 👤 』 \`Nome:\` *${name}*
│ 『 🎯 』 \`Ruolo:\` *${currentRole}*
│ 『 📈 』 \`Livello:\` *${user.level}*
│
│ 『 ✨ 』 _*Esperienza:*_
│ • \`EXP:\` *${formatNumber(currentXP)}/${formatNumber(totalXPforLevel)}*
│ • \`Progresso:\` *${percentage.toFixed(1)}%*
│
│ 『 🔼 』 _*Prossimo livello:*_
│ • \`Ruolo:\` *${nextRole}*
│ • \`Mancano:\` *${formatNumber(neededXP)} XP*
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`

      await conn.sendMessage(m.chat, {
        image: buffer,
        caption: caption
      }, { quoted: m })

      return
    }

    // Se può salire di livello, fallo salire
    let before = user.level
    while (canLevelUp(user.level, user.exp, global.multiplier)) {
      user.level++
    }

    if (before !== user.level) {
      let levelGain = user.level - before
      
      // Aggiorna il ruolo dopo il level up
      currentRole = Object.entries(roles)
        .sort((a, b) => b[1] - a[1])
        .find(([, minLevel]) => user.level >= minLevel)?.[0] || Object.keys(roles)[0]

      const caption = `
ㅤㅤ⋆｡˚『 ╭ \`LIVELLO\` ╯ 』˚｡⋆\n╭
│
│ 『 📈 』 _*Progresso: *_
│ • \`Da:\` Lvl *${before}*
│ • \`A:\` Lvl *${user.level}*
│ • \`Livelli saliti:\` *+${levelGain}*
│
│ 『 🎯 』 _*Nuovo Ruolo:*_
│ ${currentRole}
│
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`

      await conn.sendMessage(m.chat, {
        image: buffer,
        caption: caption
      }, { quoted: m })
    }

  } catch (e) {
    console.error('Errore comando lvl:', e)
    await conn.reply(m.chat, '⚠️ Errore durante il caricamento delle statistiche', m)
  }
}

function formatNumber(num) {
  return num.toLocaleString('it-IT')
}

handler.help = ['livello']
handler.tags = ['euro']
handler.command = ['livello', 'lvl', 'levelup']
handler.register = true
export default handler