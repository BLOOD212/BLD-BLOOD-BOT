import { exec } from 'child_process'
import { promisify } from 'util'
import fs from 'fs'
import path from 'path'
import os from 'os'

const execAsync = promisify(exec)

async function convertToAudio(media) {
    try {
        const tempDir = os.tmpdir()
        const timestamp = Date.now()
        const randomId = Math.random().toString(36).substring(2, 8)
        const inputFile = path.join(tempDir, `audio_input_${timestamp}_${randomId}`)
        const outputFile = path.join(tempDir, `audio_output_${timestamp}_${randomId}.mp3`)
        await fs.promises.writeFile(inputFile, media)
        const command = `ffmpeg -i "${inputFile}" -acodec libmp3lame -b:a 128k -ar 44100 -ac 2 -preset fast -threads 0 -y "${outputFile}"`
        const { stdout, stderr } = await execAsync(command, { 
            timeout: 60000,
            maxBuffer: 1024 * 1024 * 10
        })
        const audioData = await fs.promises.readFile(outputFile)
        await Promise.allSettled([
            fs.promises.unlink(inputFile),
            fs.promises.unlink(outputFile)
        ])
        
        return { data: audioData }
    } catch (error) {
        console.error('Errore FFmpeg:', error)
        throw new Error(`Errore durante la conversione: ${error.message}`)
    }
}

let handler = async (m, { conn, usedPrefix, command }) => {
    try {
        let q = m.quoted ? m.quoted : m
        let mime = (q.msg || q).mimetype || q.mtype || ''
        if (!mime || (!mime.includes('video') && !mime.includes('audio'))) {
            if (!q.mtype || (!q.mtype.includes('video') && !q.mtype.includes('audio'))) {
                throw `➤ \`Rispondi a un video o audio\``
            }
        }
        if (q.fileLength && q.fileLength > 50 * 1024 * 1024) {
            throw '『 ❌ 』- \`File troppo grande, massimo 50MB\`'
        }
        await conn.sendPresenceUpdate('recording', m.chat)
        const downloadPromise = q.download()
        const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout download')), 30000)
        )
        
        let media = await Promise.race([downloadPromise, timeoutPromise])
        
        if (!media || media.length === 0) {
            throw `${global.errore || 'Errore nel download del file'}`
        }
        let audio = await convertToAudio(media)
        await conn.sendFile(
            m.chat,
            audio.data,
            'audio.mp3',
            '✅ *Conversione completata!*',
            m,
            false,
            {
                mimetype: 'audio/mpeg',
                asDocument: false,
                ptt: false
            }
        )
        
    } catch (e) {
        console.error('Errore handler:', e)
        await m.reply(typeof e === 'string' ? e : '❌ Errore durante la conversione.')
    } finally {
        await conn.sendPresenceUpdate('available', m.chat)
    }
}

handler.help = ['tomp3', 'toaudio']
handler.tags = ['strumenti']
handler.command = ['tomp3', 'toaudio']
handler.register = true

export default handler