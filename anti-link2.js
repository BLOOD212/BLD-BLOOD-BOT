import fetch from 'node-fetch'
import { FormData } from 'formdata-node'
import { downloadContentFromMessage } from '@realvare/based'
import Jimp from 'jimp'
import jsQR from 'jsqr'

const sonoilgattoperquestitopi = /(?:https?:\/\/)?(?:www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b(?:[-a-zA-Z0-9()@:%_\+.~#?&=]*)/gi;
const doms = {
    tiktok: ['tiktok.com', 'vm.tiktok.com', 'tiktok.it'],
    youtube: ['youtube.com', 'youtu.be', 'm.youtube.com'],
    telegram: ['telegram.me', 'telegram.org', 't.me'],
    facebook: ['facebook.com', 'fb.com', 'm.facebook.com'],
    instagram: ['instagram.com', 'instagr.am'],
    twitter: ['twitter.com', 'x.com'],
    discord: ['discord.gg', 'discord.com'],
    snapchat: ['snapchat.com', 't.snapchat.com'],
    linkedin: ['linkedin.com', 'lnkd.in'],
    twitch: ['twitch.tv', 'm.twitch.tv'],
    reddit: ['reddit.com', 'redd.it'],
    onlyfans: ['onlyfans.com'],
    github: ['github.com', 'git.io'],
    bitly: ['bit.ly', 'bitly.com'], 
    tinyurl: ['tinyurl.com']
};

// --- LOGICA DI SUPPORTO ---

async function getMediaBuffer(message) {
    try {
        const found = findFirstMediaMessage(message, { excludeQuoted: false })
        if (!found) return null
        const { node, typeKey } = found
        const type = typeKey === 'videoMessage' ? 'video' : typeKey === 'stickerMessage' ? 'sticker' : 'image'
        const stream = await downloadContentFromMessage(node, type)
        let buffer = Buffer.from([])
        for await (const chunk of stream) { buffer = Buffer.concat([buffer, chunk]) }
        return buffer
    } catch { return null }
}

function unwrapMessageContent(message) {
    let content = message?.message || message
    for (let i = 0; i < 10; i++) {
        if (content?.ephemeralMessage?.message) { content = content.ephemeralMessage.message; continue }
        if (content?.viewOnceMessage?.message) { content = content.viewOnceMessage.message; continue }
        if (content?.viewOnceMessageV2?.message) { content = content.viewOnceMessageV2.message; continue }
        if (content?.documentWithCaptionMessage?.message) { content = content.documentWithCaptionMessage.message; continue }
        if (content?.editedMessage?.message) { content = content.editedMessage.message; continue }
        break
    }
    return content
}

function findFirstMediaMessage(message, { excludeQuoted = false } = {}) {
    const root = unwrapMessageContent(message)
    const seen = new Set()
    const MEDIA_KEYS = new Set(['imageMessage', 'videoMessage', 'stickerMessage'])
    function visit(obj) {
        if (!obj || typeof obj !== 'object' || seen.has(obj)) return null
        seen.add(obj)
        for (const key of Object.keys(obj)) {
            if (excludeQuoted && key === 'quotedMessage') continue
            const value = obj[key]
            if (MEDIA_KEYS.has(key) && value) return { node: value, typeKey: key }
            if (value && typeof value === 'object') { const hit = visit(value); if (hit) return hit }
        }
        return null
    }
    return visit(root)
}

async function readQRCode(imageBuffer) {
    try {
        const img = await Jimp.read(imageBuffer)
        const { data, width, height } = img.bitmap
        const clamped = new Uint8ClampedArray(data.buffer, data.byteOffset, data.byteLength)
        const code = jsQR(clamped, width, height)
        return code?.data || null
    } catch { return null }
}

function extractTextFromMessage(m, excludeQuoted = false) {
    const texts = []
    const seen = new Set()
    function recursiveExtract(obj) {
        if (!obj || typeof obj !== 'object' || seen.has(obj)) return
        seen.add(obj)
        for (const key in obj) {
            if (excludeQuoted && key === 'quotedMessage') continue
            const value = obj[key]
            if (typeof value === 'string' && value.length > 0) texts.push(value)
            else if (typeof value === 'object') recursiveExtract(value)
        }
    }
    recursiveExtract(unwrapMessageContent(m))
    return texts.join(' ').replace(/[\s\u200b\u200c\u200d\uFEFF]+/g, ' ').trim()
}

function detectSocialLink(url) {
    if (!url) return null
    const lowerUrl = url.toLowerCase()
    for (const [platform, domains] of Object.entries(doms)) {
        if (domains.some(domain => lowerUrl.includes(domain))) return platform
    }
    return null
}

// --- HANDLER ---

export async function before(m, { conn, isAdmin, isBotAdmin, isOwner, isSam }) {
    if (!m.isGroup || isAdmin || isOwner || isSam || m.fromMe) return false
    
    const chat = global.db.data.chats[m.chat]
    if (!chat) return false
    
    const hasMaster = !!chat.antiLink2
    const hasAnySocialToggle = !hasMaster && Object.keys(chat).some(k => k.startsWith('antiLink2_') && chat[k] === true)
    if (!hasMaster && !hasAnySocialToggle) return false

    const header = `⋆｡˚『 ╭ \`SISTEMA ANTISOCIAL\` ╯ 』˚｡⋆`
    const footer = `╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒`

    try {
        const extractedText = extractTextFromMessage(m, true)
        let linkFound = false
        let detectedPlatform = null
        let isQR = false

        // Check Testo
        if (extractedText) {
            const urls = extractedText.match(sonoilgattoperquestitopi) || []
            for (const url of urls) {
                detectedPlatform = detectSocialLink(url)
                if (detectedPlatform) {
                    if (!hasMaster && chat[`antiLink2_${detectedPlatform}`] !== true) continue
                    linkFound = true; break
                }
            }
        }

        // Check Media (QR)
        if (!linkFound) {
            const media = await getMediaBuffer(m)
            if (media) {
                const qrData = await readQRCode(media)
                if (qrData) {
                    detectedPlatform = detectSocialLink(qrData)
                    if (detectedPlatform) {
                        if (hasMaster || chat[`antiLink2_${detectedPlatform}`] === true) {
                            linkFound = true; isQR = true
                        }
                    }
                }
            }
        }

        if (linkFound) {
            const user = global.db.data.users[m.sender] = global.db.data.users[m.sender] || {}
            user.antiLink2Warns = (user.antiLink2Warns || 0) + 1

            // Elimina il messaggio
            if (isBotAdmin) {
                try { await conn.sendMessage(m.chat, { delete: m.key }) } catch {}
            }

            if (user.antiLink2Warns < 3) {
                await conn.sendMessage(m.chat, {
                    text: `${header}\n\n🚨 *ATTENZIONE* @${m.sender.split('@')[0]}\n\n┃ ⛔ \`Violazione:\` Link ${detectedPlatform.toUpperCase()} ${isQR ? '(QR Code)' : ''}\n┃ ⚠️ \`Warn:\` *${user.antiLink2Warns}/3*\n┃ 🚫 \`Azione:\` Messaggio rimosso\n\n${footer}`,
                    mentions: [m.sender]
                })
            } else {
                user.antiLink2Warns = 0
                await conn.sendMessage(m.chat, {
                    text: `${header}\n\n🚨 *TERMINAZIONE* @${m.sender.split('@')[0]}\n\n┃ ⛔ \`Violazione:\` Spam social ripetuto\n┃ 💀 \`Sanzione:\` *ESPULSIONE*\n\n${footer}`,
                    mentions: [m.sender]
                })
                if (isBotAdmin) await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
            }
            return true
        }

    } catch (error) {
        console.error('[ANTILINK2] Errore:', error)
    }
    return false
}

export { before as handler }
