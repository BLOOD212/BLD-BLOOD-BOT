import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

let handler = async (m, { conn }) => {
  const fotoPath = path.join(__dirname, '../media/veli.jpeg')

  if (!fs.existsSync(fotoPath)) {
    return m.reply('❌ Foto non trovata: media/veli.jpeg')
  }

  const text = `
𝐕𝐞𝐥𝐢 𝐯𝐨𝐥𝐞𝐯𝐚 𝐞𝐬𝐬𝐞𝐫𝐞 𝐦𝐞𝐬𝐬𝐚 𝐧𝐞𝐥 𝐜𝐚𝐭𝐚𝐥𝐨𝐠𝐨 𝐝𝐢 𝐁𝐥𝐨𝐨𝐝.
𝐌𝐚 𝐁𝐥𝐨𝐨𝐝 𝐧𝐨𝐧 𝐦𝐞𝐭𝐭𝐞 𝐫𝐚𝐠𝐚𝐳𝐳𝐞 𝐧𝐞𝐥 𝐜𝐚𝐭𝐚𝐥𝐨𝐠𝐨,
𝐩𝐞𝐫𝐜𝐡é 𝐥𝐞 𝐟𝐚𝐧𝐧𝐨 𝐩𝐚𝐮𝐫𝐚.
  `.trim()

  await conn.sendMessage(
    m.chat,
    {
      image: fs.readFileSync(fotoPath),
      caption: text
    },
    { quoted: m }
  )
}

handler.command = ['veli']
handler.tags = ['funno']
handler.help = ['veli']

export default handler
