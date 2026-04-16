let cooldowns = {}

const lavori = [
    { testo: "Lavori come tagliatore di biscotti e guadagni", emoji: "🍪", keyword: "cookie" },
    { testo: "Lavori per un'azienda militare privata, guadagnando", emoji: "🪖", keyword: "military" },
    { testo: "Organizzi un evento di degustazione di vini e ottieni", emoji: "🍷", keyword: "wine" },
    { testo: "Pulisci il camino e trovi", emoji: "🧹", keyword: "chimney" },
    { testo: "Sviluppi giochi per vivere e guadagni", emoji: "🎮", keyword: "videogame" },
    { testo: "Hai lavorato in ufficio facendo straordinari per", emoji: "💼", keyword: "office" },
    { testo: "Lavori come rapitore di spose e guadagni", emoji: "👰", keyword: "wedding" },
    { testo: "Hai comprato e venduto articoli e guadagnato", emoji: "🛒", keyword: "market" },
    { testo: "Lavori nel ristorante della nonna come cuoco e guadagni", emoji: "👩‍🍳", keyword: "restaurant" },
    { testo: "Lavori 10 minuti in una pizzeria locale. Hai guadagnato", emoji: "🍕", keyword: "pizza" },
    { testo: "Lavori come scrittore di biscotti della fortuna e guadagni", emoji: "🥠", keyword: "fortune cookie" },
    { testo: "Sviluppi giochi per vivere e guadagni", emoji: "🕹️", keyword: "game developer" },
    { testo: "Hai progettato un logo per un'azienda per", emoji: "🎨", keyword: "logo design" },
    { testo: "Lavori come potatore di cespugli e guadagni", emoji: "🌳", keyword: "gardener" },
    { testo: "Lavori come doppiatore per SpongeBob e riesci a guadagnare", emoji: "🎤", keyword: "microphone" },
    { testo: "Stavi coltivando e hai guadagnato", emoji: "🌾", keyword: "farming" },
    { testo: "Lavori come costruttore di castelli di sabbia e guadagni", emoji: "🏖️", keyword: "sandcastle" },
    { testo: "Lavori come artista di strada e guadagni", emoji: "🎭", keyword: "street artist" },
    { testo: "Hai fatto lavoro sociale per una buona causa! Per la tua buona causa hai ricevuto", emoji: "🤝", keyword: "volunteer" },
    { testo: "Hai riparato un carro armato T-60 rotto in Afghanistan. L'equipaggio ti ha pagato", emoji: "🛠️", keyword: "tank" },
    { testo: "Lavori come ecologista di anguille e guadagni", emoji: "🦭", keyword: "eel" },
    { testo: "Lavori a Disneyland come panda travestito e guadagni", emoji: "🐼", keyword: "panda" },
    { testo: "Ripari le macchine da gioco e ricevi", emoji: "🕹️", keyword: "arcade" },
    { testo: "Hai fatto alcuni lavoretti in città e hai guadagnato", emoji: "🏙️", keyword: "city" },
    { testo: "Pulisci un po' di muffa tossica dalla ventilazione e guadagni", emoji: "🧽", keyword: "cleaning" },
    { testo: "Hai risolto il mistero dell'epidemia di colera e il governo ti ha ricompensato con una somma di", emoji: "🦠", keyword: "science" },
    { testo: "Lavori come zoologo e guadagni", emoji: "🦁", keyword: "zoologist" },
    { testo: "Hai venduto panini al pesce e hai ottenuto", emoji: "🐟", keyword: "fish sandwich" },
    { testo: "Lavori come barista in un locale alla moda e ricevi", emoji: "☕", keyword: "barista" },
    { testo: "Fai il DJ a una festa e guadagni", emoji: "🎧", keyword: "dj" },
    { testo: "Lavori come dog-sitter e vieni pagato", emoji: "🐶", keyword: "dog" },
    { testo: "Aiuti un anziano a fare la spesa e ricevi", emoji: "🛒", keyword: "shopping" },
    { testo: "Fai il fotografo a un matrimonio e ottieni", emoji: "📸", keyword: "wedding photographer" },
    { testo: "Lavori come guida turistica e guadagni", emoji: "🗺️", keyword: "tour guide" },
    { testo: "Fai il giardiniere in un parco cittadino e ricevi", emoji: "🌻", keyword: "gardener" },
    { testo: "Lavori come insegnante di yoga e guadagni", emoji: "🧘", keyword: "yoga" },
    { testo: "Fai il cameriere in una gelateria e ricevi", emoji: "🍦", keyword: "ice cream" },
    { testo: "Lavori come meccanico e ripari una bici per", emoji: "🚲", keyword: "bicycle mechanic" },
    { testo: "Fai il babysitter per una famiglia e guadagni", emoji: "🍼", keyword: "babysitter" },
    { testo: "Lavori come animatore in un villaggio turistico e ricevi", emoji: "🏝️", keyword: "animator" },
    { testo: "Fai il pizzaiolo per una sera e guadagni", emoji: "🍕", keyword: "pizza chef" },
    { testo: "Lavori come mago di strada e ricevi una mancia di", emoji: "🪄", keyword: "magician" },
    { testo: "Fai il lavavetri ai semafori e guadagni", emoji: "🧼", keyword: "window cleaner" },
    { testo: "Lavori come volontario in un canile e ricevi", emoji: "🐕", keyword: "dog shelter" },
    { testo: "Fai il bagnino in piscina e vieni pagato", emoji: "🏊", keyword: "lifeguard" },
    { testo: "Lavori come venditore ambulante di gelati e guadagni", emoji: "🍨", keyword: "ice cream vendor" },
    { testo: "Fai il musicista in metropolitana e ricevi", emoji: "🎸", keyword: "musician" },
    { testo: "Lavori come influencer e ottieni una sponsorizzazione da", emoji: "📱", keyword: "influencer" },
    { testo: "Fai il postino per un giorno e vieni pagato", emoji: "📬", keyword: "postman" },
    { testo: "Lavori come chef in un food truck e guadagni", emoji: "🚚", keyword: "food truck" },
    { testo: "Fai il tassista per una corsa e ricevi", emoji: "🚕", keyword: "taxi" },
    { testo: "Lavori come programmatore freelance e guadagni", emoji: "💻", keyword: "programmer" },
    { testo: "Fai il pittore di case e vieni pagato", emoji: "🎨", keyword: "house painter" },
    { testo: "Lavori come addetto alle pulizie in un hotel e ricevi", emoji: "🧹", keyword: "hotel cleaning" },
    { testo: "Fai il venditore di fiori al mercato e guadagni", emoji: "💐", keyword: "flower market" },
    { testo: "Lavori come attore in una pubblicità e ricevi", emoji: "🎬", keyword: "actor" },
    { testo: "Fai il clown a una festa di bambini e guadagni", emoji: "🤡", keyword: "clown" },
    { testo: "Lavori come tecnico informatico e risolvi un problema per", emoji: "🖥️", keyword: "it technician" },
    { testo: "Fai il barbiere per un amico e vieni pagato", emoji: "💈", keyword: "barber" },
    { testo: "Lavori come autista di autobus e ricevi", emoji: "🚌", keyword: "bus driver" },
    { testo: "Fai il falegname e costruisci una sedia per", emoji: "🪑", keyword: "carpenter" },
    { testo: "Lavori come pescatore e vendi il pescato per", emoji: "🎣", keyword: "fisherman" },
    { testo: "Fai il panettiere e vendi pane fresco per", emoji: "🍞", keyword: "baker" },
    { testo: "Lavori come traduttore e ricevi", emoji: "🌐", keyword: "translator" },
    { testo: "Fai il grafico per un volantino e guadagni", emoji: "🖌️", keyword: "graphic designer" },
    { testo: "Lavori come addetto stampa e ricevi", emoji: "📰", keyword: "press" },
    { testo: "Fai il custode in una scuola e vieni pagato", emoji: "🏫", keyword: "janitor" },
    { testo: "Lavori come addestratore di cani e guadagni", emoji: "🐕‍🦺", keyword: "dog trainer" },
    { testo: "Fai il pilota di droni e ricevi", emoji: "🛸", keyword: "drone pilot" },
    { testo: "Lavori come apicoltore e vendi miele per", emoji: "🐝", keyword: "beekeeper" },
    { testo: "Fai il cuoco in una mensa e guadagni", emoji: "🥘", keyword: "canteen cook" },
    { testo: "Lavori come bibliotecario e ricevi", emoji: "📚", keyword: "librarian" },
    { testo: "Fai il cameriere in una trattoria e vieni pagato", emoji: "🍽️", keyword: "waiter" },
    { testo: "Lavori come artista digitale e vendi un NFT per", emoji: "🖼️", keyword: "digital artist" },
    { testo: "Fai il parrucchiere e ricevi una mancia di", emoji: "✂️", keyword: "hairdresser" }
]
const lavoriIllegali = [
    {
        testo: "Hai fatto il rapinatore di banche e hai guadagnato un bottino enorme!",
        emoji: "🏦💰", keyword: "bank robbery",
        illegale: true, xpMin: 10000, xpMax: 20000, euroMin: 10, euroMax: 30, arrestoProb: 0.35
    },
    {
        testo: "Hai contrabbandato diamanti e hai fatto un sacco di soldi!",
        emoji: "💎🚚", keyword: "diamond smuggling",
        illegale: true, xpMin: 8000, xpMax: 15000, euroMin: 8, euroMax: 25, arrestoProb: 0.30
    },
    {
        testo: "Hai hackerato un conto bancario e hai preso una fortuna!",
        emoji: "💻💸", keyword: "hacker",
        illegale: true, xpMin: 7000, xpMax: 14000, euroMin: 7, euroMax: 20, arrestoProb: 0.25
    },
    {
        testo: "Hai fatto il truffatore online e hai guadagnato molto!",
        emoji: "🕵️‍♂️💳", keyword: "scam",
        illegale: true, xpMin: 5000, xpMax: 12000, euroMin: 5, euroMax: 18, arrestoProb: 0.20
    },
    {
        testo: "Hai rubato auto di lusso e le hai rivendute!",
        emoji: "🚗💵", keyword: "car theft",
        illegale: true, xpMin: 6000, xpMax: 13000, euroMin: 6, euroMax: 22, arrestoProb: 0.28
    }
]

let tuttiLavori = lavori.concat(lavoriIllegali);

let handler = async (m, { conn, isPrems }) => {
    let user = global.db.data.users[m.sender]
    let tempo = 5 * 60
    if (cooldowns[m.sender] && Date.now() - cooldowns[m.sender] < tempo * 1000) {
        const tempoRimanente = secondiAHMS(Math.ceil((cooldowns[m.sender] + tempo * 1000 - Date.now()) / 1000))
        conn.reply(m.chat, `『 ⏳ 』- *Aspetta ${tempoRimanente}* prima di lavorare di nuovo.`, m)
        return
    }

    let lavoroObj = scegliCasuale(tuttiLavori)
    let guadagno, euro, arrestato = false
    if (lavoroObj.illegale) {
        if (Math.random() < lavoroObj.arrestoProb) {
            arrestato = true
            guadagno = -pickRandom([3000, 5000, 7000, 10000])
            euro = -pickRandom([3, 5, 8, 10])
        } else {
            guadagno = Math.floor(Math.random() * (lavoroObj.xpMax - lavoroObj.xpMin + 1)) + lavoroObj.xpMin
            euro = Math.floor(Math.random() * (lavoroObj.euroMax - lavoroObj.euroMin + 1)) + lavoroObj.euroMin
        }
    } else {
        guadagno = Math.floor(Math.random() * 5000) + 500
        euro = Math.random() < 0.7 ? pickRandom([1, 2, 3, 4, 5]) : 0 //70 percento (non trovo il simbolo)
    }

    cooldowns[m.sender] = Date.now()
    const lavoro = lavoroObj.testo
    const emoji = lavoroObj.emoji
    const keyword = lavoroObj.keyword || lavoro.split(' ')[2] || 'lavoro'
    const unsplashApiKey = global.unsplashApiKey
    let imageUrl = null

    try {
        const res = await fetch(`https://api.unsplash.com/photos/random?query=${encodeURIComponent(keyword)}&client_id=${unsplashApiKey}`)
        if (res.ok) {
            const data = await res.json()
            imageUrl = data.urls?.regular
        }
    } catch (e) {
        imageUrl = null
    }

    if (arrestato) {
        user.exp = Math.max(0, (user.exp || 0) + guadagno)
        user.euro = Math.max(0, (user.euro || 0) + euro)
    } else {
        user.exp += guadagno
        if (euro > 0) user.euro = (user.euro || 0) + euro
    }

    let messaggio = `
${emoji} *${lavoro}*
${arrestato ? "『 🚨 』- \`Sei stato arrestato! Hai perso XP e euro!\`" : `『 💰 』- \`Guadagni:\` *${toNum(guadagno)}* XP`}
${euro ? `🌟 *euro:* ${euro > 0 ? "+" : ""}${euro}` : ''}
`.trim()

    if (imageUrl) {
        await conn.sendMessage(m.chat, { image: { url: imageUrl }, caption: messaggio }, { quoted: m })
    } else {
        await conn.reply(m.chat, messaggio, m)
    }
}

handler.help = ['lavorare']
handler.tags = ['euro']
handler.command = ['work', 'lavorare', 'lavoro']
handler.register = true 
export default handler

function toNum(number) {
    if (number >= 1000 && number < 1000000) {
        return (number / 1000).toFixed(1) + 'k'
    } else if (number >= 1000000) {
        return (number / 1000000).toFixed(1) + 'M'
    } else if (number <= -1000 && number > -1000000) {
        return (number / 1000).toFixed(1) + 'k'
    } else if (number <= -1000000) {
        return (number / 1000000).toFixed(1) + 'M'
    } else {
        return number.toString()
    }
}

function secondiAHMS(secondi) {
    let minuti = Math.floor((secondi % 3600) / 60)
    let secondiRimanenti = secondi % 60
    return `${minuti} minuti e ${secondiRimanenti} secondi`
}

function scegliCasuale(lista) {
    return lista[Math.floor(lista.length * Math.random())];
}

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
}