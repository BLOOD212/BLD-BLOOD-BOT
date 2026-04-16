let handler = async (m, { args, conn, usedPrefix, command }) => {
  let user = global.db.data.users[m.sender]
  const formatNumber = (num) => num.toLocaleString('it-IT')

  if (!args[0]) {
    let message = `
ㅤ⋆｡˚『 ╭ \`RITIRO BANCA\` ╯ 』˚｡⋆\n╭\n│
│ 『💬』 \`Scrivi quanti euro\`\n│               \`vuoi ritirare\`
│
│ 『✏️』 \`Esempi:\`
│ • *${usedPrefix + command} 250*
│ • *${usedPrefix + command} tutto*
│
│ 『🏦』 \`In banca:\` *${formatNumber(user.bank || 0)}*
│ 『👛』 \`Nel portafoglio:\` *${formatNumber(user.euro || 0)}*
╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*
`.trim()

    const buttons = [
      { buttonId: `${usedPrefix + command} tutto`, buttonText: { displayText: '💰 Ritira Tutto' }, type: 1 },
      { buttonId: `${usedPrefix + command} 1000`, buttonText: { displayText: '💶 Ritira 1000' }, type: 1 },
      { buttonId: `${usedPrefix + command} 5000`, buttonText: { displayText: '🏧 Ritira 5000' }, type: 1 }
    ]

    return await conn.sendMessage(m.chat, {
      text: message,
      buttons: buttons,
      footer: '✧˚🩸 varebot 🕊️˚✧',
      headerType: 1
    }, { quoted: m })
  }

  if (args[0].toLowerCase() === 'tutto' || args[0].toLowerCase() === 'all') {
    if (!user.bank || user.bank <= 0) {
      return m.reply(`『 📉 』- \`Non hai euro da ritirare!\``)
    }

    let count = parseInt(user.bank)
    user.bank -= count
    user.euro += count

    return m.reply(`
ㅤㅤ⋆｡˚『 ╭ \`RITIRATI\` ╯ 』˚｡⋆\n╭\n│
│ 『 💶 』 \`Hai ritirato:\` *+${formatNumber(count)}*
│ 『 🏦 』 \`Banca:\` *0*
│ 『 👛 』 \`In mano:\` *${formatNumber(user.euro)}*
│
│ 『 🧾 』 \`ID:\` *#${Math.random().toString(36).substr(2, 6)}*
╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*
    `.trim())
  }

  if (!Number(args[0])) return m.reply(`『 🔢 』- *Inserisci un numero valido!*`)

  let count = parseInt(args[0])
  if (count <= 0) return m.reply(`『 🧌 』- \`un numero positivo forse?\``)

  if (!user.bank || user.bank <= 0) return m.reply(`『 📉 』- \`Non hai euro in banca.\``)

  if (user.bank < count) return m.reply(`『 🍥 』- *Hai solo* *${formatNumber(user.bank)}* 🪙 *in banca!*`)

  user.bank -= count
  user.euro += count

  return m.reply(`
ㅤㅤ⋆｡˚『 ╭ \`RITIRATI\` ╯ 』˚｡⋆\n╭\n│
│ 『 💶 』 \`Hai ritirato:\` *+${formatNumber(count)}*
│ 『 🏦 』 \`Banca:\` *${formatNumber(user.bank)}*
│ 『 👛 』 \`In mano:\` *${formatNumber(user.euro)}*
│
│ 『 🧾 』 \`ID:\` *#${Math.random().toString(36).substr(2, 6)}*
╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*
  `.trim())
}

handler.help = ['ritira']
handler.tags = ['euro']
handler.command = /^(withdraw|ritirare|ritira)$/i
handler.register = true

export default handler