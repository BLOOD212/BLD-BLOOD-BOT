import { downloadContentFromMessage } from '@realvare/based'
import { fileTypeFromBuffer } from 'file-type'

const isViewOnceQuoted = (quoted) => {
    return quoted?.viewOnce === true ||
           quoted?.message?.viewOnceMessage ||
           quoted?.message?.viewOnceMessageV2 ||
           quoted?.message?.viewOnceMessageV2Extension ||
           quoted?.msg?.viewOnceMessage ||
           quoted?.msg?.viewOnceMessageV2 ||
           quoted?.msg?.viewOnceMessageV2Extension ||
           quoted?.key?.isViewOnce === true;
};

const handler = async (m, { conn }) => {
    try {
        if (!m.quoted) {
            throw '『 ⚠️ 』- `Rispondi a un contenuto visualizzabile una volta`'
        }
        if (!isViewOnceQuoted(m.quoted)) {
            throw '『 ⚠️ 』- `Questo non è un contenuto visualizzabile una volta`'
        }

        const mtype = m.quoted.mtype
        const messageContent = m.quoted[mtype]

        let messageType
        if (mtype === 'videoMessage') messageType = 'video'
        else if (mtype === 'imageMessage') messageType = 'image'
        else if (mtype === 'audioMessage') messageType = 'audio'
        else throw '❌ Formato non supportato. Sono supportati solo video, immagini e audio.'

        let buffer
        try {
            const stream = await downloadContentFromMessage(messageContent, messageType)
            const chunks = []
            for await (const chunk of stream) {
                chunks.push(chunk)
            }
            buffer = Buffer.concat(chunks)
        } catch (err) {
            console.warn(`Fallback al metodo download() per ${messageType}:`, err.message)
            buffer = await m.quoted.download()
        }

        if (!buffer || buffer.length === 0) {
            throw '❌ Impossibile scaricare il contenuto del messaggio.'
        }

        const fileDetails = await fileTypeFromBuffer(buffer)
        const caption = m.quoted?.caption || ''

        if (messageType === 'audio') {
            await conn.sendFile(m.chat, buffer, `audio.${fileDetails?.ext || 'mp3'}`, '', m, false, {
                mimetype: fileDetails?.mime || 'audio/mp4',
                ptt: m.quoted.ptt || false,
            })
        } else {
            const filename = `${messageType}.${fileDetails?.ext || (messageType === 'image' ? 'jpg' : 'mp4')}`
            await conn.sendFile(m.chat, buffer, filename, caption, m)
        }

    } catch (e) {
        console.error('Errore nel rivelare view once:', e)
        const errorMessage = typeof e === 'string' ? e : (global.errore || '❌ Si è verificato un errore durante lelaborazione.')
        await m.reply(errorMessage)
    }
}

handler.help = ['rivela']
handler.tags = ['strumenti']
handler.command = ['readviewonce', 'rivela', 'viewonce']
handler.group = true
handler.admin = true

export default handler