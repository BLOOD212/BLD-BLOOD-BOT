import fs from 'fs/promises'

const MAX_DOMANDE_DEFAULT = 10
const MAX_CONSENTITE = 50
const QUIZ_PATH = './media/database/quizpatente.json'
const TIMEOUT = 60_000
const PREMIO_EURO = 30
const PREMIO_EXP = 150
const ERRORI_MASSIMI_PREMIO = 3

function shuffleArray(array) {
  let arr = array.slice()
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr
}

let handler = async (m, { conn, command, args }) => {
  conn.quizpatente = conn.quizpatente || {}

  const id = m.chat + ':' + m.sender
  if (id in conn.quizpatente) {
    await conn.reply(m.chat, '『 ⚠️ 』 Hai già un quiz in corso. Attendi la prossima domanda!', conn.quizpatente[id].msg)
    throw false
  }

  const quizData = await fs.readFile(QUIZ_PATH, 'utf8').then(JSON.parse)

  let numeroDomande = parseInt(args[0])
  if (isNaN(numeroDomande) || numeroDomande < 1 || numeroDomande > MAX_CONSENTITE) {
    numeroDomande = MAX_DOMANDE_DEFAULT
  }

  const domande = shuffleArray(quizData).slice(0, numeroDomande)

  const session = {
    domande,
    currentIndex: 0,
    score: 0,
    risposte: [],
    msg: null,
    timeout: null
  }

  const sendNextQuestion = async () => {
    const q = session.domande[session.currentIndex]
    const opts = Object.entries(q.opzioni).map(([k, v]) => `*${k}* - ${v}`).join('\n')
    const buttons = Object.keys(q.opzioni).map(key => ({
      buttonId: key,
      buttonText: { displayText: key },
      type: 1
    }))

    const caption = `『 🚦 』 *Quiz Patente - Domanda ${session.currentIndex + 1}/${numeroDomande}*\n\n*\`${q.domanda}\`*\n\n${opts}`

    const buttonMessage = {
      text: caption,
      footer: 'vare ✧ bot',
      buttons: buttons,
      headerType: 1
    }

    session.msg = await conn.sendMessage(m.chat, buttonMessage, { quoted: m })

    clearTimeout(session.timeout)
    session.timeout = setTimeout(async () => {
      delete conn.quizpatente[id]
      await conn.sendMessage(m.chat, {
        text: '『 ⏱️ 』 *Tempo scaduto!*\nHai impiegato troppo tempo per rispondere. Il quiz è stato annullato.',
        quoted: session.msg
      })
    }, TIMEOUT)
  }

  await sendNextQuestion()
  conn.quizpatente[id] = session
}

handler.before = async (m, { conn }) => {
  conn.quizpatente = conn.quizpatente || {}

  const id = m.chat + ':' + m.sender
  if (!(id in conn.quizpatente)) return

  const session = conn.quizpatente[id]
  
  const userAnswer = m.message?.buttonsResponseMessage?.selectedButtonId || null
  if (!userAnswer) return

  const domandaAttuale = session.domande[session.currentIndex]
  const isCorrect = userAnswer === domandaAttuale.rispostaCorretta.toUpperCase()

  session.risposte.push({
    domanda: domandaAttuale.domanda,
    rispostaUtente: userAnswer,
    corretta: domandaAttuale.rispostaCorretta,
    esito: isCorrect
  })
  
  if (isCorrect) {
    session.score++
  }

  session.currentIndex++

  if (session.currentIndex >= session.domande.length) {
    clearTimeout(session.timeout)
    delete conn.quizpatente[id]

    const errori = session.risposte.filter(r => !r.esito).length
    let riepilogo = session.risposte
      .map((r, i) => {
        const simbolo = r.esito ? '✅' : '❌'
        const domandaOriginale = session.domande[i];
        const rispostaCorrettaTesto = domandaOriginale.opzioni[r.corretta];
        const rispostaUtenteTesto = domandaOriginale.opzioni[r.rispostaUtente];
        return `『 ${simbolo} 』 *\`Domanda ${i + 1}\`*: ${r.domanda}\n\`Risposta data:\` *${r.rispostaUtente}* - ${rispostaUtenteTesto}\n\`Corretta:\` *${r.corretta}* - ${rispostaCorrettaTesto}`
      })
      .join('\n\n')

    let finale = `『 🎉 』 *\`Quiz completato!\`*\n\`${session.score} giuste su ${session.domande.length}\`.\n\n『 📋 』 *\`Riepilogo:\`*\n\n${riepilogo}`

    if (errori <= ERRORI_MASSIMI_PREMIO) {
      if (global.db && global.db.data?.users?.[m.sender]) {
        global.db.data.users[m.sender].euro = (global.db.data.users[m.sender].euro || 0) + PREMIO_EURO
        global.db.data.users[m.sender].exp = (global.db.data.users[m.sender].exp || 0) + PREMIO_EXP
      }
      finale += `\n\n> 🏆 *Ricompensa:* +${PREMIO_EURO}euro, +${PREMIO_EXP}exp`
    }

    return conn.sendMessage(m.chat, { text: finale }, { quoted: m })
  }

  const nextQ = session.domande[session.currentIndex]
  const opts = Object.entries(nextQ.opzioni).map(([k, v]) => `*${k}* - ${v}`).join('\n')

  const nextButtons = Object.keys(nextQ.opzioni).map(key => ({
    buttonId: key,
    buttonText: { displayText: key },
    type: 1
  }))

  const caption = `『 🚦 』 *Domanda ${session.currentIndex + 1}/${session.domande.length}*\n\n${nextQ.domanda}\n\n${opts}`

  const nextButtonMessage = {
    text: caption,
    footer: 'vare ✧ bot',
    buttons: nextButtons,
    headerType: 1
  }

  session.msg = await conn.sendMessage(m.chat, nextButtonMessage, { quoted: m })

  clearTimeout(session.timeout)
  session.timeout = setTimeout(async () => {
    delete conn.quizpatente[id]
    await conn.sendMessage(m.chat, {
      text: '『 ⏱️ 』 *Tempo scaduto!*\nHai impiegato troppo tempo per rispondere. Il quiz è stato annullato.',
      quoted: session.msg
    })
  }, TIMEOUT)
}

handler.command = ['quizpatente']
handler.tags = ['giochi']
handler.help = ['quizpatente']

export default handler