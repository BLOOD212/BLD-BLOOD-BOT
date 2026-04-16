let richiestaInAttesa = {}

async function handler(m, { conn, isAdmin, isBotAdmin, args, usedPrefix, command }) {
  if (!m.isGroup) return

  const userId = m.sender
  const groupId = m.chat

  // Gestione della risposta testuale (per "gestisci")
  if (richiestaInAttesa[m.sender]) {
    const pending = await conn.groupRequestParticipantsList(groupId)
    const input = (m.text || '').trim()
    delete richiestaInAttesa[m.sender]

    if (/^\d+$/.test(input)) {
      const numero = parseInt(input)
      if (numero <= 0) {
        return m.reply("❌ Inserisci un numero valido maggiore di 0.")
      }
      const daAccettare = pending.slice(0, numero)
      try {
        const jidList = daAccettare.map(p => p.jid)
        await conn.groupRequestParticipantsUpdate(groupId, jidList, 'approve')
        return m.reply(`✅ Sono stati accettati ${jidList.length} membri.`)
      } catch {
        return m.reply("❌ Errore durante l'accettazione dei membri.")
      }
    }

    if (input === '39' || input === '+39') {
      const daAccettare = pending.filter(p => p.jid.startsWith('39') || p.jid.startsWith('+39'))
      if (!daAccettare.length) {
        return m.reply("❌ Nessun numero con prefisso +39 trovato nella lista d'attesa.")
      }
      try {
        const jidList = daAccettare.map(p => p.jid)
        await conn.groupRequestParticipantsUpdate(groupId, jidList, 'approve')
        return m.reply(`✅ Accettati ${jidList.length} membri con prefisso +39.`)
      } catch {
        return m.reply("❌ Errore durante l'accettazione dei numeri +39.")
      }
    }

    return m.reply("⚠️ Input non valido. Operazione annullata.")
  }

  // Verifiche permessi
  if (!isBotAdmin) {
    return m.reply("❌ Devo essere admin del gruppo per gestire le richieste.")
  }

  if (!isAdmin) {
    return m.reply("❌ Solo gli amministratori possono usare questo comando.")
  }

  // Recupero lista richieste
  const pending = await conn.groupRequestParticipantsList(groupId)
  if (!pending.length) {
    return m.reply("✅ Non ci sono richieste in sospeso in questo gruppo.")
  }

  // Menu principale (senza argomenti)
  if (!args[0]) {
    return conn.sendMessage(m.chat, {
      text: `Ci sono *${pending.length}* richieste in attesa.\n\nCosa desideri fare?`,
      footer: "Seleziona un'opzione qui sotto",
      buttons: [
        { buttonId: `${usedPrefix}${command} accetta`, buttonText: { displayText: "Accetta Tutti" }, type: 1 },
        { buttonId: `${usedPrefix}${command} rifiuta`, buttonText: { displayText: "Rifiuta Tutti" }, type: 1 },
        { buttonId: `${usedPrefix}${command} accetta39`, buttonText: { displayText: "Accetta +39" }, type: 1 },
        { buttonId: `${usedPrefix}${command} gestisci`, buttonText: { displayText: "Scegli Quantità" }, type: 1 }
      ],
      headerType: 1,
      viewOnce: true
    }, { quoted: m })
  }

  // Comando: accetta [numero]
  if (args[0] === 'accetta') {
    const numero = parseInt(args[1])
    const daAccettare = isNaN(numero) || numero <= 0 ? pending : pending.slice(0, numero)
    try {
      const jidList = daAccettare.map(p => p.jid)
      await conn.groupRequestParticipantsUpdate(groupId, jidList, 'approve')
      return m.reply(`✅ Accettati con successo ${jidList.length} membri.`)
    } catch {
      return m.reply("❌ Errore tecnico nell'accettare le richieste.")
    }
  }

  // Comando: rifiuta
  if (args[0] === 'rifiuta') {
    try {
      const jidList = pending.map(p => p.jid)
      await conn.groupRequestParticipantsUpdate(groupId, jidList, 'reject')
      return m.reply(`❌ Rifiutate con successo ${jidList.length} richieste.`)
    } catch {
      return m.reply("❌ Errore tecnico nel rifiutare le richieste.")
    }
  }

  // Comando: accetta39
  if (args[0] === 'accetta39') {
    const daAccettare = pending.filter(p => p.jid.startsWith('39') || p.jid.startsWith('+39'))
    if (!daAccettare.length) {
      return m.reply("❌ Nessun numero italiano (+39) trovato.")
    }
    try {
      const jidList = daAccettare.map(p => p.jid)
      await conn.groupRequestParticipantsUpdate(groupId, jidList, 'approve')
      return m.reply(`✅ Accettati ${jidList.length} numeri italiani.`)
    } catch {
      return m.reply("❌ Errore durante l'operazione.")
    }
  }

  // Comando: gestisci
  if (args[0] === 'gestisci') {
    richiestaInAttesa[m.sender] = true
    return conn.sendMessage(m.chat, {
      text: `Quante richieste vuoi accettare?\n\nPuoi cliccare un bottone o scrivere un numero manualmente.\nScrivi *39* per accettare solo gli italiani.`,
      footer: "Gestione manuale richieste",
      buttons: [
        { buttonId: `${usedPrefix}${command} accetta 10`, buttonText: { displayText: "10" }, type: 1 },
        { buttonId: `${usedPrefix}${command} accetta 20`, buttonText: { displayText: "20" }, type: 1 },
        { buttonId: `${usedPrefix}${command} accetta 50`, buttonText: { displayText: "50" }, type: 1 },
        { buttonId: `${usedPrefix}${command} accetta 100`, buttonText: { displayText: "100" }, type: 1 },
        { buttonId: `${usedPrefix}${command} accetta 200`, buttonText: { displayText: "200" }, type: 1 }
      ],
      headerType: 1,
      viewOnce: true
    }, { quoted: m })
  }
}

handler.help = ['richieste', 'requests']
handler.tags = ['group']
handler.command = /^(richieste|requests|domande|proposte|peticiones|solicitudes|pedidos|solicitações|anfragen|anforderungen|请求|要求|запросы|требования|طلبات|اقتراحات|अनुरোধ|प्रश्न|demandes|requêtes|permintaan|usulan|istekler|talepler)$/i

handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler
