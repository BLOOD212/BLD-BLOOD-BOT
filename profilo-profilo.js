import PhoneNumber from 'awesome-phonenumber'
import fs from 'fs'
import path from 'path'

const loadMarriages = () => {
    const marriagesFile = path.resolve('media/database/sposi.json');
    if (fs.existsSync(marriagesFile)) {
        return JSON.parse(fs.readFileSync(marriagesFile, 'utf-8'))
    } else {
        return {}
    }
}

const calculateLevel = (exp) => {
    return Math.floor(Math.sqrt(exp / 100)) + 1
}

const getGroupMessageRank = (chatId, userId) => {
    try {
        const chatData = global.db?.data?.chats?.[chatId]
        if (!chatData?.users) return { rank: 0, total: 0, messages: 0 }

        const groupUsers = Object.entries(chatData.users)
            .map(([id, data]) => ({ id, messages: data.messages || 0 }))
            .filter(user => user.messages > 0)
            .sort((a, b) => b.messages - a.messages)

        const userIndex = groupUsers.findIndex(user => user.id === userId)
        return {
            rank: userIndex >= 0 ? userIndex + 1 : 0,
            total: groupUsers.length,
            messages: chatData.users[userId]?.messages || 0
        }
    } catch {
        return { rank: 0, total: 0, messages: 0 }
    }
}

const getGlobalMessageRank = (userId) => {
    try {
        const userTotals = {}
        const chats = global.db?.data?.chats || {}

        for (const chatId in chats) {
            const users = chats[chatId]?.users || {}
            for (const id in users) {
                userTotals[id] = (userTotals[id] || 0) + (users[id].messages || 0)
            }
        }

        const allUsers = Object.entries(userTotals)
            .map(([id, messages]) => ({ id, messages }))
            .filter(u => u.messages > 0)
            .sort((a, b) => b.messages - a.messages)

        const userIndex = allUsers.findIndex(u => u.id === userId)
        return {
            rank: userIndex >= 0 ? userIndex + 1 : 0,
            total: allUsers.length,
            messages: userTotals[userId] || 0
        }
    } catch {
        return { rank: 0, total: 0, messages: 0 }
    }
}

const formatNumber = (num) => {
    if (!num) return '0'
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'k'
    return num.toString()
}

const normalizeDateForBirthday = (dateStr) => {
    if (!dateStr) return null
    const patterns = [/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{4})$/, /^(\d{1,2})[\/\-\.](\d{1,2})$/, /^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/]
    for (const pattern of patterns) {
        const match = dateStr.trim().match(pattern)
        if (match) {
            let d, m;
            if (match[3]) {
                if (match[1].length <= 2) { d = match[1]; m = match[2]; }
                else { d = match[3]; m = match[2]; }
            } else { d = match[1]; m = match[2]; }
            return { day: d.padStart(2, '0'), month: m.padStart(2, '0') }
        }
    }
    return null
}

const isBirthday = (birthdayStr) => {
    const today = new Date()
    const b = normalizeDateForBirthday(birthdayStr)
    if (!b) return false
    return b.day === today.getDate().toString().padStart(2, '0') && b.month === (today.getMonth() + 1).toString().padStart(2, '0')
}

let handler = async (m, { conn, usedPrefix }) => {
    let who = m.quoted?.sender || m.mentionedJid?.[0] || m.sender
    let user = global.db.data.users[who]
    if (!user) return m.reply('Utente non trovato nel database.')

    if (!user.profile) user.profile = {}
    let pp = await conn.profilePictureUrl(who, 'image').catch(_ => 'https://i.ibb.co/BKHtdBNp/default-avatar-profile-icon-1280x1280.jpg')
    let currentLevel = user.level || calculateLevel(user.exp || 0)
    const groupRank = getGroupMessageRank(m.chat, who)
    const globalRank = getGlobalMessageRank(who)
    const marriages = loadMarriages()

    let partnerMention = marriages[who] ? `@${marriages[who].split('@')[0]}` : 'Single 🔓'
    let mentions = marriages[who] ? [who, marriages[who]] : [who]

    let profileBox = `╔══════〔 *PROFILO UTENTE* 〕══════╗
║
║  ✨ *STATISTICHE*
║  • 🪙 *Euro:* *${formatNumber(user.euro)}*
║  • 🏅 *Livello:* *${currentLevel}*
║  • 🧪 *Exp:* *${formatNumber(user.exp)} XP*
║  • 💎 *Premium:* *${user.premium ? 'Attivo ✅' : 'Base ❌'}*
║
║  📊 *ATTIVITÀ*
║  • 💬 *Messaggi (GP):* *${formatNumber(groupRank.messages)}*
║  • 🏆 *Rank Gruppo:* *#${groupRank.rank}/${groupRank.total}*
║  • 🌍 *Rank Global:* *#${globalRank.rank}/${globalRank.total}*
║
║  📝 *INFO PERSONALI*
║  • 📜 *Bio:* _${user.profile.description || 'Non impostata'}_
║  • 📍 *Città:* *${user.profile.city || 'Sconosciuta'}*
║  • 👤 *Genere:* *${user.profile.gender || 'Non specificato'}*
║  • 💍 *Stato:* *${user.profile.status || 'Libero/a'}*
║  • 🥂 *Partner:* *${partnerMention}*
║
║  🎨 *INTERESSI*
║  • 🎭 *Hobby:* *${user.profile.hobby || 'Non definito'}*
║  • 🎵 *Musica:* *${user.profile.music || 'Non definita'}*
║  • 🎮 *Gioco:* *${user.profile.game || 'Non definito'}*
║
╚══════════════════════╝`

    try {
        await conn.sendMessage(m.chat, {
            text: profileBox,
            mentions,
            contextInfo: {
                ...(global.fake?.contextInfo || {}),
                externalAdReply: {
                    title: `👤 SCHEDA DI: ${await conn.getName(who)}`,
                    body: `📲 Livello: ${currentLevel} • ID: ${who.split('@')[0]}`,
                    thumbnailUrl: pp,
                    sourceUrl: '',
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m })

        if (user.profile?.birthday && isBirthday(user.profile.birthday)) {
            const today = new Date().toDateString()
            if (!global.birthdayMessages) global.birthdayMessages = {}
            if (global.birthdayMessages[who] !== today) {
                global.birthdayMessages[who] = today
                setTimeout(() => {
                    conn.sendMessage(m.chat, { text: `🎉 *Auguri ${conn.getName(who)}!* Buon compleanno! 🎂`, mentions: [who] })
                }, 1000)
            }
        }
    } catch (e) {
        console.error(e)
        m.reply('Errore durante il caricamento del profilo.')
    }
}

handler.help = ['profilo']
handler.tags = ['info']
handler.command = /^(profilo|profile)$/i
handler.register = true
export default handler
