import { downloadContentFromMessage } from '@realvare/based'

let handler = m => m
handler.before = async function (m, { conn, isAdmin, isOwner }) {
    if (m.isBaileys && m.fromMe) return true
    if (!m.isGroup) return false
    if (!m.message) return true
    
    let chat = global.db.data.chats[m.chat]
    if (!chat || !chat.bestemmiometro) return true
    
    if (!chat.bestemmie) chat.bestemmie = { total: 0, users: {} }
    if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = { bestemmie: 0 }
    let user = global.db.data.users[m.sender]

    let text = (m.message.conversation || 
               m.message.extendedTextMessage?.text || 
               m.message.imageMessage?.caption || 
               m.message.videoMessage?.caption || '').toLowerCase()

    let cleanText = text.replace(/[\.\-\_\,\*\+\/]/g, '')

    const regexBlasfema = /(?:porc[oa]\s*(?:di[o0ò]|ges[uù]|crist[0o]|mad[0o]nna|mad[0o]nina|spirit[0o]\s*sant[0o]|papa|dio)|di[o0ò]\s*(?:cane|p[0o]rc[0o]|lurid[0o]|b[0o]ia|maiale|schif[0o]s[0o]|merda|str[0o]nz[0o]|serpente|infame|maledett[0o]|bestia|scroto|letame)|crist[0o]\s*(?:cane|p[0o]rc[0o]|b[0o]ia|inchi[0o]dat[0o]|appes[0o]|mort[0o])|mad[0o]nna\s*(?:puttana|tr[0o]ia|maiala|serpe|schif[0o]sa|maledetta|impestata|ladra)|mannaggia\s*(?:a\s*di[o0]|al\s*crist[0o]|alla\s*mad[0o]nna|a\s*ges[uù])|puttana\s*(?:la\s*mad[0o]nna|la\s*chiesa|la\s*evangelica)|di[o0]\s*(?:maledett[0o]|puzzolente|bastard[0o])|ges[uù]\s*(?:m[0o]rt[0o]|marci[0o]|appes[0o]|maledett[0o])|sangiuseppe\s*(?:fabbro|maledetto|cane)|p[0o]rc[0o]di[o0ò]|di[o0ò]cane|di[o0ò]p[0o]rc[0o]|crist[0o]cane|mad[0o]nnaputtana)/gi
    
    const matches = cleanText.match(regexBlasfema)
    if (matches) {
        let count = matches.length
        let oldTotal = user.bestemmie || 0
        user.bestemmie = oldTotal + count
        chat.bestemmie.total += count
        chat.bestemmie.users[m.sender] = (chat.bestemmie.users[m.sender] || 0) + count

        const getSinRank = (n) => {
            if (n > 500) return '🔥 LUCIFERO'
            if (n > 200) return '👹 ARCIDEMONE'
            if (n > 100) return '🔱 ERETICO'
            if (n > 50) return '⛓️ DANNATO'
            if (n > 20) return '👺 PECCATORE'
            return '🤏 CHIERICHETTO'
        }

        const tag = m.sender.split('@')[0]
        
        // Messaggio base senza commento
        let res = `🔥 *BESTEMMIA* @${tag} ➔ \`+${count}\`\n`
        res += `📈 *Totale:* \`${user.bestemmie}\` | ${getSinRank(user.bestemmie)}`

        // Aggiunge il commento solo ogni 10 bestemmie raggiunte
        if (Math.floor(user.bestemmie / 10) > Math.floor(oldTotal / 10)) {
            const insulti = [
                "L'inferno ti aspetta.",
                "Sento odore di zolfo.",
                "Il prete ha avuto un brivido.",
                "Posto in paradiso: CANCELLATO.",
                "Vergogna, tua madre legge?",
                "Un altro chiodo sulla croce."
            ]
            const randomInsult = insulti[Math.floor(Math.random() * insulti.length)]
            res += `\n💬 _"${randomInsult}"_`
        }

        await conn.reply(m.chat, res, m, { mentions: [m.sender] })
    }
    return true
}

export default handler
