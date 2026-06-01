const handler = async (m, { conn, args, groupMetadata, participants, usedPrefix, command, isBotAdmin, isSuperAdmin }) => {
  try {
    // Verifica argomenti
    if (!args || !args[0]) {
      let errorMsg = `*❌ ERRORE*\n`
      errorMsg += `━━━━━━━━━━━━━━━━\n\n`
      errorMsg += `*⚠️ Inserisci un prefisso paese*\n\n`
      errorMsg += `*📝 Esempio:*\n`
      errorMsg += `└─⭓ ${usedPrefix + command} 39\n\n`
      errorMsg += `> BLD-BOT`
      return m.reply(errorMsg)
    }

    if (isNaN(args[0])) {
      let errorMsg = `*❌ ERRORE*\n`
      errorMsg += `━━━━━━━━━━━━━━━━\n\n`
      errorMsg += `*⚠️ Il prefisso deve essere numerico*\n\n`
      errorMsg += `*📝 Esempio:*\n`
      errorMsg += `└─⭓ ${usedPrefix + command} 39\n\n`
      errorMsg += `> BLD-BOT`
      return m.reply(errorMsg)
    }

    const prefix = args[0].replace(/[+]/g, '')
    
    // Ottieni partecipanti
    let groupParticipants = []
    if (participants && Array.isArray(participants)) {
      groupParticipants = participants
    } else if (groupMetadata && groupMetadata.participants) {
      groupParticipants = groupMetadata.participants
    } else {
      try {
        const groupData = await conn.groupMetadata(m.chat)
        groupParticipants = groupData.participants || []
      } catch (e) {
        return m.reply('*❌ Impossibile ottenere i dati del gruppo*')
      }
    }
    
    if (groupParticipants.length === 0) {
      return m.reply('*❌ Lista partecipanti vuota*')
    }

    const bot = (global.db && global.db.data && global.db.data.settings && global.db.data.settings[conn.user.jid]) || {}
    
    // Trova admin
    const adminJids = groupParticipants
      .filter(p => p.admin === 'admin' || p.admin === 'superadmin')
      .map(p => p.id)
    
    // Owner del gruppo
    const ownerGroup = m.chat.split('-')[0] + '@s.whatsapp.net'
    
    // Global owners (gestisci il formato multiplo)
    const globalOwners = []
    if (global.owner) {
      if (typeof global.owner === 'string') {
        // Formato: "393476686131,sam,true,393511082922,gio,true,..."
        const ownerParts = global.owner.split(',')
        for (let i = 0; i < ownerParts.length; i += 3) {
          if (ownerParts[i] && !isNaN(ownerParts[i])) {
            globalOwners.push(ownerParts[i] + '@s.whatsapp.net')
          }
        }
      } else if (Array.isArray(global.owner)) {
        globalOwners.push(...global.owner.map(o => o + '@s.whatsapp.net'))
      } else {
        globalOwners.push(global.owner + '@s.whatsapp.net')
      }
    }
    
    // Per listanum: tutti con il prefisso (inclusi admin)
    const allWithPrefix = groupParticipants
      .filter(p => p.id && p.id.startsWith(prefix) && p.id !== conn.user.jid)
    
    // Per kicknum: solo utenti normali (esclusi admin/owner)
    const kickableUsers = groupParticipants
      .map(p => p.id)
      .filter(userId => {
        if (!userId || userId === conn.user.jid) return false
        if (!userId.startsWith(prefix)) return false
        if (adminJids.includes(userId)) return false
        if (userId === ownerGroup) return false
        if (globalOwners.includes(userId)) return false
        if (userId === isSuperAdmin) return false
        return true
      })
    
    // Controllo se non ci sono numeri con il prefisso
    if (allWithPrefix.length === 0) {
      let msg = `*📍 RISULTATO RICERCA PREFISSO +${prefix}*\n`
      msg += `━━━━━━━━━━━━━━━━\n\n`
      msg += `*❌ Nessun numero con prefisso +${prefix} trovato*\n\n`
      msg += `*📊 Statistiche gruppo:*\n`
      msg += `└─⭓ Totale membri: ${groupParticipants.length}\n`
      msg += `└─⭓ Admin: ${adminJids.length}\n`
      msg += `└─⭓ Con prefisso +${prefix}: 0\n\n`
      msg += `> BLD-BOT`
      
      return m.reply(msg)
    }

    switch (command.toLowerCase()) {
      case 'listanum': 
      case 'listnum': {
        // Lista TUTTI con il prefisso (inclusi admin)
        const listUsers = allWithPrefix.map(p => {
          const isAdmin = adminJids.includes(p.id)
          const isGlobalOwner = globalOwners.includes(p.id)
          const status = isGlobalOwner ? ' 👑' : isAdmin ? ' ⚡' : ''
          return `⭔ @${p.id.replace(/@.+/, '')}${status}`
        })
        
        let msg = `*📋 LISTA NUMERI +${prefix}*\n`
        msg += `━━━━━━━━━━━━━━━━\n\n`
        msg += listUsers.join('\n')
        msg += `\n\n*📊 Totale:* ${allWithPrefix.length} numeri\n`
        msg += `*⚡ Admin:* ${allWithPrefix.filter(p => adminJids.includes(p.id)).length}\n`
        msg += `*👤 Utenti:* ${kickableUsers.length}\n\n`
        msg += `> BLD-BOT`
        
        return conn.reply(m.chat, msg, m, { 
          mentions: allWithPrefix.map(p => p.id) 
        })
      }
      
      case 'kicknum': {
        // Controlla se ci sono utenti kickabili
        if (kickableUsers.length === 0) {
          let msg = `*📍 KICKNUM PREFISSO +${prefix}*\n`
          msg += `━━━━━━━━━━━━━━━━\n\n`
          
          if (allWithPrefix.length === 0) {
            msg += `*❌ Nessun numero con prefisso +${prefix} trovato*\n\n`
          } else {
            msg += `*⚠️ Trovati ${allWithPrefix.length} numeri con prefisso +${prefix}*\n`
            msg += `*ma sono tutti admin/owner e quindi protetti*\n\n`
            
            msg += `*🔒 Numeri protetti:*\n`
            allWithPrefix.forEach(p => {
              const isAdmin = adminJids.includes(p.id)
              const isGlobalOwner = globalOwners.includes(p.id)
              const status = isGlobalOwner ? '👑 Owner' : isAdmin ? '⚡ Admin' : '🛡️ Protetto'
              msg += `⭔ @${p.id.replace(/@.+/, '')} ${status}\n`
            })
            msg += '\n'
          }
          
          msg += `*📊 Statistiche:*\n`
          msg += `└─⭓ Totale con +${prefix}: ${allWithPrefix.length}\n`
          msg += `└─⭓ Kickabili: 0\n\n`
          msg += `> BLD-BOT`
          
          return conn.reply(m.chat, msg, m, { 
            mentions: allWithPrefix.map(p => p.id) 
          })
        }
        
        if (!bot.restrict) {
          return m.reply('*❌ Comando disabilitato!*\n> Per attivarlo usa #on restrict')
        }
        
        if (!isBotAdmin) {
          return m.reply('*❌ Il bot deve essere admin per rimuovere utenti!*')
        }

        await m.react('⏳')
        
        const startMsg = `*⏳ Rimozione ${kickableUsers.length} numeri in corso...*\n\n*Prefisso:* +${prefix}\n*Target:* ${kickableUsers.length} utenti\n*Protetti:* ${allWithPrefix.length - kickableUsers.length} admin/owner`
        await m.reply(startMsg)

        const kicked = []
        const failed = []
        
        for (let i = 0; i < kickableUsers.length; i++) {
          const user = kickableUsers[i]
          
          try {
            await conn.groupParticipantsUpdate(m.chat, [user], 'remove')
            kicked.push(user)
            
          } catch (e) {
            failed.push(user)
            console.error(`Errore rimozione ${user}:`, e)
          }
          
          // Delay tra rimozioni
          if (i < kickableUsers.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000))
          }
        }

        // Report finale
        let report = `*✅ OPERAZIONE COMPLETATA*\n`
        report += `━━━━━━━━━━━━━━━━\n\n`
        
        if (kicked.length > 0) {
          report += `*🚫 Utenti rimossi (${kicked.length}):*\n`
          report += kicked.map(v => '⭔ @' + v.replace(/@.+/, '')).join('\n')
          report += '\n\n'
        }
        
        if (failed.length > 0) {
          report += `*⚠️ Rimozioni fallite (${failed.length}):*\n`
          report += failed.map(v => '⭔ @' + v.replace(/@.+/, '')).join('\n')
          report += '\n\n'
        }
        
        const protectedCount = allWithPrefix.length - kickableUsers.length
        if (protectedCount > 0) {
          report += `*🔒 Admin/Owner protetti (${protectedCount}):*\n`
          const protectedUsers = allWithPrefix.filter(p => !kickableUsers.includes(p.id))
          report += protectedUsers.map(p => {
            const isAdmin = adminJids.includes(p.id)
            const isGlobalOwner = globalOwners.includes(p.id)
            const status = isGlobalOwner ? '👑' : isAdmin ? '⚡' : '🛡️'
            return `⭔ @${p.id.replace(/@.+/, '')} ${status}`
          }).join('\n')
          report += '\n\n'
        }
        
        report += `*📊 Risultati:*\n`
        report += `└─⭓ Rimossi: ${kicked.length}\n`
        report += `└─⭓ Falliti: ${failed.length}\n`
        report += `└─⭓ Protetti: ${protectedCount}\n`
        report += `└─⭓ Totale +${prefix}: ${allWithPrefix.length}\n\n`
        report += `> BLD-BOT`

        const allMentions = [...kicked, ...failed, ...allWithPrefix.filter(p => !kickableUsers.includes(p.id)).map(p => p.id)]
        await conn.reply(m.chat, report, m, { mentions: allMentions })
        await m.react(kicked.length > 0 ? '✅' : '❌')
        break
      }
    }
    
  } catch (e) {
    console.error('Errore handler:', e)
    await m.react('❌')
    return m.reply(`${global.errore}`)
  }
}

handler.help = ['listanum <prefisso>', 'kicknum <prefisso>']
handler.tags = ['gruppo']
handler.command = /^(listanum|listnum|kicknum)$/i
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler