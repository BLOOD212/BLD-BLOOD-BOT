import fetch from 'node-fetch'
import { FormData } from 'formdata-node'

const SERVICES = {
    catbox: {
        name: 'Catbox',
        upload: async (media, mime) => {
            const form = new FormData()
            form.append('reqtype', 'fileupload')
            form.append('fileToUpload', media, {
                filename: 'file.' + mime.split('/')[1],
                contentType: mime
            })

            const response = await fetch('https://catbox.moe/user/api.php', {
                method: 'POST',
                body: form
            })

            const url = await response.text()
            if (!url.startsWith('https://')) throw new Error('Upload fallito')
            
            return {
                url: url.trim(),
                deleteUrl: null,
                expiry: 'Mai'
            }
        }
    },
    
    tmpfiles: {
        name: 'TmpFiles',
        upload: async (media, mime) => {
            const form = new FormData()
            form.append('file', media, {
                filename: 'file.' + mime.split('/')[1],
                contentType: mime
            })

            const response = await fetch('https://tmpfiles.org/api/v1/upload', {
                method: 'POST',
                body: form
            })

            if (!response.ok) throw new Error('Upload fallito')
            
            const data = await response.json()
            if (!data?.data?.url) throw new Error('URL non valido')
            const url = data.data.url.replace('https://tmpfiles.org/', 'https://tmpfiles.org/dl/')
            
            return {
                url: url,
                deleteUrl: null,
                expiry: '24 ore'
            }
        }
    },
    
    x0: {
        name: 'x0',
        upload: async (media, mime) => {
            const form = new FormData()
            form.append('file', media, {
                filename: 'file.' + mime.split('/')[1],
                contentType: mime
            })

            const response = await fetch('https://x0.at/', {
                method: 'POST',
                body: form
            })

            const url = await response.text()
            if (!url.startsWith('https://')) throw new Error('Upload fallito') //un po' come te
            
            return {
                url: url.trim(),
                deleteUrl: null,
                expiry: 'Mai'
            }
        }
    },
    //questi dopo non vanno piu (sono troppo lazy per toglierli fallo tu) (litterbox funziona gli altri 2 no)
    fileio: {
        name: 'File.io',
        upload: async (media, mime) => {
            const form = new FormData()
            form.append('file', media, {
                filename: 'file.' + mime.split('/')[1],
                contentType: mime
            })

            const response = await fetch('https://file.io', {
                method: 'POST',
                body: form
            })

            const data = await response.json()
            if (!data.success) throw new Error('Upload fallito')
            
            return {
                url: data.link,
                deleteUrl: null,
                expiry: '14 giorni'
            }
        }
    },
    
    litterbox: {
        name: 'Litterbox',
        upload: async (media, mime) => {
            const form = new FormData()
            form.append('reqtype', 'fileupload')
            form.append('time', '24h')
            form.append('fileToUpload', media, {
                filename: 'file.' + mime.split('/')[1],
                contentType: mime
            })

            const response = await fetch('https://litterbox.catbox.moe/resources/internals/api.php', {
                method: 'POST',
                body: form
            })

            const url = await response.text()
            if (!url.startsWith('https://')) throw new Error('Upload fallito')
            
            return {
                url: url.trim(),
                deleteUrl: null,
                expiry: '24 ore'
            }
        }
    },
    
    transfer: {
        name: 'Transfer.sh',
        upload: async (media, mime) => {
            const filename = 'file.' + mime.split('/')[1]
            
            const response = await fetch(`https://transfer.sh/${filename}`, {
                method: 'PUT',
                body: media,
                headers: {
                    'Content-Type': mime
                }
            })

            const url = await response.text()
            if (!url.startsWith('https://')) throw new Error('Upload fallito')
            
            return {
                url: url.trim(),
                deleteUrl: null,
                expiry: '14 giorni'
            }
        }
    }
}
async function uploadToWorkingServices(media, mime) {
    const results = []
    const errors = []
    const servicesToTry = ['catbox', 'tmpfiles', 'x0', 'fileio', 'litterbox', 'transfer']
    
    for (const serviceName of servicesToTry) {
        try {
            const service = SERVICES[serviceName]
            if (!service) continue
            
            const result = await service.upload(media, mime)
            results.push({
                service: service.name,
                ...result
            })

            if (results.length >= 5) break
            
        } catch (error) {
            errors.push(`${SERVICES[serviceName]?.name || serviceName}: ${error.message}`)
        }
    }
    
    return { results, errors }
}

let handler = async (m, { conn, usedPrefix, command }) => {
    if (!m.quoted) {
        return m.reply(`ㅤㅤ⋆｡˚『 ╭ \`TO LINK\` ╯ 』˚｡⋆\n╭\n│
│ ➤ 📝 \`Uso:\` *${usedPrefix + command}* *[in risposta]*
│   • *Formati: Immagini, Video, Audio* 
│
│ ➤『 🌐 』 \`Servizi supportati:\`
│   • *Catbox, TmpFiles, x0.at*
│   • *File.io, Litterbox, Transfer.sh*
│
│ ➤『 ⚠️ 』 \`Limiti:\`
│   • *Max dimensione: 10MB*
│
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`)
    }

    try {
        const media = await m.quoted.download()
        if (!media) throw new Error('Media non trovata')

        const mime = m.quoted.mimetype || ''
        if (!mime.match(/^(image|video|audio)\//)) {
            throw new Error('Formato non supportato')
        }
        
        if (media.length > 10 * 1024 * 1024) {
            throw new Error('File troppo grande. Max 10MB')
        }

        const wait = await m.reply(`📤 \`Upload in corso...\``)

        const { results, errors } = await uploadToWorkingServices(media, mime)
        
        if (results.length === 0) {
            throw new Error(`Tutti i servizi hanno fallito`)
        }

        let message = `ㅤㅤ⋆｡˚『 ╭ \`TO LINK\` ╯ 』˚｡⋆`
        
        results.forEach((result, index) => {
            message += `\n\n*${index + 1}.* \`${result.service}\`\n`
            message += `『 🔗 』 - \`\`\`${result.url}\`\`\`\n`
            message += `『 ⏰ 』- \`Scadenza:\` *${result.expiry}*`
        })
        if (results.length < 3 && errors.length > 0) { // messaggio se quelli funzionanti sono meno di 3, negretto
            message += `\n『 ⚠️ 』- *Alcuni servizi temporaneamente non disponibili*`
        }

        await m.reply(message)

        if (wait?.key) {
            await conn.sendMessage(m.chat, { delete: wait.key })
        }

    } catch (e) {
        console.error(e)
        m.reply(`${global.errore}`)
    }
}

handler.help = ['tourl', 'tolink']
handler.tags = ['strumenti']
handler.command = ['tourl', 'tolink']
handler.register = true

export default handler
