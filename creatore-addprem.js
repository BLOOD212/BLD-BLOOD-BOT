const handler = async (m, {conn, text, usedPrefix, command}) => {
  let who;
  if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false;
  else who = m.chat;
  const textpremERROR = `令 Inserisci il tag dell'utente che vuoi aggiungere come utente premium.`;
  if (!who) return m.reply(textpremERROR, null, {mentions: conn.parseMention(textpremERROR)});

  const user = global.db.data.users[who];
  const txt = text.replace('@' + who.split`@`[0], '').trim();
  const name = await '@' + who.split`@`[0];

  const ERROR = `令 Questo utente non è presente nel mio database!`;
  if (!user) return m.reply(ERROR, null, {mentions: conn.parseMention(ERROR)});

  const secondi10 = 10 * 1000; // 10 secondi in millisecondi
  const ora1 = 60 * 60 * 1000 * txt; // 1 ora
  const giorno1 = 24 * ora1 * txt; // 1 giorno
  const settimana1 = 7 * giorno1 * txt; // 1 settimana
  const mese1 = 30 * giorno1 * txt; // 1 mese
  const now = Date.now();

  if (command == 'addprem' || command == 'userpremium') {
    if (now < user.premiumTime) user.premiumTime += ora1;
    else user.premiumTime = now + ora1;
    user.premium = true;
    const timeLeft = (user.premiumTime - now) / 1000; // tempo rimanente in secondi
    const textprem1 = `*🎟️ Nuovo Utente Premium!!!*\n\n*✨ Utente: ${name}*\n*🕐 Tempo: ${txt} ora/e*\n*📉 Rimanente: ${timeLeft} secondi*`;
    m.reply(textprem1, null, {mentions: conn.parseMention(textprem1)});
  }

  if (command == 'addprem2' || command == 'userpremium2') {
    if (now < user.premiumTime) user.premiumTime += giorno1;
    else user.premiumTime = now + giorno1;
    user.premium = true;
    const timeLeft = (user.premiumTime - now) / 1000 / 60 / 60; // tempo rimanente in ore
    const textprem2 = `*🎟️ Nuovo Utente Premium!!!*\n\n*✨ Utente: ${name}*\n*🕐 Tempo: ${txt} giorno/i*\n*📉 Rimanente: ${timeLeft} ore*`;
    m.reply(textprem2, null, {mentions: conn.parseMention(textprem2)});
  }

  if (command == 'addprem3' || command == 'userpremium3') {
    if (now < user.premiumTime) user.premiumTime += settimana1;
    else user.premiumTime = now + settimana1;
    user.premium = true;
    formatTime(user.premiumTime - now).then((timeleft) => {
      const textprem3 = `*🎟️ Nuovo Utente Premium!!!*\n\n*✨ Utente: ${name}*\n*🕐 Tempo: ${txt} settimana/e*\n*📉 Rimanente: ${timeleft}*`;
      m.reply(textprem3, null, {mentions: conn.parseMention(textprem3)});
    });
  }

  if (command == 'addprem4' || command == 'userpremium4') {
    if (now < user.premiumTime) user.premiumTime += mese1;
    else user.premiumTime = now + mese1;
    user.premium = true;
    formatTime(user.premiumTime - now).then((timeleft) => {
      const textprem4 = `*🎟️ Nuovo Utente Premium!!!*\n\n*✨ Utente: ${name}*\n*🕐 Tempo: ${txt} mese/i*\n*📉 Rimanente: ${timeleft}*`;
      m.reply(textprem4, null, {mentions: conn.parseMention(textprem4)});
    });
  }
};
handler.help = ['addprem [@user] <giorni>'];
handler.tags = ['creatore'];
handler.command = ['addprem', 'userpremium', 'addprem2', 'userpremium2', 'addprem3', 'userpremium3', 'addprem4', 'userpremium4'];
handler.group = true;
handler.prems = true;
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
  if (days) {
    timeString += `${days} giorno${days > 1 ? 'i' : ''} `;
  }
  if (hours) {
    timeString += `${hours} ora${hours > 1 ? 'e' : ''} `;
  }
  if (minutes) {
    timeString += `${minutes} minuto${minutes > 1 ? 'i' : ''} `;
  }
  if (seconds) {
    timeString += `${seconds} secondo${seconds > 1 ? 'i' : ''} `;
  }
  return timeString.trim();
}
