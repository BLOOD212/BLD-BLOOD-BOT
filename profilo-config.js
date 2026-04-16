import PhoneNumber from 'awesome-phonenumber'

const calculateLevel = (exp) => {
    return Math.floor(Math.sqrt(exp / 100)) + 1
}

const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M'
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K'
    return num.toString()
}

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!global.db.data.users[m.sender]) {
        global.db.data.users[m.sender] = {}
    }

    let user = global.db.data.users[m.sender]
    if (!user.profile) {
        user.profile = {
            description: '', gender: '', instagram: '', city: '',
            birthday: '', hobby: '', status: '', occupation: '',
            music: '', food: '', movie: '', game: '', sport: '', language: ''
        }
    }

    let name = await conn.getName(m.sender)
    let pp = await conn.profilePictureUrl(m.sender, 'image').catch(_ => 'https://i.ibb.co/BKHtdBNp/default-avatar-profile-icon-1280x1280.jpg')
    let currentLevel = user.level || calculateLevel(user.exp || 0)
    let phone = PhoneNumber('+' + m.sender.split('@')[0]).getNumber('international')

    let type = command.toLowerCase()

    if (type === 'set' && !text) {
        let menuSet = `ㅤㅤ⋆｡˚『 ╭ *CONFIGURAZIONE* ╯ 』˚｡⋆
╭──────────────────⭒
│ 🛠️ *GESTISCI IL TUO PROFILO*
│
│ *Personalizza le informazioni che verranno*
│ *mostrate pubblicamente nel tuo profilo!*
├──────────────────⭒
│ 📝 *${usedPrefix}setdesc* (Bio)
│ ⚧️ *${usedPrefix}setgenere*
│ 📸 *${usedPrefix}setig* (Instagram)
│ 🌆 *${usedPrefix}setcitta*
│ 🎂 *${usedPrefix}setcompleanno*
│ 🎨 *${usedPrefix}sethobby*
│ 💝 *${usedPrefix}setstato* (Relazione)
│ 💼 *${usedPrefix}setlavoro*
│ 🎵 *${usedPrefix}setmusica*
│ 🍕 *${usedPrefix}setcibo*
│ 🎬 *${usedPrefix}setfilm*
│ 🎮 *${usedPrefix}setgioco*
│ 🏃 *${usedPrefix}setsport*
│ 🌍 *${usedPrefix}setlingua*
├──────────────────⭒
│ 🗑️ *Usa* \`${usedPrefix}del [nome]\` *per resettare*
│ *Esempio:* \`${usedPrefix}del bio\`
╰──────────────────⭒`

        await conn.sendMessage(m.chat, {
            text: menuSet,
            contextInfo: {
                externalAdReply: {
                    title: `⚙️ Pannello Impostazioni: ${name}`,
                    body: `Configura la tua identità virtuale`,
                    thumbnailUrl: pp,
                    sourceUrl: '',
                    mediaType: 1,
                    renderLargerThumbnail: true
                }
            }
        }, { quoted: m })
        return
    }

    if (!text && type !== 'set') {
        if (type === 'del') return

        const helpMessages = {
            setdesc: `ㅤㅤ⋆｡˚『 ╭ *DESCRIZIONE* ╯ 』˚｡⋆\n╭\n│  『 📝 』 *Imposta la tua biografia*\n│      *⤷* *Massimo 100 caratteri*\n│\n│  『 💡 』 *Esempio:*\n│      *⤷* *${usedPrefix}setdesc Sono un tipo tosto*\n│\n*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`,
            setgenere: `ㅤㅤ⋆｡˚『 ╭ *GENERE* ╯ 』˚｡⋆\n╭\n│  『 ⚧️ 』 *Definisci il tuo genere*\n│\n│  『 📌 』 *Opzioni consigliate:*\n│      *⤷* *Uomo, Donna, Altro*\n│\n*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`,
            setig: `ㅤㅤ⋆｡˚『 ╭ *INSTAGRAM* ╯ 』˚｡⋆\n╭\n│  『 📸 』 *Collega il tuo profilo*\n│      *⤷* *Inserisci solo lo username*\n│\n│  『 💡 』 *Esempio:*\n│      *⤷* *${usedPrefix}setig cristiano*\n│\n*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`,
            setcompleanno: `ㅤㅤ⋆｡˚『 ╭ *COMPLEANNO* ╯ 』˚｡⋆\n╭\n│  『 🎂 』 *La tua data di nascita*\n│      *⤷* *Formato richiesto: DD/MM/YYYY*\n│\n│  『 💡 』 *Esempio:*\n│      *⤷* *${usedPrefix}setcompleanno 01/01/2000*\n│\n*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`
        }

        await conn.sendMessage(m.chat, {
            text: helpMessages[type] || `『 💡 』 *Usa:* \`${usedPrefix}${type} [testo]\` *per aggiornare questo campo.*`,
            contextInfo: {
                externalAdReply: {
                    title: `Configurazione Profilo`,
                    body: `${phone} • Livello ${currentLevel}`,
                    thumbnailUrl: pp,
                    mediaType: 1
                }
            }
        }, { quoted: m })
        return
    }

    if (type === 'del') {
        const validFields = {
            'desc': 'description', 'bio': 'description', 'genere': 'gender',
            'ig': 'instagram', 'citta': 'city', 'compleanno': 'birthday',
            'hobby': 'hobby', 'stato': 'status', 'lavoro': 'occupation',
            'musica': 'music', 'cibo': 'food', 'film': 'movie',
            'gioco': 'game', 'sport': 'sport', 'lingua': 'language'
        }

        const fieldToDelete = text.toLowerCase()
        if (!validFields[fieldToDelete]) {
            await m.reply(`『 ❌ 』 *Campo non valido!*\nUsa: \`${usedPrefix}del bio\`, \`${usedPrefix}del ig\`, ecc.`)
            return
        }

        const actualField = validFields[fieldToDelete]
        user.profile[actualField] = ''
        await m.react('🗑️')
        await m.reply(`『 ✅ 』 *Campo* *${fieldToDelete}* *resettato correttamente.*`)
        return
    }

    switch (type) {
        case 'setdesc':
        case 'setbio':
            if (text.length > 100) return m.reply('『 ❌ 』 *Troppo lungo!* Max 100 caratteri.')
            user.profile.description = text
            break
        case 'setgenere': user.profile.gender = text; break
        case 'setig':
            if (!text.match(/^[a-zA-Z0-9._]+$/)) return m.reply('『 ❌ 』 *Username non valido!*')
            user.profile.instagram = text
            break
        case 'setcitta': user.profile.city = text; break
        case 'setcompleanno':
            if (!text.match(/^\d{2}\/\d{2}\/\d{4}$/)) return m.reply('『 ❌ 』 *Usa il formato:* *DD/MM/YYYY*')
            user.profile.birthday = text
            break
        case 'sethobby': user.profile.hobby = text; break
        case 'setstato': user.profile.status = text; break
        case 'setlavoro': user.profile.occupation = text; break
        case 'setmusica': user.profile.music = text; break
        case 'setcibo': user.profile.food = text; break
        case 'setfilm': user.profile.movie = text; break
        case 'setgioco': user.profile.game = text; break
        case 'setsport': user.profile.sport = text; break
        case 'setlingua': user.profile.language = text; break
        default: return
    }

    const fieldMap = {
        setdesc: ['📝', 'Bio'], setbio: ['📝', 'Bio'],
        setgenere: ['⚧️', 'Genere'], setig: ['📸', 'Instagram'],
        setcitta: ['🌆', 'Città'], setcompleanno: ['🎂', 'Compleanno'],
        sethobby: ['🎨', 'Hobby'], setstato: ['💝', 'Stato'],
        setlavoro: ['💼', 'Lavoro'], setmusica: ['🎵', 'Musica'],
        setcibo: ['🍕', 'Cibo'], setfilm: ['🎬', 'Film'],
        setgioco: ['🎮', 'Gioco'], setsport: ['🏃', 'Sport'],
        setlingua: ['🌍', 'Lingua']
    }

    let [emoji, label] = fieldMap[type] || ['✨', 'Profilo']

    await conn.sendMessage(m.chat, {
        text: `ㅤㅤ⋆｡˚『 ╭ *PROFILO AGGIORNATO* ╯ 』˚｡⋆\n╭\n│  『 ✅ 』 *Dati salvati con successo!*\n│  『 ${emoji} 』 *${label}:*\n│      *⤷* *${text}*\n│\n*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`,
        contextInfo: {
            externalAdReply: {
                title: `✅ ${label} Aggiornato`,
                body: `${name} • ${phone}`,
                thumbnailUrl: pp,
                mediaType: 1
            }
        }
    }, { quoted: m })

    await m.react('✅')
}

handler.tags = ['profilo']
handler.command = /^(set(desc|bio|genere|ig|citta|compleanno|hobby|stato|lavoro|musica|cibo|film|gioco|sport|lingua)?|del)$/i
handler.register = true
export default handler
