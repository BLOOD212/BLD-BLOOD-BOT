import fetch from 'node-fetch'

const activeEmails = new Map()
const resetCounts = new Map()
const resetCooldown = new Map()

function getUserRole(userJid, isOwner) {
  if (isOwner) return 'owner'
  if (global.db.data.users[userJid]?.premium) return 'premium'
  return 'normal'
}

function canReset(userJid, isOwner) {
  const role = getUserRole(userJid, isOwner)
  const used = resetCounts.get(userJid) || 0
  const lastReset = resetCooldown.get(userJid) || 0
  const now = Date.now()

  if (now - lastReset < 60000) return false // 1 minuto cooldown

  if (role === 'owner') return true
  if (role === 'premium') return used < 3
  return used < 1
}

function incrementReset(userJid) {
  const used = resetCounts.get(userJid) || 0
  resetCounts.set(userJid, used + 1)
  resetCooldown.set(userJid, Date.now())
}

async function createMailTmAccount() {
  const domainRes = await fetch('https://api.mail.tm/domains')
  const domainData = await domainRes.json()
  const domain = domainData['hydra:member'][0].domain

  const local = Math.random().toString(36).substring(2, 10)
  const email = `${local}@${domain}`
  const password = Math.random().toString(36).substring(2, 10)

  const body = { address: email, password }

  const res = await fetch('https://api.mail.tm/accounts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  })
  if (!res.ok) return null

  const loginRes = await fetch('https://api.mail.tm/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ address: email, password })
  })
  const loginData = await loginRes.json()
  return { email, password, token: loginData.token }
}

async function fetchMailTmMessages(token) {
  const res = await fetch('https://api.mail.tm/messages', {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) return []
  const data = await res.json()
  return data['hydra:member'] || []
}

async function fetchMailTmMessageContent(id, token) {
  const res = await fetch(`https://api.mail.tm/messages/${id}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
  if (!res.ok) return null
  const data = await res.json()
  return data
}

let handler = async (m, { command, conn, isOwner }) => {
  const userJid = m.sender
  global.db.data.users[userJid] = global.db.data.users[userJid] || {}

  switch (command) {
    case 'creamail': {
      if (activeEmails.has(userJid)) {
        return m.reply(
          `❗ *Hai già una mail temporanea attiva!*

` +
          `📧 *Email:* ${activeEmails.get(userJid).email}

` +
          `➡️ Usa *.mail* per controllare i messaggi.
` +
          `➡️ Per resettare la mail usa *.resetmail*`
        )
      }

      const account = await createMailTmAccount()
      if (!account) return m.reply('❌ *Errore* durante la creazione dell\'email.')

      activeEmails.set(userJid, account)
      resetCounts.set(userJid, 0)
      return m.reply(
        `✨ *Email temporanea creata con successo!* ✨

` +
        `📧 *${account.email}*

` +
        `📩 Usa *.mail* per vedere i messaggi ricevuti.
` +
        `🛠️ Usa *.resetmail* per resettare la mail (limiti variabili a seconda del tuo ruolo).`
      )
    }

    case 'mail': {
      if (!activeEmails.has(userJid)) 
        return m.reply('❌ *Non hai ancora creato una mail temporanea.*\nUsa *.creamail* per crearne una.')

      const args = m.text.trim().split(/\s+/)
      const account = activeEmails.get(userJid)

      if (args.length === 1) {
        const messages = await fetchMailTmMessages(account.token)
        if (messages.length === 0) return m.reply(`📭 *Nessun messaggio ricevuto* su *${account.email}* finora.`)

        let text = `📥 *Messaggi ricevuti su:* ${account.email}\n─────────────────────────────\n\n`
        for (let i = 0; i < Math.min(10, messages.length); i++) {
          const msg = messages[i]
          const date = new Date(msg.introdate).toLocaleString('it-IT')
          text += 
            `🆔 *ID:* ${msg.id.slice(0,6)}\n` +
            `📧 *Da:* ${msg.from.address}\n` +
            `📅 *Data:* ${date}\n` +
            `📌 *Oggetto:* ${msg.subject}\n─────────────────────────────\n`
        }
        text += `\n📥 *Usa* *.mail <ID>* *per leggere il messaggio completo.*`
        return m.reply(text)
      } else {
        const id = args[1]
        const messages = await fetchMailTmMessages(account.token)
        const msg = messages.find(m => m.id.startsWith(id))
        if (!msg) return m.reply(`❌ Messaggio con ID che inizia con "${id}" non trovato.`)

        const content = await fetchMailTmMessageContent(msg.id, account.token)
        if (!content) return m.reply('❌ Errore nel recuperare il contenuto del messaggio.')

        const date = new Date(content.introdate).toLocaleString('it-IT')
        const bodyText = content.text || content.textHtml || '[Nessun contenuto testuale]'
        return m.reply(
          `📧 *Da:* ${content.from.address}\n` +
          `📌 *Oggetto:* ${content.subject}\n` +
          `📅 *Data:* ${date}\n\n` +
          `📝 *Contenuto:*\n${bodyText}`
        )
      }
    }

    case 'resetmail': {
      if (!activeEmails.has(userJid)) return m.reply('❌ *Non hai una mail temporanea da resettare.* Usa *.creamail* per crearne una.')

      if (!canReset(userJid, isOwner)) {
        return m.reply('⛔ *Hai superato il limite di reset consentiti oppure stai eseguendo il reset troppo velocemente.*\nContatta un admin o passa premium per aumentare i reset.')
      }

      incrementReset(userJid)
      const newAccount = await createMailTmAccount()
      if (!newAccount) return m.reply('❌ *Errore durante la creazione della nuova email.*')

      activeEmails.set(userJid, newAccount)
      return m.reply(
        `🔄 *Email temporanea resettata con successo!* 🔄\n\n` +
        `📧 *${newAccount.email}*\n\n` +
        `📩 Usa *.mail* per controllare i messaggi.`
      )
    }

    default:
      return
  }
}

handler.command = ['creamail', 'mail', 'resetmail']
handler.tags = ['strumenti', 'premium']
handler.help = ['creamail', 'mail [ID]', 'resetmail']
handler.register = true
handler.group = false
handler.private = false
handler.limit = false
handler.premium = false
export default handler