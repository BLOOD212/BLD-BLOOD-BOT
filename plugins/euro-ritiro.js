let handler = async (m, { args, conn, usedPrefix, command }) => {
  let user = global.db.data.users[m.sender]
  const formatNumber = (num) => num.toLocaleString('it-IT')

  if (!args[0]) {
    let message = `
*╭───╼ 🏦 ╾───╮*
    *PRELIEVO BANCA*
*╰───╼ ⚡ ╾───╯*

👋 Ciao @${m.sender.split('@')[0]},
indica la quantità di euro da prelevare.

*┏━━━━━━━━━━━━━━━━┓*
*┃* 💰 *IN BANCA:* ${formatNumber(user.bank || 0)}
*┃* 👛 *PORTAFOGLIO:* ${formatNumber(user.euro || 0)}
*┗━━━━━━━━━━━━━━━━┛*

*『✏️』 ESEMPI:*
• *${usedPrefix + command} 500*
• *${usedPrefix + command} tutto*

━━━━━━━━━━━━━━━━━━━━`.trim()

    const buttons = [
      { buttonId: `${usedPrefix + command} tutto`, buttonText: { displayText: '💰 TUTTO' }, type: 1 },
      { buttonId: `${usedPrefix + command} 1000`, buttonText: { displayText: '💶 1.000' }, type: 1 },
      { buttonId: `${usedPrefix + command} 5000`, buttonText: { displayText: '🏧 5.000' }, type: 1 }
    ]

    return await conn.sendMessage(m.chat, {
      text: message,
      footer: 'ᴘᴏᴡᴇʀᴇᴅ ʙʏ ʙʟᴅ ʙʟᴏᴏᴅ ʙᴏᴛ',
      buttons: buttons,
      headerType: 1,
      mentions: [m.sender]
    }, { quoted: m })
  }

  if (args[0].toLowerCase() === 'tutto' || args[0].toLowerCase() === 'all') {
    if (!user.bank || user.bank <= 0) {
      return m.reply(`*⚠️ Non hai euro depositati da ritirare!*`)
    }

    let count = parseInt(user.bank)
    user.bank -= count
    user.euro += count

    return m.reply(`
*╭───╼ ✅ ╾───╮*
    *RITIRO ESEGUITO*
*╰───╼ ⚡ ╾───╯*

✨ *Operazione completata con successo!*

*┏━━━━━━━━━━━━━━━━┓*
*┃* 💵 *RITIRATI:* +${formatNumber(count)}
*┃* 🏦 *BANCA:* 0
*┃* 👛 *IN MANO:* ${formatNumber(user.euro)}
*┗━━━━━━━━━━━━━━━━┛*
*ID Transazione:* _#${Math.random().toString(36).substr(2, 6).toUpperCase()}_

━━━━━━━━━━━━━━━━━━━━`.trim())
  }

  if (!Number(args[0])) return m.reply(`*🔢 Inserisci una cifra numerica valida!*`)

  let count = parseInt(args[0])
  if (count <= 0) return m.reply(`*💀 Vuoi ritirare zero o meno? Riprova.*`)

  if (!user.bank || user.bank <= 0) return m.reply(`*📉 La tua banca è vuota.*`)

  if (user.bank < count) return m.reply(`*🚫 Non hai abbastanza fondi! Hai solo ${formatNumber(user.bank)} € in banca.*`)

  user.bank -= count
  user.euro += count

  return m.reply(`
*╭───╼ ✅ ╾───╮*
    *RITIRO ESEGUITO*
*╰───╼ ⚡ ╾───╯*

✨ *Operazione completata con successo!*

*┏━━━━━━━━━━━━━━━━┓*
*┃* 💵 *RITIRATI:* +${formatNumber(count)}
*┃* 🏦 *BANCA:* ${formatNumber(user.bank)}
*┃* 👛 *IN MANO:* ${formatNumber(user.euro)}
*┗━━━━━━━━━━━━━━━━┛*
*ID Transazione:* _#${Math.random().toString(36).substr(2, 6).toUpperCase()}_

━━━━━━━━━━━━━━━━━━━━`.trim())
}

handler.help = ['ritira']
handler.tags = ['euro']
handler.command = /^(withdraw|ritirare|ritira)$/i
handler.register = false

export default handler
