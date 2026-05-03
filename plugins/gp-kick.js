const handler = async (m, { conn, text, usedPrefix, command }) => {
  let who;
  if (m.isGroup) {
    who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : false;
  } else {
    who = text ? text.replace(/[^0-9]/g, '') + '@s.whatsapp.net' : m.quoted ? m.quoted.sender : false;
  }

  if (!who) return m.reply(`⚠️ Chi devo espellere?\n\nEsempio:\n${usedPrefix + command} @utente`);

  const chats = Object.entries(conn.chats)
    .filter(([jid, chat]) => jid.endsWith('@g.us') && chat.isChats);

  if (!chats.length) return m.reply('⚠️ Il bot non è presente in nessun gruppo.');

  m.reply(`🚀 Analisi in corso su ${chats.length} gruppi per @${who.split('@')[0]}...`, null, { mentions: [who] });

  let successCount = 0;
  let failCount = 0;

  for (let [jid] of chats) {
    try {
      // Usiamo conn.groupMetadata con cautela
      const metadata = await conn.groupMetadata(jid).catch(() => null);
      
      // Se il metadata è null, saltiamo il gruppo
      if (!metadata) continue;

      const participants = metadata.participants || [];
      const isParticipant = participants.some(p => p.id === who);
      
      const bot = participants.find(p => p.id === conn.user.jid);
      const isBotAdmin = bot?.admin || bot?.isSAdmin || false;

      if (isParticipant) {
        if (isBotAdmin) {
          await conn.groupParticipantsUpdate(jid, [who], 'remove');
          successCount++;
          await new Promise(res => setTimeout(res, 1000)); // Delay per evitare ban
        } else {
          failCount++;
        }
      }
    } catch (e) {
      console.log(`Errore nel gruppo ${jid}:`, e.message);
    }
  }

  m.reply(`✅ Operazione completata.\n\n🏆 Espulso da: ${successCount} gruppi.\n❌ Fallito (non admin): ${failCount} gruppi.`);
};

handler.help = ['kickgp <@tag/risposta>'];
handler.tags = ['owner'];
handler.command = ['kickgp'];
handler.owner = true;

export default handler;
