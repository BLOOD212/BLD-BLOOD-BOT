import fs from 'fs'
import path from 'path'

const IGNORED_FILE = path.resolve('./media/database/ignorati.json')

// Funzione per leggere o creare il file ignorati
function loadIgnored() {
  if (!fs.existsSync(IGNORED_FILE)) return {}
  try {
    return JSON.parse(fs.readFileSync(IGNORED_FILE))
  } catch {
    return {}
  }
}

// Salva il JSON aggiornato
function saveIgnored(data) {
  fs.writeFileSync(IGNORED_FILE, JSON.stringify(data, null, 2))
}

// Converte durata tipo "1h30m" in ms, semplice parser
function parseDuration(str) {
  if (!str) return 0
  let total = 0
  const regex = /(\d+)([smhd])/g
  let match
  while ((match = regex.exec(str)) !== null) {
    const num = parseInt(match[1])
    switch (match[2]) {
      case 's': total += num * 1000; break
      case 'm': total += num * 60000; break
      case 'h': total += num * 3600000; break
      case 'd': total += num * 86400000; break
    }
  }
  return total
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
  const isOwner = m.fromMe || global.owner
    .filter(Boolean)
    .map(v => (typeof v === 'string' ? v : String(v).replace(/\D/g, '')))
    .map(v => v + '@s.whatsapp.net')
    .includes(m.sender)

  if (!isOwner) return m.reply(`❌ Accesso negato, solo owner.`)

  const subcmd = command.toLowerCase()
  const isUnignore = ['unignora','unignore','sblocca','unmutacmd'].includes(subcmd)
  const isIgnore = ['ignora','ignore','blockcmd','mutacmd'].includes(subcmd)

  if (!isIgnore && !isUnignore) return

  let ignoredData = loadIgnored()

  // key per utente (o gruppo, ma qui utente)
  const target = m.mentionedJid && m.mentionedJid[0] || m.quoted?.sender
  if (!target) return m.reply(`Usa menzionando un utente o rispondi a un suo messaggio`)

  if (isIgnore) {
    // tempo opzionale
    let timeArg = args.find(a => a.match(/^\d+[smhd]?$/i))
    let duration = parseDuration(timeArg) || 0
    const now = Date.now()

    ignoredData[target] = {
      ignored: true,
      until: duration ? now + duration : null
    }
    saveIgnored(ignoredData)

    let untilMsg = duration ? ` fino a ${new Date(now + duration).toLocaleString()}` : ''
    return m.reply(`✅ Utente @${target.split('@')[0]} ignorato${untilMsg}`, null, { mentions: [target] })
  }

  if (isUnignore) {
    if (!ignoredData[target]) return m.reply(`ℹ️ Utente @${target.split('@')[0]} non è ignorato`, null, { mentions: [target] })

    delete ignoredData[target]
    saveIgnored(ignoredData)
    return m.reply(`✅ Utente @${target.split('@')[0]} è stato rimosso dalla lista ignorati`, null, { mentions: [target] })
  }
}

handler.help = ['ignora @user [durata]', 'unignora @user']
handler.tags = ['owner']
handler.command = /^(ignora|ignore|blockcmd|mutacmd|unignora|unignore|sblocca|unmutacmd)$/i
handler.rowner = true

export default handler