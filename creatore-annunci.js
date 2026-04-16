const owner = ['393701330693@s.whatsapp.net']
const staff = [
  '39gimmepussybloodclat@s.whatsapp.net', // aggiungi qui altri membri dello staff
]

const handler = async (m, { conn, args }) => {
  if (![...owner, ...staff].includes(m.sender)) return conn.reply(m.chat, '❌ Solo lo staff o l\'owner possono usare questo comando.', m)
  const testo = args.join(' ').trim()
  if (!testo) return conn.reply(m.chat, 'Scrivi il messaggio da inviare!', m)
  const canaleAnnunci = '120363418582531215@newsletter'
  const nomeAnnunciatore = m.pushName || 'Staff'
  const messaggio = `
╔══════════╗
 📢 *ANNUNCIO* 
╚══════════╝

⮩ *${testo}*

━━━━━━━━━━━━
👤 _Annunciato da: ${nomeAnnunciatore}_
🕒 ${new Date().toLocaleString('it-IT')}
━━━━━━━━━━━━
`

  await conn.sendMessage(canaleAnnunci, { text: messaggio })
  await conn.reply(m.chat, '✅ Annuncio inviato nel canale!', m)
}

handler.help = ['annuncio <testo>']  
handler.command = /^annuncio$/i
handler.owner = false

export default handler