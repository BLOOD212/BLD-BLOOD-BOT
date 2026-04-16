const LOCATIONS = [
    '🏛️ la Zecca di Stato',
    '🏰 il Castello Reale',
    '🏦 la Banca Centrale',
    '🏨 il Casinò Las Vegas',
    '🏢 il Grattacielo di Cristallo',
    '🏺 il Museo degli Antichi Tesori',
    '💎 la Gioielleria di Lusso',
    '🗝️ il Caveau Segreto'
]

const CRIME_MESSAGES = {
    success: [
        'Sei riuscito a infiltrarti in {location} travestito da addetto alle pulizie! Bottino: _{amount} euro_',
        'Hai hackerato il sistema di sicurezza di {location} usando solo il telefono! Guadagno: _{amount} euro_',
        'Ti sei finto un ispettore in {location} e nessuno ti ha scoperto! Hai rubato: _{amount} euro_',
        'Hai scavato un tunnel sotto {location} e sei scappato con _{amount} euro_!',
        'Ti sei calato dal tetto di {location} come in Mission Impossible! Bottino: _{amount} euro_'
    ],
    fail: [
        'Hai provato a rubare in {location} ma sei inciampato sull\'allarme laser! Multa: _-{amount} euro_',
        'Ti sei infiltrato in {location} ma ti è squillato il telefono durante il colpo! Perdi: _-{amount} euro_',
        'Stavi per svaligiare {location} ma hai starnutito proprio nel momento sbagliato! Multa: _-{amount} euro_',
        'La tua maschera da rapinatore in {location} era del pupazzo Peppa Pig... Cauzione: _-{amount} euro_',
        'Hai tentato di rubare in {location} ma sei scivolato sulla buccia di banana! Perdi: _-{amount} euro_'
    ]
}
const TARGETED_MESSAGES = {
    success: [
        'Hai teso un agguato a _@{target}_ in un vicolo buio! Bottino: _{amount} euro_',
        'Hai hackerato il telefono di _@{target}_ rubandogli _{amount} euro_!',
        'Hai ingannato _@{target}_ con uno schema piramidale! Guadagno: _{amount} euro_',
        'Hai sfidato _@{target}_ a poker con le carte segnate! Vinte: _{amount} euro_',
        'Ti sei finto il cugino ricco di _@{target}_ fregandogli _{amount} euro_!'
    ],
    fail: [
        '_@{target}_ ti ha riconosciuto e chiamato la polizia! Multa: _-{amount} euro_',
        'Hai provato a derubare _@{target}_ ma era cintura nera! Spese mediche: _-{amount} euro_',
        '_@{target}_ aveva installato delle telecamere! Cauzione: _-{amount} euro_',
        'Il cane di _@{target}_ ti ha morso il sedere! Risarcimento: _-{amount} euro_',
        '_@{target}_ ti ha fatto lo sgambetto mentre scappavi! Perdi: '
    ]
}

let cooldowns = {}

let handler = async (m, { conn, text, command, usedPrefix }) => {
    let users = global.db.data.users
    let senderId = m.sender
    let tempo = 5 * 60
    if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < tempo * 1000) {
        let tempo2 = secondiAHMS(Math.ceil((cooldowns[m.sender] + tempo * 1000 - Date.now()) / 1000))
        m.reply(`『 🕰️ 』- *Devi aspettare* \`${tempo2}\` per usare di nuovo *.crimine*.`)
        return
    }
    cooldowns[m.sender] = Date.now()
    let targetId = m.mentionedJid[0]
    if (!targetId && m.quoted) targetId = m.quoted.sender
    let isTargeted = !!targetId
    let targetName = isTargeted ? await conn.getName(targetId) : null
    let location = LOCATIONS[Math.floor(Math.random() * LOCATIONS.length)]
    if (!users[senderId]) users[senderId] = { euro: 0 }
    if (!users[senderId].euro) users[senderId].euro = 0
    if (users[senderId].euro <= 0) {
        let messaggiLadroPovero = [
            "『 😅 』- *Non hai nemmeno i soldi per il bus, figurati per un colpo!*",
            "『 🪙 』- *Sei troppo povero per tentare un crimine... Fai prima a chiedere l'elemosina!*",
            "『 🥲 』- *Prima guadagna qualcosa, poi pensa a delinquere!*",
            "『 🧦 』- *Hai solo delle briciole nelle tasche, non puoi permetterti nemmeno i guanti da ladro!*"
        ]
        return await conn.sendMessage(m.chat, {
            text: messaggiLadroPovero[Math.floor(Math.random() * messaggiLadroPovero.length)],
            buttons: [
                { buttonId: `${usedPrefix}lavoro`, buttonText: { displayText: "Trovati un lavoro" }, type: 1 }
            ],
            quoted: m
        })
    }

    if (isTargeted) {
        if (!users[targetId]) users[targetId] = { euro: 0 }
        if (!users[targetId].euro) users[targetId].euro = 0
    }
    let minAmount = 15
    let maxAmount = 50
    let amountTaken = Math.floor(Math.random() * (maxAmount - minAmount + 1)) + minAmount
    let amountSubtracted = Math.floor(amountTaken * 1.5)

    if (isTargeted && users[targetId].euro <= 0) {
        if (Math.random() < 0.8) {
            let messaggiPovero = [
                `『 😢 』- *${targetName} è già povero di suo, lascialo stare...*`,
                `『 🥲 』- *Vuoi derubare chi non ha nulla? Vergognati!*`,
                `『 🪙 』- *${targetName} non ha nemmeno un euro in tasca!*`,
                `『 🧦 』- *Gli hai trovato solo delle briciole nelle tasche...*`
            ]
            return m.reply(messaggiPovero[Math.floor(Math.random() * messaggiPovero.length)])
        } else {
            let regalo = Math.floor(Math.random() * 10) + 5
            users[senderId].euro = Math.max(0, users[senderId].euro - regalo)
            users[targetId].euro += regalo
            return m.reply(`『 🤝 』- Ti sei impietosito e hai regalato *${regalo} euro* a ${targetName}!`)
        }
    }

    let msg = await conn.reply(m.chat, `
ㅤ⋆｡˚『 ╭ \`CRIMINE IN CORSO\` ╯ 』˚｡⋆\n╭\n│
┃ 『 🎭 』 *\`Obiettivo:\`* ${isTargeted ? `@${targetId.split('@')[0]}` : location}
┃ 『 ⏳ 』 *\`Preparazione colpo...\`*
┃
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`, m, { mentions: isTargeted ? [targetId] : [] })

    await new Promise(resolve => setTimeout(resolve, 1500))

    let success = Math.random() > 0.5
    let amount = success ? amountTaken : amountSubtracted
    let message
    if (isTargeted) {
        message = (success ? TARGETED_MESSAGES.success : TARGETED_MESSAGES.fail)
            [Math.floor(Math.random() * (success ? TARGETED_MESSAGES.success : TARGETED_MESSAGES.fail).length)]
            .replace('{target}', targetId.split('@')[0])
            .replace('{amount}', amount)
    } else {
        message = (success ? CRIME_MESSAGES.success : CRIME_MESSAGES.fail)
            [Math.floor(Math.random() * (success ? CRIME_MESSAGES.success : CRIME_MESSAGES.fail).length)]
            .replace('{location}', location)
            .replace('{amount}', amount)
    }

    if (success) {
        users[senderId].euro = (users[senderId].euro || 0) + amount
        if (isTargeted) {
            users[targetId].euro = Math.max(0, (users[targetId].euro || 0) - amount)
        }
    } else {
        users[senderId].euro = Math.max(0, (users[senderId].euro || 0) - amount)
    }
    await conn.sendMessage(m.chat, {
        text: `
ㅤㅤ⋆｡˚『 ╭ \`${success ? 'CRIMINE RIUSCITO' : 'CRIMINE FALLITO'}\` ╯ 』˚｡⋆\n╭\n│
┃ • *${message}*
┃
┃ 『 📊 』 *_Dettagli:_*
┃ • ${success ? '『 💰 』 \`Bottino:\` *+*' : '『 💸 』 \`Perdita:\` *-*'} *${amount} euro*
┃ • 『 👝 』 \`Saldo:\` *${users[senderId].euro} euro* 
┃${isTargeted ? ` • 『 🎯 』 \`Saldo vittima:\` *${users[targetId].euro} euro*` : ''}
┃
*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`,
        edit: msg.key,
        mentions: isTargeted ? [targetId] : []
    })

    global.db.write()
}

handler.tags = ['euro']
handler.help = ['crimine']
handler.command = ['crimine', 'deruba']
handler.register = true
handler.group = true

export default handler

function secondiAHMS(secondi) {
    let ore = Math.floor(secondi / 3600)
    let minuti = Math.floor((secondi % 3600) / 60)
    let secondiRestanti = secondi % 60
    return `${minuti}m e ${secondiRestanti}s`
}