import { canLevelUp, xpRange } from '../lib/levelling.js'
import { createCanvas, loadImage } from 'canvas'

export async function before(m, { conn }) {
    if (!global.db.data.chats[m.chat].autolevelup) return !0

    let user = global.db.data.users[m.sender]
    let before = user.level * 1

    while (canLevelUp(user.level, user.exp, global.multiplier)) {
        user.level++
    }

    if (before !== user.level) {
        try {
            const range = xpRange(user.level, global.multiplier)
            const name = await conn.getName(m.sender)

            let profilePic
            try {
                profilePic = await conn.profilePictureUrl(m.sender, 'image')
            } catch {
                profilePic = 'https://i.ibb.co/BKHtdBNp/default-avatar-profile-icon-1280x1280.jpg'
            }

            const width = 1200
            const height = 600
            const canvas = createCanvas(width, height)
            const ctx = canvas.getContext('2d')

            ctx.font = 'bold 80px Arial, sans-serif'
            const gradient = ctx.createLinearGradient(0, 0, width, height)
            gradient.addColorStop(0, '#0b0033')    
            gradient.addColorStop(0.5, '#1a1040')  
            gradient.addColorStop(1, '#2c1654')    
            ctx.fillStyle = gradient
            ctx.fillRect(0, 0, width, height)

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

            try {
                const avatar = await loadImage(profilePic)
                const avatarSize = 120
                const avatarX = 150
                const avatarY = 180

                ctx.save()
                ctx.beginPath()
                ctx.arc(avatarX + avatarSize/2, avatarY + avatarSize/2, avatarSize/2, 0, Math.PI * 2)
                ctx.closePath()
                ctx.clip()
                ctx.drawImage(avatar, avatarX, avatarY, avatarSize, avatarSize)
                ctx.restore()

                ctx.strokeStyle = '#6f42c1'
                ctx.lineWidth = 4
                ctx.beginPath()
                ctx.arc(avatarX + avatarSize/2, avatarY + avatarSize/2, avatarSize/2, 0, Math.PI * 2)
                ctx.stroke()
            } catch (avatarError) {
                console.log('Errore caricamento avatar:', avatarError)
            }

            ctx.shadowColor = '#8653ecff'
            ctx.shadowBlur = 25
            ctx.font = 'bold 80px Arial, sans-serif'
            ctx.textAlign = 'center'
            ctx.strokeStyle = '#9265eeff'
            ctx.lineWidth = 4
            ctx.strokeText('✧ SALITO DI LIVELLO! ✧', width/2, 130)
            ctx.fillStyle = '#fff'
            ctx.fillText('✧ SALITO DI LIVELLO! ✧', width/2, 130)

            ctx.shadowBlur = 15
            ctx.font = 'bold 50px Arial, sans-serif'
            ctx.fillStyle = '#9f7aea'
            ctx.fillText(`❈ ${name} ❈`, width/2, 200)

            ctx.shadowBlur = 0
            ctx.textAlign = 'left'
            ctx.font = 'bold 40px Arial, sans-serif'
            const statsGradient = ctx.createLinearGradient(320, 250, 320, 400)
            statsGradient.addColorStop(0, '#6f42c1')
            statsGradient.addColorStop(1, '#9f7aea')
            ctx.fillStyle = statsGradient
            ctx.fillText(`✧ Livello: ${before} ➯ ${user.level}`, 320, 260)
            ctx.fillText(`❈ Ruolo: ${user.role}`, 320, 320)
            ctx.fillText(`✦ EXP: ${user.exp}/${range.max}`, 320, 380)

            ctx.shadowBlur = 0
            ctx.font = '30px Arial, sans-serif'
            ctx.fillStyle = '#9f7aea'
            ctx.textAlign = 'center'
            ctx.fillText('✧ ⋆ ┈ ┈ ⋆ ☾⋆⁺₊✧ *𝐁𝐋𝐎𝐎𝐃-𝐁𝐎𝐓* ✧₊⁺⋆☽ ⋆ ┈ ┈ ⋆ ✧', width/2, height - 40)

            const buffer = canvas.toBuffer('image/jpeg')
            const caption = `ㅤㅤ⋆｡˚『 ╭ \`LIVELLO\` ╯ 』˚｡⋆\n╭\n│ 🎋 *Nome:* ${name}\n│ ✧ *Livello:* ${before} ➯ ${user.level}\n│ ❈ *Ruolo:* ${user.role}\n│ ✦ *EXP:* ${user.exp}/${range.max}\n*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`

            await conn.sendMessage(m.chat, {
                image: buffer,
                caption: caption
            }, { quoted: m })

        } catch (e) {
            console.error('Errore principale:', e)
        }
    }
    return !0
}
