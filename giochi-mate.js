const activeQuizzes = new Map()
const userStats = new Map()

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function roundToTwo(num) {
  return Math.round(num * 100) / 100
}

function generateQuestion(level = 'facile') {
  let question = ''
  let answer = 0

  switch (level) {
    case 'facile': {
      const a = randomInt(1, 20)
      const b = randomInt(1, 20)
      const ops = ['+', '-']
      const op = ops[randomInt(0, ops.length - 1)]
      question = `${a} ${op} ${b}`
      answer = op === '+' ? a + b : a - b
      break
    }
    case 'medio': {
      const a = randomInt(2, 12)
      const b = randomInt(2, 12)
      const ops = ['*', '/']
      const op = ops[randomInt(0, ops.length - 1)]
      if (op === '*') {
        question = `${a} × ${b}`
        answer = a * b
      } else {
        const result = randomInt(2, 12)
        const dividend = b * result
        question = `${dividend} ÷ ${b}`
        answer = result
      }
      break
    }
    case 'difficile': {
      const a = randomInt(2, 5)
      const b = randomInt(2, 4)
      const c = randomInt(10, 30)
      question = `(${a}^${b}) + √${c}`
      answer = Math.pow(a, b) + Math.sqrt(c)
      answer = roundToTwo(answer)
      break
    }
    case 'impossibile': {
      const a = randomInt(10, 30)
      const b = randomInt(2, 10)
      const c = randomInt(5, 20)
      const d = randomInt(2, 6)
      question = `(${a}^2 ÷ ${b}) + (√${c} × ${d}) - ${b}^2`
      answer = (Math.pow(a, 2) / b) + (Math.sqrt(c) * d) - Math.pow(b, 2)
      answer = roundToTwo(answer)
      break
    }
  }

  return { question, answer }
}

function getTimer(level) {
  const timers = {
    facile: 30000,
    medio: 40000,
    difficile: 50000,
    impossibile: 60000
  }
  return timers[level] || 30000
}

function giveRewards(userJid, level) {
  const baseExp = {
    facile: [8, 15],
    medio: [18, 30],
    difficile: [40, 60],
    impossibile: [80, 120]
  }
  const baseEuro = {
    facile: [4, 8],
    medio: [10, 20],
    difficile: [25, 45],
    impossibile: [60, 85]
  }

  const expReward = randomInt(...baseExp[level] || [10, 15])
  const euroReward = randomInt(...baseEuro[level] || [5, 10])

  let stats = userStats.get(userJid) || { exp: 0, euro: 0 }
  stats.exp += expReward
  stats.euro += euroReward

  userStats.set(userJid, stats)
  return { exp: expReward, euro: euroReward, total: stats }
}

function getLeaderboard(conn) {
  const sorted = [...userStats.entries()]
    .sort((a, b) => b[1].exp - a[1].exp)
    .slice(0, 5)

  if (sorted.length === 0) return '📉 Nessun matematico in classifica ancora.'

  let leaderboard = '🏆 *Classifica Migliori Matematici* 🏆\n\n'
  sorted.forEach(([jid, stats], i) => {
    leaderboard += `${i + 1}. @${jid.split('@')[0]}\n   ┗ 🎓 EXP: *${stats.exp}*, 💰 Euro: *€${stats.euro}*\n`
  })
  return leaderboard.trim()
}

let handler = async (m, { conn, text }) => {
  const chatId = m.chat
  const cmd = m.text?.trim().toLowerCase() || ''
  const level = (text || '').toLowerCase()

  if (activeQuizzes.has(chatId)) {
    if (cmd.startsWith('.ia') || cmd.startsWith('.gemini')) {
      return m.reply('🚫 Comando disabilitato durante il quiz matematico. Rispondi alla domanda!')
    }
  }

  if (!level) {
    return m.reply(`🎲 *Quiz Matematico Interattivo* 🎲\n\nScegli una difficoltà:

🔹 *.mate facile*\n🔸 *.mate medio*\n🔺 *.mate difficile*\n💀 *.mate impossibile*\n
📊 Classifica: *.mate classifica*\n\n⌛ Hai tempo limitato per rispondere!`) 
  }

  if (level === 'classifica') {
    return conn.sendMessage(chatId, {
      text: getLeaderboard(conn),
      mentions: [...userStats.keys()]
    })
  }

  if (!['facile', 'medio', 'difficile', 'impossibile'].includes(level)) {
    return m.reply('❌ Difficoltà non valida. Scegli tra: facile, medio, difficile, impossibile o classifica.')
  }

  if (activeQuizzes.has(chatId)) {
    return m.reply('⏳ C\'è già un quiz in corso. Rispondi prima di iniziare un nuovo quiz.')
  }

  const { question, answer } = generateQuestion(level)

  await conn.sendMessage(chatId, {
    text: `📚 *Domanda di Matematica* [${level.toUpperCase()}]\n\n🧠 Quanto fa:\n\n➤ *${question}*\n\n⌛ Tempo: ${getTimer(level) / 1000}s` 
  })

  activeQuizzes.set(chatId, {
    answer,
    level,
    timeout: setTimeout(() => {
      conn.sendMessage(chatId, {
        text: `⌛ Tempo scaduto! ❌ La risposta era *${answer}*.`
      })
      activeQuizzes.delete(chatId)
    }, getTimer(level))
  })
}

handler.before = async (m, { conn }) => {
  const chatId = m.chat
  if (!activeQuizzes.has(chatId)) return false

  const quiz = activeQuizzes.get(chatId)
  if (!m.text) return false

  const userAnswer = m.text.trim()
  const userAnswerNum = Number(userAnswer)
  if (isNaN(userAnswerNum)) return false

  const correctAnswer = Math.round(quiz.answer * 100) / 100
  if (Math.abs(userAnswerNum - correctAnswer) < 0.01) {
    clearTimeout(quiz.timeout)
    activeQuizzes.delete(chatId)

    const reward = giveRewards(m.sender, quiz.level)
    await conn.sendMessage(chatId, {
      text: `🎉 *Risposta corretta!*

📈 Ricompense ottenute:
• 🎓 EXP: *+${reward.exp}*
• 💰 Euro: *+€${reward.euro}*`,
      mentions: [m.sender]
    })
    return true
  } else {
    await m.reply('❌ Sbagliato! Riprova.')
    return true
  }
}

handler.help = ['matematica']
handler.tags = ['giochi']
handler.command = ['mate', 'matematica']

export default handler