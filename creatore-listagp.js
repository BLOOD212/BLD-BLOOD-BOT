const handler = async (m, { conn }) => {
  let txt = '';
  try {    
    const groups = Object.entries(conn.chats).filter(([jid, chat]) => jid.endsWith('@g.us') && chat.isChats);
    const totalGroups = groups.length;
    for (let i = 0; i < groups.length; i++) {
      const [jid, chat] = groups[i];
      const groupMetadata = ((conn.chats[jid] || {}).metadata || (await conn.groupMetadata(jid).catch((_) => null))) || {};
      const participants = groupMetadata.participants || [];
      const bot = participants.find((u) => conn.decodeJid(u.id) === conn.user.jid) || {};
      const isBotAdmin = bot?.admin || false;
      const isParticipant = participants.some((u) => conn.decodeJid(u.id) === conn.user.jid);
      const participantStatus = isParticipant ? '👤 Partecipante' : '❌ Ex partecipante';
      const totalParticipants = participants.length;
      txt += `*◉ Gruppo ${i + 1}*
      *➤ Nome:* ${await conn.getName(jid)}
      *➤ ID:* ${jid}
      *➤ Admin:* ${isBotAdmin ? '✔ Sì' : '❌ No'}
      *➤ Stato:* ${participantStatus}
      *➤ Totale Partecipanti:* ${totalParticipants}
      *➤ Link:* ${isBotAdmin ? `https://chat.whatsapp.com/${await conn.groupInviteCode(jid) || '--- (Errore) ---'}` : '--- (Non admin) ---'}\n\n`;
    }
    m.reply(`*Lista dei gruppi del Bot* 🤖\n\n*—◉ Totale gruppi:* ${totalGroups}\n\n${txt}`.trim());
  } catch {
    const groups = Object.entries(conn.chats).filter(([jid, chat]) => jid.endsWith('@g.us') && chat.isChats);
    const totalGroups = groups.length;
    for (let i = 0; i < groups.length; i++) {
      const [jid, chat] = groups[i];
      const groupMetadata = ((conn.chats[jid] || {}).metadata || (await conn.groupMetadata(jid).catch((_) => null))) || {};
      const participants = groupMetadata.participants || [];
      const bot = participants.find((u) => conn.decodeJid(u.id) === conn.user.jid) || {};
      const isBotAdmin = bot?.admin || false;
      const isParticipant = participants.some((u) => conn.decodeJid(u.id) === conn.user.jid);
      const participantStatus = isParticipant ? '👤 Partecipante' : '❌ Ex partecipante';
      const totalParticipants = participants.length;    
      txt += `*◉ Gruppo ${i + 1}*
      *➤ Nome:* ${await conn.getName(jid)}
      *➤ ID:* ${jid}
      *➤ Admin:* ${isBotAdmin ? '✔ Sì' : '❌ No'}
      *➤ Stato:* ${participantStatus}
      *➤ Totale Partecipanti:* ${totalParticipants}
      *➤ Link:* ${isBotAdmin ? '--- (Errore) ---' : '--- (Non admin) ---'}\n\n`;
    }
    m.reply(`*Lista dei gruppi del Bot* 🤖\n\n*—◉ Totale gruppi:* ${totalGroups}\n\n${txt}`.trim());
  }    
};
handler.help = ['groups', 'grouplist'];
handler.tags = ['creatore'];
handler.command = /^(groups|grouplist|listadegruppo|gruppilista|listagruppi|listgroup)$/i;
handler.rowner = true;
handler.private = true;
export default handler;