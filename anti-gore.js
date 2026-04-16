import { downloadContentFromMessage } from '@realvare/based'
import crypto from 'crypto'
import fetch from 'node-fetch'
import FormData from 'form-data'

let handler = m => m
handler.before = async function (m, { conn, isAdmin, isOwner }) {
    if (m.isBaileys && m.fromMe) return true
    if (!m.isGroup) return false
    if (!m.message) return true
    let chat = global.db.data.chats[m.chat]
    if (!chat.antigore) return true
    if (isAdmin || isOwner) return true

    let user = global.db.data.users[m.sender] || (global.db.data.users[m.sender] = { warn: 0 })
    if (!global.db.data.nsfwCache) global.db.data.nsfwCache = {}
    
    const isMedia = m.message.imageMessage ||
                    m.message.videoMessage ||
                    m.message.stickerMessage

    if (isMedia) {
        try {
            let mediaBuffer, mimeType, fileName
            const quoted = m.message.extendedTextMessage?.contextInfo?.quotedMessage
            const msg = quoted ? (quoted.imageMessage || quoted.videoMessage || quoted.stickerMessage) :
                               (m.message.imageMessage || m.message.videoMessage || m.message.stickerMessage)

            if (!msg) return true

            let type;
            if (msg.mimetype?.includes('video')) type = 'video';
            else if (msg.mimetype?.includes('sticker')) type = 'sticker';
            else if (msg.mimetype?.includes('image')) type = 'image';
            else return true;

            const stream = await downloadContentFromMessage(msg, type);
            mediaBuffer = Buffer.from([]);
            for await (const chunk of stream) {
                mediaBuffer = Buffer.concat([mediaBuffer, chunk]);
            }
            
            const fileHash = crypto.createHash('md5').update(mediaBuffer).digest('hex')
            if (global.db.data.nsfwCache[fileHash] === true) {
                return await punishUser(conn, m, user, "File già blacklistato come Gore")
            }
            if (global.db.data.nsfwCache[fileHash] === false) {
                return true 
            }

            if (type === 'video') {
                mimeType = 'video/mp4'
                fileName = 'media.mp4'
                if (mediaBuffer.length > 10 * 1024 * 1024) return true 
            } else {
                mimeType = msg.mimetype || 'image/jpeg'
                fileName = 'media.jpg'
            }

            const SIGHTENGINE_USER = global.APIKeys.sightengine_user
            const SIGHTENGINE_SECRET = global.APIKeys.sightengine_secret

            if (!SIGHTENGINE_USER || !SIGHTENGINE_SECRET) return true

            const apiUrl = type === 'video' ? `https://api.sightengine.com/1.0/video/check-sync.json` : `https://api.sightengine.com/1.0/check.json`
            const models = 'gore'

            const formData = new FormData()
            formData.append('media', mediaBuffer, { filename: fileName, contentType: mimeType })
            formData.append('models', models)
            formData.append('api_user', SIGHTENGINE_USER)
            formData.append('api_secret', SIGHTENGINE_SECRET)

            const response = await fetch(apiUrl, {
                method: 'POST',
                body: formData
            })

            const result = await response.json()

            if (result.status !== 'success') {
                console.log('Errore API SightEngine (Gore):', result)
                return true
            }

            let goreProb = 0

            if (type === 'video') {
                const frames = result.data?.frames || []
                goreProb = Math.max(...frames.map(f => f.gore?.prob || 0))
            } else {
                const goreData = result.gore || {}
                goreProb = goreData.prob || 0
            }
            const isHighRisk = goreProb > 0.60
            global.db.data.nsfwCache[fileHash] = isHighRisk

            if (isHighRisk) {
                return await punishUser(conn, m, user, "Contenuto violento/gore rilevato")
            }

        } catch (e) {
            console.error('Errore antigore:', e)
            return true
        }
    }
    return true
}

async function punishUser(conn, m, user, reason) {
    user.warn += 1
    const senderTag = m.sender.split('@')[0]
    try { await conn.sendMessage(m.chat, { delete: m.key }) } catch (e) {}

    const header = `⋆｡˚『 ╭ \`SISTEMA ANTIGORE\` ╯ 』˚｡⋆`
    const footer = `╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒`

    if (user.warn < 3) {
        await conn.sendMessage(m.chat, {
            text: `${header}\n\n🚨 *ATTENZIONE* @${senderTag}\n\n┃ ⛔ \`Violazione:\` *${reason}*\n┃ ⚠️ \`Warn:\` *${user.warn}/3*\n┃ 🚫 \`Azione:\` Messaggio rimosso\n\n${footer}`,
            mentions: [m.sender]
        })
    } else {
        user.warn = 0
        await conn.sendMessage(m.chat, {
            text: `${header}\n\n🚨 *TERMINAZIONE* @${senderTag}\n\n┃ ⛔ \`Violazione:\` Gore ripetuto\n┃ 💀 \`Sanzione:\` *ESPULSIONE*\n\n${footer}`,
            mentions: [m.sender]
        })
        await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
    }
    return false
}

export default handler
