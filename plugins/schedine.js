//By Bonzino

import fs from 'fs'
import path from 'path'
import Jimp from 'jimp'

const PERCORSO_SQUADRE = './media/database/squadre.json'
const CARTELLA_CACHE = './media/seriea_cache'
const SFONDO_PATH = path.join(CARTELLA_CACHE, 'sfondo_serie_a.png')
const SNAI_PATH = './media/snai.png'

// Cambia questo se vuoi un altro sfondo
const SFONDO_URL = 'https://i.imgur.com/3GbgP6K.png'

const EVENTI = [
  'goal',
  'parata',
  'palo',
  'ammonizione',
  'var',
  'occasione',
  'corner',
  'contropiede',
  'fuorigioco',
  'traversa'
]

function formatNumber(num) {
  return new Intl.NumberFormat('it-IT').format(num)
}

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function caricaSquadre() {
  try {
    const raw = fs.readFileSync(PERCORSO_SQUADRE, 'utf8')
    const data = JSON.parse(raw)
    return Array.isArray(data) ? data : []
  } catch (e) {
    console.error('Errore caricamento squadre.json:', e)
    return []
  }
}

function pickTwoTeams() {
  const squadre = caricaSquadre()
  if (squadre.length < 2) throw new Error('Squadre insufficienti nel database')

  const casa = pickRandom(squadre)
  const trasf = pickRandom(squadre.filter(s => s.nome !== casa.nome))
  return { casa, trasf }
}

function generaQuota() {
  return (Math.random() * (4.2 - 1.55) + 1.55).toFixed(2)
}

function generaRisultato(vittoriaCasa) {
  let golCasa = Math.floor(Math.random() * 4)
  let golTrasf = Math.floor(Math.random() * 4)

  if (vittoriaCasa) {
    if (golCasa <= golTrasf) golCasa = golTrasf + 1
  } else {
    if (golTrasf <= golCasa) golTrasf = golCasa + 1
  }

  return { golCasa, golTrasf }
}

function eventoCasuale(casa, trasf) {
  const tipo = pickRandom(EVENTI)

  switch (tipo) {
    case 'goal':
      return `⚽ *𝐆𝐎𝐀𝐋!* ${pickRandom([casa, trasf])} 𝐬𝐛𝐥𝐨𝐜𝐜𝐚 𝐥𝐚 𝐩𝐚𝐫𝐭𝐢𝐭𝐚!`
    case 'parata':
      return `🧤 *𝐏𝐀𝐑𝐀𝐓𝐀 𝐃𝐄𝐂𝐈𝐒𝐈𝐕𝐀!* 𝐈𝐥 𝐩𝐨𝐫𝐭𝐢𝐞𝐫𝐞 𝐝𝐞𝐥 ${pickRandom([casa, trasf])} 𝐬𝐚𝐥𝐯𝐚 𝐭𝐮𝐭𝐭𝐨.`
    case 'palo':
      return `😱 *𝐏𝐀𝐋𝐎!* ${pickRandom([casa, trasf])} 𝐚 𝐮𝐧 𝐩𝐚𝐬𝐬𝐨 𝐝𝐚𝐥 𝐠𝐨𝐚𝐥.`
    case 'ammonizione':
      return `🟨 *𝐀𝐌𝐌𝐎𝐍𝐈𝐙𝐈𝐎𝐍𝐄* 𝐩𝐞𝐫 𝐮𝐧 𝐠𝐢𝐨𝐜𝐚𝐭𝐨𝐫𝐞 𝐝𝐞𝐥 ${pickRandom([casa, trasf])}.`
    case 'var':
      return `🖥️ *𝐕𝐀𝐑 𝐈𝐍 𝐂𝐎𝐑𝐒𝐎...* 𝐜𝐡𝐞𝐜𝐤 𝐩𝐞𝐫 𝐮𝐧 𝐞𝐩𝐢𝐬𝐨𝐝𝐢𝐨 𝐝𝐮𝐛𝐛𝐢𝐨.`
    case 'occasione':
      return `🔥 *𝐆𝐑𝐀𝐍𝐃𝐄 𝐎𝐂𝐂𝐀𝐒𝐈𝐎𝐍𝐄!* ${pickRandom([casa, trasf])} 𝐚𝐝 𝐮𝐧 𝐬𝐨𝐟𝐟𝐢𝐨 𝐝𝐚𝐥 𝐯𝐚𝐧𝐭𝐚𝐠𝐠𝐢𝐨.`
    case 'corner':
      return `🚩 *𝐂𝐀𝐋𝐂𝐈𝐎 𝐃'𝐀𝐍𝐆𝐎𝐋𝐎* 𝐢𝐧 𝐟𝐚𝐯𝐨𝐫𝐞 𝐝𝐞𝐥 ${pickRandom([casa, trasf])}.`
    case 'contropiede':
      return `⚡ *𝐂𝐎𝐍𝐓𝐑𝐎𝐏𝐈𝐄𝐃𝐄 𝐕𝐄𝐋𝐄𝐍𝐎𝐒𝐎* 𝐝𝐞𝐥 ${pickRandom([casa, trasf])}!`
    case 'fuorigioco':
      return `🚫 *𝐅𝐔𝐎𝐑𝐈𝐆𝐈𝐎𝐂𝐎* 𝐬𝐞𝐠𝐧𝐚𝐥𝐚𝐭𝐨, 𝐚𝐳𝐢𝐨𝐧𝐞 𝐬𝐟𝐮𝐦𝐚𝐭𝐚.`
    case 'traversa':
      return `😵 *𝐓𝐑𝐀𝐕𝐄𝐑𝐒𝐀!* 𝐂𝐡𝐞 𝐛𝐫𝐢𝐯𝐢𝐝𝐨 𝐩𝐞𝐫 ${pickRandom([casa, trasf])}.`
    default:
      return `⚽ *𝐏𝐚𝐫𝐭𝐢𝐭𝐚 𝐚𝐜𝐜𝐞𝐬𝐚* 𝐭𝐫𝐚 ${casa} 𝐞 ${trasf}.`
  }
}

function generaCronaca(casa, trasf) {
  return [
    { minuto: "1'", testo: `🔔 *𝐂𝐚𝐥𝐜𝐢𝐨 𝐝'𝐢𝐧𝐢𝐳𝐢𝐨!*` },
    { minuto: "9'", testo: eventoCasuale(casa.nome, trasf.nome) },
    { minuto: "18'", testo: eventoCasuale(casa.nome, trasf.nome) },
    { minuto: "27'", testo: eventoCasuale(casa.nome, trasf.nome) },
    { minuto: "36'", testo: eventoCasuale(casa.nome, trasf.nome) },
    { minuto: "45'", testo: `⏸️ *𝐅𝐢𝐧𝐞 𝐩𝐫𝐢𝐦𝐨 𝐭𝐞𝐦𝐩𝐨.*` },
    { minuto: "46'", testo: `▶️ *𝐈𝐧𝐢𝐳𝐢𝐚 𝐢𝐥 𝐬𝐞𝐜𝐨𝐧𝐝𝐨 𝐭𝐞𝐦𝐩𝐨.*` },
    { minuto: "58'", testo: eventoCasuale(casa.nome, trasf.nome) },
    { minuto: "69'", testo: eventoCasuale(casa.nome, trasf.nome) },
    { minuto: "78'", testo: eventoCasuale(casa.nome, trasf.nome) },
    { minuto: "88'", testo: eventoCasuale(casa.nome, trasf.nome) },
    { minuto: "90+'", testo: `⏳ *𝐑𝐞𝐜𝐮𝐩𝐞𝐫𝐨 𝐢𝐧 𝐜𝐨𝐫𝐬𝐨...*` }
  ]
}

async function scaricaFile(url, destinazione) {
  const response = await fetch(url)
  if (!response.ok) throw new Error(`Download fallito: ${url}`)
  const buffer = Buffer.from(await response.arrayBuffer())
  fs.writeFileSync(destinazione, buffer)
}

async function assicuratiRisorseOnline(casa, trasf) {
  if (!fs.existsSync(CARTELLA_CACHE)) {
    fs.mkdirSync(CARTELLA_CACHE, { recursive: true })
  }

  if (!fs.existsSync(SFONDO_PATH)) {
    await scaricaFile(SFONDO_URL, SFONDO_PATH)
  }

  const pathLogoCasa = path.join(CARTELLA_CACHE, casa.file)
  const pathLogoTrasf = path.join(CARTELLA_CACHE, trasf.file)

  if (!fs.existsSync(pathLogoCasa)) {
    await scaricaFile(casa.logo, pathLogoCasa)
  }

  if (!fs.existsSync(pathLogoTrasf)) {
    await scaricaFile(trasf.logo, pathLogoTrasf)
  }

  return { pathLogoCasa, pathLogoTrasf }
}

async function creaLocandinaPartita(casa, trasf, quota, puntata, vincita) {
  const { pathLogoCasa, pathLogoTrasf } = await assicuratiRisorseOnline(casa, trasf)

  const base = await Jimp.read(SFONDO_PATH)
  const logoCasa = await Jimp.read(pathLogoCasa)
  const logoTrasf = await Jimp.read(pathLogoTrasf)

  const fontBig = await Jimp.loadFont(Jimp.FONT_SANS_64_WHITE)
  const fontMed = await Jimp.loadFont(Jimp.FONT_SANS_32_WHITE)
  const fontSmall = await Jimp.loadFont(Jimp.FONT_SANS_16_WHITE)

  logoCasa.contain(140, 140)
  logoTrasf.contain(140, 140)

  base.composite(logoCasa, 120, 130)
  base.composite(logoTrasf, 640, 130)

  base.print(fontBig, 0, 145, {
    text: 'VS',
    alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
    alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
  }, base.bitmap.width, 80)

  base.print(fontMed, 60, 300, casa.nome)
  base.print(fontMed, 570, 300, trasf.nome)

  base.print(fontSmall, 70, 390, `Puntata: ${formatNumber(puntata)}`)
  base.print(fontSmall, 70, 420, `Quota: x${quota}`)
  base.print(fontSmall, 70, 450, `Vincita: ${formatNumber(vincita)}`)

  const out = path.join(CARTELLA_CACHE, `match_${Date.now()}.jpg`)
  await base.quality(90).writeAsync(out)
  return out
}

async function modificaMessaggio(conn, chatId, key, testo, mentions = []) {
  await conn.relayMessage(
    chatId,
    {
      protocolMessage: {
        key,
        type: 14,
        editedMessage: {
          extendedTextMessage: {
            text: testo,
            contextInfo: mentions.length ? { mentionedJid: mentions } : {}
          }
        }
      }
    },
    {}
  )
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const who = m.sender

  if (!global.db.data.users[who]) global.db.data.users[who] = {}
  const user = global.db.data.users[who]

  if (typeof user.euro === 'undefined') user.euro = 0

  const puntata = parseInt(args[0])

  if (!puntata || isNaN(puntata) || puntata <= 0) {
    const buttons = [
      { buttonId: `${usedPrefix + command} 10`, buttonText: { displayText: '💸 Punta 10' }, type: 1 },
      { buttonId: `${usedPrefix + command} 50`, buttonText: { displayText: '💸 Punta 50' }, type: 1 },
      { buttonId: `${usedPrefix + command} 100`, buttonText: { displayText: '💸 Punta 100' }, type: 1 },
      { buttonId: `${usedPrefix + command} 500`, buttonText: { displayText: '💸 Punta 500' }, type: 1 }
    ]

    return conn.sendMessage(m.chat, {
      image: fs.readFileSync(SNAI_PATH),
      caption:
`╭━━━━━━━🎰━━━━━━━╮
✦ 𝐒𝐂𝐎𝐌𝐌𝐄𝐒𝐒𝐀 ✦
╰━━━━━━━🎰━━━━━━━╯

👤 𝐔𝐭𝐞𝐧𝐭𝐞: @${who.split('@')[0]}
💸 𝐃𝐞𝐧𝐚𝐫𝐨: ${formatNumber(user.euro)}

📝 𝐒𝐞𝐥𝐞𝐳𝐢𝐨𝐧𝐚 𝐥𝐚 𝐩𝐮𝐧𝐭𝐚𝐭𝐚`,
      footer: '⚽ 𝐒𝐢𝐬𝐭𝐞𝐦𝐚 𝐒𝐜𝐨𝐦𝐦𝐞𝐬𝐬𝐞',
      buttons,
      headerType: 4,
      mentions: [who]
    }, { quoted: m })
  }

  if (user.euro < puntata) {
    return m.reply(
`╭━━━━━━━💸━━━━━━━╮
✦ 𝐃𝐄𝐍𝐀𝐑𝐎 𝐈𝐍𝐒𝐔𝐅𝐅𝐈𝐂𝐈𝐄𝐍𝐓𝐄 ✦
╰━━━━━━━💸━━━━━━━╯

💼 𝐇𝐚𝐢: ${formatNumber(user.euro)}
💳 𝐏𝐮𝐧𝐭𝐚𝐭𝐚: ${formatNumber(puntata)}`
    )
  }

  const { casa, trasf } = pickTwoTeams()
  const quota = generaQuota()
  const vincita = Math.floor(puntata * Number(quota))
  const vittoriaCasa = Math.random() > 0.4
  const risultato = generaRisultato(vittoriaCasa)
  const cronaca = generaCronaca(casa, trasf)

  user.euro -= puntata

  let immaginePartita = null
  try {
    immaginePartita = await creaLocandinaPartita(casa, trasf, quota, puntata, vincita)
  } catch (e) {
    console.error('Errore creazione locandina:', e)
  }

const messaggioIniziale = await conn.sendMessage(m.chat, {
  ...(immaginePartita && fs.existsSync(immaginePartita)
    ? { image: fs.readFileSync(immaginePartita) }
    : { image: fs.readFileSync(SNAI_PATH) }),
  caption:
`╭━━━━━━━🎫━━━━━━━╮
✦ 𝐒𝐂𝐇𝐄𝐃𝐈𝐍𝐀 𝐂𝐎𝐍𝐅𝐄𝐑𝐌𝐀𝐓𝐀 ✦
╰━━━━━━━🎫━━━━━━━╯

⚔️ 𝐌𝐚𝐭𝐜𝐡: ${casa.nome} vs ${trasf.nome}

💸 𝐏𝐮𝐧𝐭𝐚𝐭𝐚: ${formatNumber(puntata)}
📈 𝐐𝐮𝐨𝐭𝐚: x${quota}
🏆 𝐕𝐢𝐧𝐜𝐢𝐭𝐚 𝐩𝐨𝐬𝐬𝐢𝐛𝐢𝐥𝐞: ${formatNumber(vincita)}

⏳ 𝐋𝐚 𝐩𝐚𝐫𝐭𝐢𝐭𝐚 𝐬𝐭𝐚 𝐢𝐧𝐢𝐳𝐢𝐚𝐧𝐝𝐨...`
}, { quoted: m })

const messaggioLive = await conn.sendMessage(m.chat, {
  text:
`╭━━━━━━━📡━━━━━━━╮
✦ 𝐂𝐑𝐎𝐍𝐀𝐂𝐀 𝐋𝐈𝐕𝐄 ✦
╰━━━━━━━📡━━━━━━━╯

${casa.nome} 0 - 0 ${trasf.nome}`
}, { quoted: m })

const key = messaggioLive.key
if (!key) return

  let testoLive =
`╭━━━━━━━📡━━━━━━━╮
✦ 𝐂𝐑𝐎𝐍𝐀𝐂𝐀 𝐋𝐈𝐕𝐄 ✦
╰━━━━━━━📡━━━━━━━╯

${casa.nome} 0 - 0 ${trasf.nome}
`

  for (const evento of cronaca) {
    await new Promise(r => setTimeout(r, 1800))
    testoLive += `\n${evento.minuto} ${evento.testo}`
    await modificaMessaggio(conn, m.chat, key, testoLive, [who])
  }

  await new Promise(r => setTimeout(r, 2200))

  if (vittoriaCasa) {
    user.euro += vincita

    await modificaMessaggio(conn, m.chat, key,
`╭━━━━━━━🏁━━━━━━━╮
✦ 𝐅𝐈𝐒𝐂𝐇𝐈𝐎 𝐅𝐈𝐍𝐀𝐋𝐄 ✦
╰━━━━━━━🏁━━━━━━━╯

${casa.nome} ${risultato.golCasa} - ${risultato.golTrasf} ${trasf.nome}

✅ 𝐒𝐜𝐡𝐞𝐝𝐢𝐧𝐚 𝐯𝐢𝐧𝐭𝐚

💸 +${formatNumber(vincita)}
🏦 𝐒𝐚𝐥𝐝𝐨: ${formatNumber(user.euro)}`, [who])
  } else {
    await modificaMessaggio(conn, m.chat, key,
`╭━━━━━━━🏁━━━━━━━╮
✦ 𝐅𝐈𝐒𝐂𝐇𝐈𝐎 𝐅𝐈𝐍𝐀𝐋𝐄 ✦
╰━━━━━━━🏁━━━━━━━╯

${casa.nome} ${risultato.golCasa} - ${risultato.golTrasf} ${trasf.nome}

❌ 𝐒𝐜𝐡𝐞𝐝𝐢𝐧𝐚 𝐩𝐞𝐫𝐬𝐚

📉 -${formatNumber(puntata)}
💼 𝐒𝐚𝐥𝐝𝐨: ${formatNumber(user.euro)}`, [who])
  }

  if (immaginePartita && fs.existsSync(immaginePartita)) {
    fs.unlinkSync(immaginePartita)
  }
}

handler.help = ['schedina']
handler.tags = ['giochi']
handler.command = /^(schedina|bet)$/i
handler.group = true

export default handler