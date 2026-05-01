const handler = async (m, { conn, text, usedPrefix, command }) => {
  let who;
  if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false;
  else who = m.chat;

  if (!who) return m.reply(`*⚠️ Tagga qualcuno o rispondi a un messaggio.*`);

  const match = text.match(/(\d+)\s*([smhd])/i);
  if (!match) return m.reply(`*⚠️ Formato errato!*\n\nEsempio:\n${usedPrefix + command} @tag 10m\n\n*(s = secondi, m = minuti, h = ore, d = giorni)*`);

  const duration = parseInt(match[1]);
  const unit = match[2].toLowerCase();

  let timer;
  if (unit === 's') timer = duration * 1000;
  else if (unit === 'm') timer = duration * 60 * 1000;
  else if (unit === 'h') timer = duration * 60 * 60 * 1000;
  else if (unit === 'd') timer = duration * 24 * 60 * 60 * 1000;

  const user = global.db.data.users[who];
  if (!user) return m.reply(`*❌ Errore:* Utente non presente nel database.`);

  try {
    await conn.groupParticipantsUpdate(m.chat, [who], 'promote');
    
    const timeStr = await formatTime(timer);
    const name = '@' + who.split`@`[0];
    
    const confirmMsg = `*⚡ ADMIN TEMPORANEO*\n\n*👤 Utente:* ${name}\n*⏳ Durata:* ${duration}${unit}\n*📉 Scade tra:* ${timeStr}`;
    
    m.reply(confirmMsg, null, { mentions: [who] });

    setTimeout(async () => {
      const groupMetadata = await conn.groupMetadata(m.chat);
      const isStillAdmin = groupMetadata.participants.find(p => p.id === who && p.admin);

      if (isStillAdmin) {
        await conn.groupParticipantsUpdate(m.chat, [who], 'demote');
        conn.reply(m.chat, `*⏰ Tempo scaduto!*\nL'utente ${name} non è più admin.`, null, { mentions: [who] });
      }
    }, timer);

  } catch (e) {
    m.reply('*❌ Errore:* Assicurati che il bot sia admin.');
  }
};

handler.help = ['tempadm @user <tempo>'];
handler.tags = ['group'];
handler.command = ['tempadm', 'tempadmin'];
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;

async function formatTime(ms) {
  let seconds = Math.floor(ms / 1000);
  let minutes = Math.floor(seconds / 60);
  let hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  seconds %= 60;
  minutes %= 60;
  hours %= 24;
  let timeString = '';
  if (days) timeString += `${days}g `;
  if (hours) timeString += `${hours}h `;
  if (minutes) timeString += `${minutes}m `;
  if (seconds) timeString += `${seconds}s`;
  return timeString.trim();
}
