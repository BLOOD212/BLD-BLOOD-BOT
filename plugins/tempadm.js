const handler = async (m, { conn, text, usedPrefix, command }) => {
  let who;
  if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false;
  else who = m.chat;

  if (!who) return m.reply(`*⚠️ Tagga un utente o rispondi a un messaggio.*`);

  const match = text.match(/(\d+)\s*([smhd])/i);
  if (!match) return m.reply(`*⚠️ Esempio: ${usedPrefix + command} @tag 1m*`);

  const duration = parseInt(match[1]);
  const unit = match[2].toLowerCase();

  let timer;
  if (unit === 's') timer = duration * 1000;
  else if (unit === 'm') timer = duration * 60 * 1000;
  else if (unit === 'h') timer = duration * 60 * 60 * 1000;
  else if (unit === 'd') timer = duration * 24 * 60 * 60 * 1000;

  const name = '@' + who.split`@`[0];
  const timeStr = await formatTime(timer);

  try {
    // Promozione
    await conn.groupParticipantsUpdate(m.chat, [who], 'promote');
    
    await m.reply(`*⚡ ADMIN TEMPORANEO*\n\n*👤 Utente:* ${name}\n*⏳ Durata:* ${duration}${unit}\n*📉 Scadenza tra:* ${timeStr}`, null, { mentions: [who] });

    // Timer di rimozione forzata
    setTimeout(async () => {
      // Recupero info gruppo fresche
      const groupMetadata = await conn.groupMetadata(m.chat).catch(_ => null);
      if (!groupMetadata) return;

      const participant = groupMetadata.participants.find(p => p.id === who);
      
      // Controlla se è admin prima di provare a toglierlo
      if (participant && (participant.admin || participant.ismember)) {
        await conn.groupParticipantsUpdate(m.chat, [who], 'demote')
          .then(async () => {
            await conn.reply(m.chat, `*⏰ TEMPO SCADUTO*\n\nL'utente ${name} è stato rimosso dagli Admin.`, null, { mentions: [who] });
          })
          .catch(err => {
            console.error("Errore rimozione admin:", err);
          });
      }
    }, timer);

  } catch (e) {
    m.reply('*❌ Errore:* Assicurati che il bot sia Admin del gruppo.');
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
  return timeString.trim() || '0s';
}
