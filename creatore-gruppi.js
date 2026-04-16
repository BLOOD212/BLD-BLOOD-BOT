const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

var handler = async (m, { conn, text, command, isOwner }) => {
  if (!isOwner) return

  // Ottieni la lista aggiornata dei gruppi
  let groups = Object.values(await conn.groupFetchAllParticipating())

  if (command === 'gruppi') {
    if (groups.length === 0) return conn.reply(m.chat, '⚠️ Nessun gruppo trovato.', m)

    let txt = `🏢 *GESTIONE GRUPPI NEXUS*\n\n`
    txt += `Usa: \`.esci [numero] [si/no]\`\n`
    txt += `_Esempio: .esci 2 si (tagga 4 volte ed esce)_\n\n`

    groups.forEach((g, i) => {
      txt += `*${i + 1}.* ${g.subject}\n`
      txt += `   👥 Membri: ${g.participants.length}\n\n`
    })

    return conn.reply(m.chat, txt, m)
  }

  if (command === 'esci') {
    let [num, spam] = text.split(' ')
    let index = parseInt(num) - 1

    if (!num || isNaN(index) || !groups[index]) {
      return conn.reply(m.chat, '⚠️ Formato errato. Usa: `.esci [numero] si` o `.esci [numero] no`', m)
    }

    let targetGroup = groups[index]
    let participants = targetGroup.participants.map(u => u.id)

    try {
      if (spam === 'si') {
        // Invia 4 messaggi con tag invisibile (mentions)
        for (let i = 0; i < 4; i++) {
          await conn.sendMessage(targetGroup.id, { 
            text: `📢 *NOTIFICA DI USCITA*\n\nse volete entrare, entrate qui:\n\https://chat.whatsapp.com/ISB8ZtqUZGkHyzqI75kIpO


 (${i + 1}/4)`, 
            mentions: participants 
          })
          await delay(500) // Piccolo delay per non far crashare la connessione
        }
      }

      await conn.reply(targetGroup.id, '👋 Addio!')
      await conn.groupLeave(targetGroup.id)

      return conn.reply(m.chat, `✅ Il bot ha abbandonato *${targetGroup.subject}* (Spam: ${spam.toUpperCase()})`, m)
    } catch (e) {
      console.error(e)
      return conn.reply(m.chat, '❌ Errore durante l\'operazione.', m)
    }
  }
}

handler.command = ['gruppi', 'esci']
handler.owner = true

export default handler