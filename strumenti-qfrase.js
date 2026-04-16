import fetch from 'node-fetch'
import { FormData } from 'formdata-node'
import { Blob } from 'buffer'

async function uploadToCatbox(buffer) {
  try {
    const formData = new FormData()
    formData.append('reqtype', 'fileupload')
    formData.append('fileToUpload', new Blob([buffer]), 'image.jpg')

    const res = await fetch('https://catbox.moe/user/api.php', {
      method: 'POST',
      body: formData
    })

    if (!res.ok) {
      const text = await res.text()
      throw new Error(`Upload fallito con status ${res.status}: ${text}`)
    }

    const url = await res.text()

    if (!url.startsWith('https://')) {
      throw new Error('URL di risposta non valido')
    }

    return url
  } catch (error) {
    console.error('Errore upload catbox:', error)
    throw `${global.errore}`
  }
}

function getRandomImage() {
  const randomImages = [
    'https://i.ibb.co/nXzBHK6/download-2.jpg',
    'https://i.ibb.co/Sw8NyWTp/download-3.jpg',
    'https://i.ibb.co/MyXm9FNX/download-4.jpg',
    'https://i.ibb.co/MxLtRwpS/f22caee6-3bd6-4490-85bc-806accd5e6ee.jpg',
    'https://i.ibb.co/YTXm1whF/Wthhhh.jpg',
    'https://i.ibb.co/pvDSdyhW/scoiatolino.jpg',
    'https://i.ibb.co/p6TcCy35/downz.jpg',
    'https://i.ibb.co/R4gCTxnc/smh.jpg',
    'https://i.ibb.co/WN5tg3wd/callate.jpg',
    'https://i.ibb.co/nG6L3mT/io.jpg',
    'https://i.ibb.co/7cgvHdD/sybau.jpg',
    'https://i.ibb.co/HfLDcqYL/cane.jpg',
    'https://i.ibb.co/tTpR5GMZ/huh.jpg',
    'https://i.ibb.co/ksNLQGq5/Lois.jpg',
  ]
  return randomImages[Math.floor(Math.random() * randomImages.length)]
}

let handler = async (m, { conn, text, quoted }) => {
  try {
    let quoteText = ''
    let ppUrl = ''
    let username = ''
    const quotedMessage = m.quoted

    if (quotedMessage) {
      const quotedText = quotedMessage.text || ''
      const quotedName = quotedMessage.name || 'Anonimo'

      if (text) {
        const [customText, customPpUrl] = text.split('|').map(s => s.trim())
        quoteText = customText || quotedText
        ppUrl = customPpUrl || ''
      } else {
        quoteText = quotedText
      }

      username = quotedName

      if (quotedMessage.mediaMessage && !ppUrl) {
        const media = await quotedMessage.download()
        ppUrl = await uploadToCatbox(media)
      }
    } else if (text) {
      const [customText, customPpUrl] = text.split('|').map(s => s.trim())
      quoteText = customText
      ppUrl = customPpUrl || ''
      username = m.pushName || '?'
    }

    if (!quoteText) {
      if (quotedMessage) {
        quoteText = 'Messaggio senza testo'
      } else {
        return m.reply(`『 ❌ 』- Inserisci il testo o rispondi a un messaggio con il comando\n\n*Uso:*\n• \`.qfrase <testo>\`\n• \`.qfrase <testo> | <url immagine>\`\n• \`.qfrase\` (rispondendo a un messaggio)`)
      }
    }

    if (!ppUrl) {
      ppUrl = getRandomImage()
    }

    const signature = 'disse il sommo saggio'
    const quoteApi = `https://fastrestapis.fasturl.cloud/maker/quote?text=${encodeURIComponent(quoteText)}&username=${encodeURIComponent(username)}&ppUrl=${encodeURIComponent(ppUrl)}&signature=${encodeURIComponent(signature)}`

    await conn.sendMessage(m.chat, {
      image: { url: quoteApi },
      caption: `> \`vare ✧ bot\``
    }, { quoted: m })

  } catch (e) {
    console.error('Errore nel comando qfrase:', e)
    m.reply(`${global.errore}`)
  }
}

handler.command = ['qfrase', 'q', 'quote']
handler.tags = ['giochi']
handler.help = ['qfrase']
export default handler
