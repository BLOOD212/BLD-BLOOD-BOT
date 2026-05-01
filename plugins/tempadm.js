const handler = async (m, { conn, text, usedPrefix, command }) => {
  let who;
  if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false;
  else who = m.chat;

  if (!who) return m.reply(`*⚠️ Tagga un utente o rispondi a un suo messaggio.*`);

  const match = text.match(/(\d+)\s*([smhd])/i);
  if (!match) return m.reply(`*⚠️ Formato errato!*\n\nEsempio: ${usedPrefix + command} @tag 1m`);

  const duration = parseInt(match[1]);
  const unit = match[2].toLowerCase();

  let timer;
  if (unit === 's') timer = duration * 1000;
  else if (unit === 'm') timer = duration * 60 * 1000;
  else if (unit === 'h') timer = duration * 60 * 60 * 1000;
  else if (unit === 'd') timer = duration * 24 * 60 * 60 * 1000;

  const timeStr = await formatTime(timer);
  const name = '@' + who.split`@`[0];

  try {
    
    await conn.groupParticipantsUpdate(m.chat, [who], 'promote');
    
    await m.reply(`*⚡ ADMIN TEMPORANEO*\n\n*👤 Utente:* ${name}\n*⏳ Durata:* ${duration}${unit}\n*📉 Scadenza tra:* ${timeStr}\n\n_Il bot lo rimuoverà automaticamente._`, null, { mentions: [who] });

    // 2. Timer di rimozione
    setTimeout(async () => {
      try {
        
        const groupMetadata = await conn.groupMetadata(m.chat);
        const exists = groupMetadata.participants.find(p => p.id === who);

        if (exists) {
          
          await conn.groupParticipantsUpdate(m.chat, [who], 'demote');
          
          // Messaggio di avviso scadenza
          await conn.reply(m.chat, `*⏰ TEMPO SCADUTO*\n\nL'utente ${name} non è più Admin.\nIl suo periodo di prova è terminato.`, null, { mentions: [who] });
        }
      } catch (err) {
        console.error("Errore durante la demozione automatica:", err);
      }
    }, timer);

  } catch (e) {
    m.reply('*❌ Errore:* Non sono riuscito a promuovere l\'utente. Controlla che io sia Admin.');
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
