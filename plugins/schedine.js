
import fs from 'fs'
import crypto from 'crypto'

const SNAI_PATH = './media/snai.png'

const CAMPIONATI = {
  "SERIE A": ["Atalanta", "Bologna", "Cagliari", "Como", "Empoli", "Fiorentina", "Genoa", "Inter", "Juventus", "Lazio", "Lecce", "Milan", "Monza", "Napoli", "Parma", "Roma", "Torino", "Udinese", "Venezia", "Verona"],
  "MONDIALI": ["Italia", "Argentina", "Brasile", "Francia", "Germania", "Spagna", "Inghilterra", "Portogallo", "Olanda", "Belgio", "Croazia", "Marocco", "Giappone", "Uruguay", "Svizzera", "USA"]
}

const EVENTI = ["🔥 Azione pericolosa!", "🧤 Parata incredibile!", "🟨 Cartellino giallo!", "🎯 Palla fuori di poco!", "🖥️ Controllo VAR...", "🚩 Calcio d'angolo", "⚡ Contropiede!", "🚫 Fuorigioco!"]

function formatNumber(num) { return new Intl.NumberFormat('it-IT').format(num) }

function getMatch(seed, lista, count = 1) {
  let matches = []
  let temp = [...lista]
  for (let i = 0; i < count; i++) {
    const hash = crypto.createHash('md5').update(seed + i).digest('hex')
    const idx1 = parseInt(hash.substring(0, 8), 16) % temp.length
    const casa = temp.splice(idx1, 1)[0]
    const idx2 = parseInt(hash.substring(8, 16), 16) % temp.length
    const trasf = temp.splice(idx2, 1)[0]
    matches.push({ casa, trasf, quota: (Math.random() * (2.2 - 1.5) + 1.5).toFixed(2) })
  }
  return matches
}

async function modificaMessaggio(conn, chatId, key, testo) {
  try { await conn.sendMessage(chatId, { text: testo, edit: key }) } catch (e) { console.error(e) }
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const who = m.sender
  const user = global.db.data.users[who]
  const mode = args[0]?.toUpperCase() // SINGOLA o TRIPLA
  const puntata = parseInt(args[1])
  const tipoCamp = args[2]
  const scelta = args[3]?.toUpperCase()

  // STEP 0: Scelta Modalità
  if (!mode || !['SINGOLA', 'TRIPLA'].includes(mode)) {
    const buttons = [
      { buttonId: `${usedPrefix + command} SINGOLA`, buttonText: { displayText: '⚽ SINGOLA' }, type: 1 },
      { buttonId: `${usedPrefix + command} TRIPLA`, buttonText: { displayText: '🚀 TRIPLA (MULTIPLA)' }, type: 1 }
    ]
    const cap = `╔════════════════╗\n     🎰  *SNAI BETTING* 🎰\n╚════════════════╝\n\n👤 *UTENTE:* @${who.split('@')[0]}\n💰 *SALDO:* ${formatNumber(user.euro)}€\n\n🎯 *SCEGLI COME GIOCARE:*`
    return conn.sendMessage(m.chat, {
      ...(fs.existsSync(SNAI_PATH) ? { image: fs.readFileSync(SNAI_PATH) } : {}),
      caption: cap, buttons, mentions: [who]
    }, { quoted: m })
  }

  // STEP 1: Puntata
  if (!puntata || isNaN(puntata)) {
    const buttons = [
      { buttonId: `${usedPrefix + command} ${mode} 100`, buttonText: { displayText: '💵 100€' }, type: 1 },
      { buttonId: `${usedPrefix + command} ${mode} 500`, buttonText: { displayText: '💵 500€' }, type: 1 },
      { buttonId: `${usedPrefix + command} ${mode} 1000`, buttonText: { displayText: '💵 1000€' }, type: 1 }
    ]
    return conn.sendMessage(m.chat, { text: `🕹️ *MODALITÀ:* ${mode}\n💰 *SALDO:* ${formatNumber(user.euro)}€\n\n💸 _Quanto vuoi puntare?_`, buttons }, { quoted: m })
  }

  // STEP 2: Campionato
  if (!tipoCamp) {
    const buttons = [
      { buttonId: `${usedPrefix + command} ${mode} ${puntata} SERIEA`, buttonText: { displayText: '🇮🇹 SERIE A' }, type: 1 },
      { buttonId: `${usedPrefix + command} ${mode} ${puntata} MONDIALI`, buttonText: { displayText: '🌎 MONDIALI' }, type: 1 }
    ]
    return conn.sendMessage(m.chat, { text: `🏆 _Seleziona la competizione per la tua ${mode}:_`, buttons }, { quoted: m })
  }

  const lista = CAMPIONATI[tipoCamp === 'SERIEA' ? "SERIE A" : "MONDIALI"]
  const matches = getMatch(who + tipoCamp, lista, mode === 'SINGOLA' ? 1 : 3)

  // STEP 3: Scelta Scommessa
  if (!scelta) {
    let buttons = []
    let txt = ""
    if (mode === 'SINGOLA') {
      const m1 = matches[0]
      txt = `🏟️ *MATCH:* ${m1.casa} [CASA] vs ${m1.trasf} [TRASFERTA]\n\n❓ *Su quale squadra vuoi scommettere?*`
      buttons = [
        { buttonId: `${usedPrefix + command} ${mode} ${puntata} ${tipoCamp} 1`, buttonText: { displayText: `🏠 ${m1.casa}` }, type: 1 },
        { buttonId: `${usedPrefix + command} ${mode} ${puntata} ${tipoCamp} X`, buttonText: { displayText: '🤝 Pareggio' }, type: 1 },
        { buttonId: `${usedPrefix + command} ${mode} ${puntata} ${tipoCamp} 2`, buttonText: { displayText: `✈️ ${m1.trasf}` }, type: 1 }
      ]
    } else {
      txt = `📝 *TUA TRIPLA (MULTIPLA):*\n`
      matches.forEach((m, i) => txt += `⚽ M${i+1}: ${m.casa} vs ${m.trasf}\n`)
      txt += `\n🎯 _Scegli una combinazione veloce:_`
      buttons = ['111', '1X2', '2X1', 'XXX'].map(c => ({ buttonId: `${usedPrefix + command} ${mode} ${puntata} ${tipoCamp} ${c}`, buttonText: { displayText: `Punta: ${c}` }, type: 1 }))
    }
    return conn.sendMessage(m.chat, { text: txt, buttons }, { quoted: m })
  }

  if (user.euro < puntata) return m.reply(`❌ *SALDO INSUFFICIENTE!*`)
  user.euro -= puntata

  // LOGICA SIMULAZIONE
  let liveText = mode === 'SINGOLA' ? `🏟️ *MATCH:* ${matches[0].casa} vs ${matches[0].trasf}\n` : `🎟️ *MULTIPLA TRIPLA*\n`
  liveText += `💵 *PUNTATA:* ${formatNumber(puntata)}€\n───────────────────\n`
  
  const live = await conn.sendMessage(m.chat, { text: liveText + `⏳ _ Fischio d'inizio..._` })

  let vintoTotale = true
  let vincitaFinale = 0
  let resText = ""

  for (let i = 0; i < matches.length; i++) {
    await new Promise(r => setTimeout(r, 2000))
    const mMatch = matches[i]
    const gC = Math.floor(Math.random() * 4)
    const gT = Math.floor(Math.random() * 4)
    const esito = gC > gT ? '1' : (gC < gT ? '2' : 'X')
    const miaGiocata = mode === 'SINGOLA' ? scelta : scelta[i]
    const mVinto = esito === miaGiocata
    
    if (!mVinto) vintoTotale = false
    resText += `${mVinto ? '✅' : '❌'} ${mMatch.casa} ${gC}-${gT} ${mMatch.trasf} (Tu: ${miaGiocata})\n`
    await modificaMessaggio(conn, m.chat, live.key, liveText + resText)
  }

  if (vintoTotale) {
    let qTot = 1
    matches.forEach(mt => qTot *= parseFloat(mt.quota))
    vincitaFinale = Math.floor(puntata * qTot)
    user.euro += vincitaFinale
  }

  const finaleMsg = liveText + resText + `───────────────────\n${vintoTotale ? `🏆 *VINCENTE!* +${formatNumber(vincitaFinale)}€` : `💀 *PERDENTE!* -${formatNumber(puntata)}€`}\n🏦 *SALDO:* ${formatNumber(user.euro)}€`
  await modificaMessaggio(conn, m.chat, live.key, finaleMsg)
}

handler.command = /^(schedina|bet|multipla)$/i
handler.group = true

export default handler
