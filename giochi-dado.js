import { join } from 'path'

let handler = async (m, { conn }) => {
    const diceNumber = Math.floor(Math.random() * 6) + 1
    const stickerPath = join(process.cwd(), 'media', 'sticker', `${diceNumber}.webp`)
    await conn.sendFile(m.chat, stickerPath, 'dado.webp', '', m)
}

handler.help = ['dado']
handler.tags = ['giochi']
handler.command = ['dado', 'dadi']

export default handler