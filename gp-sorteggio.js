let activeGiveaways = new Map(); // Store per giveaway attivi
let eventParticipants = new Map(); // Store per partecipanti agli eventi

let handler = async (m, { conn, text, groupMetadata, command }) => {
  const jid = m.chat;

  if (command === 'sorteggio') {
    if (!text) {
      return conn.sendMessage(jid, { text:
        `🎁 *SORT*\n\n` +
        `Uso: .sorteggio vincitori | tempo_minuti | premio | luogo\n\n` +
        `Esempio:\n.sorteggio 1 | 60 | iPhone 15 Pro | Online\n` +
        `.sorteggio 3 | 120 | Buoni Amazon | Milano\n\n` +
        `📝 Verrà creato un evento WhatsApp!\n` +
        `🎉 I partecipanti all'evento parteciperanno al sorteggio!`
      }, { quoted: m });
    }

    let [winners = '1', timeMinutes = '60', prize = 'Premio speciale', locationName = 'Online'] = text.split('|').map(s => s.trim());
    
    const winnersCount = parseInt(winners) || 1;
    const duration = parseInt(timeMinutes) || 60;
    
    if (winnersCount < 1 || winnersCount > 10) {
      return conn.sendMessage(jid, { 
        text: "❌ Numero vincitori deve essere tra 1 e 10!" 
      }, { quoted: m });
    }

    if (duration < 1 || duration > 1440) { // Min 1 min, Max 24 ore
      return conn.sendMessage(jid, { 
        text: "❌ Durata deve essere tra 1 e 1440 minuti (24 ore)!" 
      }, { quoted: m });
    }

    // Se c'è già un giveaway attivo
    if (activeGiveaways.has(jid)) {
      return conn.sendMessage(jid, { 
        text: "❌ C'è già un giveaway attivo in questo gruppo!" 
      }, { quoted: m });
    }

    const now = Date.now();
    // CORREZIONE: Evento inizia subito, non dopo 2 minuti
    const startTime = now; // Inizia subito
    const endTime = now + (duration * 60 * 1000); // Fine dopo i minuti specificati
    const endDate = new Date(endTime);

    // Nome e descrizione dell'evento
    const eventName = `🎁 GIVEAWAY: ${prize}`;
    const eventDescription = `🎉 GIVEAWAY ATTIVO!\n\n` +
      `🏆 PREMIO: ${prize}\n` +
      `👥 VINCITORI: ${winnersCount}\n` +
      `⏰ DURATA: ${duration} minuti\n` +
      `📅 SCADENZA: ${endDate.toLocaleString('it-IT')}\n\n` +
      `🎯 COME PARTECIPARE:\n` +
      `Partecipa a questo evento per entrare nel sorteggio!\n\n` +
      `📋 REGOLE:\n` +
      `• Solo membri del gruppo\n` +
      `• Un'iscrizione per persona\n` +
      `• Estrazione automatica alla scadenza\n\n` +
      `🍀 Buona fortuna a tutti!`;

    try {
      // CORREZIONE: Coordinate più realistiche (Milano se non specificato)
      const defaultLat = locationName.toLowerCase() === 'online' ? 0 : 45.4642;
      const defaultLng = locationName.toLowerCase() === 'online' ? 0 : 9.1900;

      // Crea l'evento WhatsApp
      const eventMsg = await conn.sendMessage(
        jid,
        {
          event: {
            isCanceled: false,
            name: eventName,
            description: eventDescription,
            location: {
              degreesLatitude: defaultLat,
              degreesLongitude: defaultLng,
              name: locationName
            },
            startTime: Math.floor(startTime / 1000), // CORREZIONE: WhatsApp usa secondi, non millisecondi
            endTime: Math.floor(endTime / 1000),     // CORREZIONE: WhatsApp usa secondi, non millisecondi
            extraGuestsAllowed: true
          }
        },
        { quoted: m }
      );

      // Messaggio informativo aggiuntivo
      await conn.sendMessage(jid, {
        text: `✅ *GIVEAWAY CREATO CON SUCCESSO!*\n\n` +
             `🎁 *Evento:* ${eventName}\n` +
             `🏆 *Premio:* ${prize}\n` +
             `👥 *Vincitori:* ${winnersCount}\n` +
             `⏰ *Durata:* ${duration} minuti\n` +
             `📍 *Luogo:* ${locationName}\n\n` +
             `🎯 *Per partecipare:*\n` +
             `Iscriviti all'evento WhatsApp sopra!\n\n` +
             `⚡ *Inizio evento:* SUBITO\n` +
             `🏁 *Fine e sorteggio:* ${endDate.toLocaleString('it-IT')}\n\n` +
             `📊 *Partecipanti attuali:* 0 (aggiornamento automatico)`
      }, { quoted: m });

      // Salva i dati del giveaway
      const giveawayData = {
        eventId: eventMsg.key.id,
        eventName,
        prize,
        winnersCount,
        duration,
        startTime,
        endTime,
        locationName,
        createdBy: m.sender,
        createdAt: now,
        isActive: true,
        participants: new Set()
      };

      activeGiveaways.set(jid, giveawayData);
      eventParticipants.set(eventMsg.key.id, new Set());

      // Timer per avvisi intermedi
      if (duration >= 30) {
        // Avviso a metà tempo (solo se durata >= 30 min)
        setTimeout(async () => {
          if (activeGiveaways.has(jid) && activeGiveaways.get(jid).isActive) {
            const remaining = Math.ceil(duration / 2);
            const currentParticipants = eventParticipants.get(eventMsg.key.id)?.size || 0;
            await conn.sendMessage(jid, {
              text: `⏰ *GIVEAWAY A METÀ STRADA*\n\n` +
                   `🏆 Premio: ${prize}\n` +
                   `⏳ Tempo rimanente: ~${remaining} minuti\n` +
                   `👥 Iscritti attuali: ${currentParticipants}\n\n` +
                   `🎯 Iscriviti ancora in tempo all'evento!`
            });
          }
        }, (duration / 2) * 60 * 1000);
      }

      // Avviso finale (5 min prima se durata > 5, altrimenti 1 min prima)
      const finalWarningTime = duration > 5 ? 5 : 1;
      if (duration > finalWarningTime) {
        setTimeout(async () => {
          if (activeGiveaways.has(jid) && activeGiveaways.get(jid).isActive) {
            const currentParticipants = eventParticipants.get(eventMsg.key.id)?.size || 0;
            await conn.sendMessage(jid, {
              text: `🚨 *ULTIMI ${finalWarningTime} MINUTI!*\n\n` +
                   `🎁 ${prize}\n` +
                   `👥 Partecipanti attuali: ${currentParticipants}\n\n` +
                   `⚡ Ultimi minuti per iscriversi!`
            });
          }
        }, (duration - finalWarningTime) * 60 * 1000);
      }

      // Timer principale per terminare il giveaway
      setTimeout(async () => {
        await endGiveaway(conn, jid, giveawayData);
      }, duration * 60 * 1000);

      console.log(`Giveaway/evento creato nel gruppo ${jid}: ${prize} - ${winnersCount} vincitori - ${duration} minuti`);

    } catch (error) {
      console.error('Errore nella creazione del giveaway/evento:', error);
      await conn.sendMessage(jid, { 
        text: "❌ Errore nella creazione del giveaway. Riprova." 
      }, { quoted: m });
    }
  }

  // Comando evento normale (per eventi non-giveaway)
  if (command === 'evento') {
    if (!text) {
      return conn.sendMessage(jid, { text:
        `📅 *COMANDO EVENTO*\n\n` +
        `Uso: .evento nome evento | descrizione evento | nome luogo\n\n` +
        `Esempio:\n.evento Festa | Grande festa con amici | Milano\n\n` +
        `💡 Per creare un giveaway usa: .sorteggio`
      }, { quoted: m });
    }

    let [name = 'Evento senza nome', description = 'Nessuna descrizione', locationName = 'Luogo sconosciuto'] = text.split('|').map(s => s.trim());

    const now = Date.now();
    const startTime = now; // CORREZIONE: Inizia subito invece di +1 ora
    const endTime = now + 3 * 60 * 60 * 1000; // +3 ore

    await conn.sendMessage(
      jid,
      {
        event: {
          isCanceled: false,
          name,
          description,
          location: {
            degreesLatitude: 45.4642,
            degreesLongitude: 9.1900,
            name: locationName
          },
          startTime: Math.floor(startTime / 1000), // CORREZIONE: Secondi invece di millisecondi
          endTime: Math.floor(endTime / 1000),     // CORREZIONE: Secondi invece di millisecondi
          extraGuestsAllowed: true
        }
      },
      { quoted: m }
    );

    await conn.sendMessage(jid, {
      text: `✅ *Evento creato con successo!*\n\n` +
           `📅 *Nome:* ${name}\n` +
           `📝 *Descrizione:* ${description}\n` +
           `📍 *Luogo:* ${locationName}\n\n` +
           `⏰ *Inizio:* SUBITO\n` +
           `🏁 *Fine:* ${new Date(endTime).toLocaleString('it-IT')}`
    }, { quoted: m });
  }
};

// Funzione per gestire le iscrizioni agli eventi (dovrai integrarla nel tuo sistema)
export async function handleEventParticipation(conn, eventId, jid, userId, action) {
  console.log(`Evento partecipazione: ${action} - EventID: ${eventId} - User: ${userId}`);
  
  if (!activeGiveaways.has(jid)) {
    console.log(`Nessun giveaway attivo per il gruppo ${jid}`);
    return;
  }
  
  const giveaway = activeGiveaways.get(jid);
  if (!giveaway.isActive) {
    console.log(`Giveaway non più attivo per ${jid}`);
    return;
  }

  // CORREZIONE: Confronto più flessibile degli ID evento
  if (giveaway.eventId !== eventId) {
    console.log(`EventID non corrisponde: ${giveaway.eventId} vs ${eventId}`);
    return;
  }

  const participants = eventParticipants.get(eventId);
  if (!participants) {
    console.log(`Nessun Set di partecipanti trovato per eventId: ${eventId}`);
    return;
  }

  if (action === 'join') {
    participants.add(userId);
    console.log(`✅ Utente ${userId} si è iscritto al giveaway ${giveaway.prize}`);
  } else if (action === 'leave') {
    participants.delete(userId);
    console.log(`❌ Utente ${userId} ha annullato l'iscrizione al giveaway ${giveaway.prize}`);
  }

  // Aggiorna il contatore ogni 3 iscrizioni invece di 5
  const currentCount = participants.size;
  if (currentCount > 0 && (currentCount % 3 === 0 || currentCount === 1)) {
    await conn.sendMessage(jid, {
      text: `📊 *Update Giveaway*\n\n` +
           `🎁 ${giveaway.prize}\n` +
           `👥 Partecipanti iscritti: *${currentCount}*\n` +
           `⏰ Tempo rimanente: ~${Math.ceil((giveaway.endTime - Date.now()) / (60 * 1000))} min\n\n` +
           `🎯 Continua a invitare amici!`
    });
  }
}

// Funzione per terminare il giveaway ed estrarre i vincitori
async function endGiveaway(conn, jid, giveawayData) {
  if (!activeGiveaways.has(jid) || !giveawayData.isActive) return;

  giveawayData.isActive = false;
  const participants = Array.from(eventParticipants.get(giveawayData.eventId) || []);
  
  if (participants.length === 0) {
    await conn.sendMessage(jid, {
      text: `❌ *GIVEAWAY TERMINATO*\n\n` +
           `🎁 *Evento:* ${giveawayData.eventName}\n` +
           `🏆 *Premio:* ${giveawayData.prize}\n` +
           `😔 *Risultato:* Nessun partecipante!\n\n` +
           `Il giveaway è stato annullato per mancanza di iscrizioni all'evento.`
    });
    
    activeGiveaways.delete(jid);
    eventParticipants.delete(giveawayData.eventId);
    return;
  }

  // Estrai i vincitori
  const winners = [];
  const participantsCopy = [...participants];
  const winnersCount = Math.min(giveawayData.winnersCount, participants.length);

  for (let i = 0; i < winnersCount; i++) {
    const randomIndex = Math.floor(Math.random() * participantsCopy.length);
    const winner = participantsCopy.splice(randomIndex, 1)[0];
    winners.push(winner);
  }

  // Messaggio risultati finale
  let resultMessage = `🎉 *GIVEAWAY COMPLETATO!* 🎉\n\n` +
    `🎁 *Evento:* ${giveawayData.eventName}\n` +
    `🏆 *Premio:* ${giveawayData.prize}\n` +
    `👥 *Iscritti totali:* ${participants.length}\n` +
    `🏅 *Vincitori estratti:* ${winners.length}\n\n`;

  if (winners.length === 1) {
    resultMessage += `🥇 *VINCITORE:*\n@${winners[0].split('@')[0]}\n\n`;
  } else {
    resultMessage += `🏆 *VINCITORI:*\n`;
    winners.forEach((winner, index) => {
      const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🏅';
      resultMessage += `${medal} @${winner.split('@')[0]}\n`;
    });
    resultMessage += '\n';
  }

  resultMessage += `🎊 *Congratulazioni ai vincitori!*\n` +
                  `📬 Verrete contattati privatamente per il ritiro del premio.`;

  await conn.sendMessage(jid, {
    text: resultMessage,
    mentions: winners
  });

  // Messaggio privato ai vincitori (opzionale)
  for (const winner of winners) {
    try {
      await conn.sendMessage(winner, {
        text: `🎉 *CONGRATULAZIONI!* 🎉\n\n` +
             `Hai vinto il giveaway:\n` +
             `🏆 *${giveawayData.prize}*\n\n` +
             `📞 Verrai contattato dall'admin per il ritiro!\n` +
             `🎊 Complimenti ancora!`
      });
    } catch (error) {
      console.log(`Impossibile inviare messaggio privato a ${winner}`);
    }
  }

  // Cleanup
  activeGiveaways.delete(jid);
  eventParticipants.delete(giveawayData.eventId);
}

handler.help = ['sorteggio', 'evento'];
handler.command = ['sorteggio', 'evento'];
handler.tags = ['gruppo'];
handler.group = true;
handler.admin = true;
handler.owner = true;
export default handler;