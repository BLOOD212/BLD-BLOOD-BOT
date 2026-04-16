const handler = async (m, { conn, text }) => {
  if (!text)
    return m.reply('⚠️ Inserisci un messaggio.\n\nEsempio:\n.tuttigp Ciao a tutti!');

  // Prende tutte le chat
  const chats = Object.entries(conn.chats)
    .filter(([jid, chat]) => jid.endsWith('@g.us') && chat.isChats);

  if (!chats.length)
    return m.reply('⚠️ Il bot non è presente in nessun gruppo.');

  m.reply(`📢 Invio messaggio in ${chats.length} gruppi...`);

  for (let [jid] of chats) {
    try {
      // Ottiene tutti i partecipanti del gruppo
      const metadata = await conn.groupMetadata(jid);
      const participants = metadata.participants.map(p => p.id);

      await conn.sendMessage(
        jid,
        {
          text: text,
          mentions: participants // 👈 tag invisibile
        }
      );

      // piccolo delay anti-ban
      await new Promise(res => setTimeout(res, 1500));

    } catch (e) {
      console.log(`Errore nel gruppo ${jid}`, e);
    }
  }

  m.reply('✅ Messaggio inviato in tutti i gruppi.');
};

handler.help = ['tuttigp <messaggio>'];
handler.tags = ['owner'];
handler.command = ['tuttigp'];
handler.owner = true;

export default handler;