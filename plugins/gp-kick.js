const handler = async (m, { conn, text, usedPrefix, command }) => {
  // Identifica l'utente da espellere (tramite tag, risposta o numero scritto)
  let who;
  if (m.isGroup) {
    who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : false;
  } else {
    who = text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : m.quoted ? m.quoted.sender : false;
  }

  if (!who) return m.reply(`⚠️ Chi devo espellere?\n\nEsempio:\n${usedPrefix + command} @utente\nO rispondi a un suo messaggio.`);

  // Filtra tutti i gruppi attivi in cui si trova il bot
  const chats = Object.entries(conn.chats)
    .filter(([jid, chat]) => jid.endsWith('@g.us') && chat.isChats);

  if (!chats.length)
    return m.reply('⚠️ Il bot non è presente in nessun gruppo.');

  m.reply(`🚀 Tentativo di espulsione globale per @${who.split('@')[0]} in ${chats.length} gruppi...`, null, { mentions: [who] });

  let successCount = 0;
  let failCount = 0;

  for (let [jid] of chats) {
    try {
      // Ottiene i metadati per verificare se il bot è admin e se l'utente è nel gruppo
      const metadata = await conn.groupMetadata(jid);
      const isParticipant = metadata.participants.some(p => p.id === who);
      
      // Controlla se il bot è admin (necessario per kickare)
      const bot = metadata.participants.find(p => p.id === conn.user.jid);
      const isBotAdmin = bot?.admin || bot?.isSAdmin || false;

      if (isParticipant && isBotAdmin) {
        await conn.groupParticipantsUpdate(jid, [who], 'remove');
        successCount++;
        // Delay anti-ban
        await new Promise(res => setTimeout(res, 1000));
      } else if (isParticipant && !isBotAdmin) {
        failCount++; // L'utente c'è ma il bot non ha i permessi
      }
    } catch (e) {
      console.error(`Errore nel gruppo ${jid}:`, e);
    }
  }

  m.reply(`✅ Operazione completata.\n\n🏆 Espulso da: ${successCount} gruppi.\n❌ Fallito in: ${failCount} gruppi (Bot non admin).`);
};

handler.help = ['kickgp <@tag/risposta>'];
handler.tags = ['owner'];
handler.command = ['kickgp'];
handler.owner = true; // Solo l'owner può eseguire un'azione così drastica

export default handler;
