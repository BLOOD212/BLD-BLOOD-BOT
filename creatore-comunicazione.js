const handler = async (m, { conn, text, participants }) => {
  if (!text) return m.reply(`*🥀 e che ci scrivo???*`);

  const teks = `*☁️ Comunicazione*\n\n${text}`;
  const groups = Object.entries(await conn.groupFetchAllParticipating())
    .map(([jid, metadata]) => metadata.id);

  const usersTag = participants.map(u => conn.decodeJid(u.id));
  const start = Date.now();
  let groupSent = 0;

  await conn.reply(m.chat, '*📡 Inizio invio a tutti i gruppi...*', m);

  for (let i = 0; i < groups.length; i++) {
    const groupJid = groups[i];
    const delay = i * 2000;

    setTimeout(async () => {
      try {
        await conn.sendMessage(groupJid, {
          text: teks,
          mentions: usersTag,
          ...global.rcanal
        });
        groupSent++;
      } catch (e) {
        console.log(`❌ Errore inviando al gruppo ${groupJid}:`, e);
      }
    }, delay);
  }

  const totalDelay = groups.length * 2000 + 2000;

  setTimeout(async () => {
    const end = Date.now();
    const totalTime = Math.floor((end - start) / 1000);
    const duration = totalTime >= 60 ? `${Math.floor(totalTime / 60)} min ${totalTime % 60} sec` : `${totalTime} sec`;

    const summary = `✅ *Resoconto invio comunicazione*\n\n` +
      `👥 Chat di gruppo: ${groupSent}\n` +
      `⏱ Tempo totale: ${duration}`;

    await conn.sendMessage(m.chat, { text: summary, ...global.rcanal });
    try {
      await conn.sendMessage('393701330693@s.whatsapp.net', { text: summary, ...global.rcanal });
    } catch (e) {
      console.error('❌ Errore durante l\'invio del resoconto al proprietario:', e);
    }
  }, totalDelay);
};

handler.help = ['broadcast', 'bc'].map(v => v + ' <testo>');
handler.tags = ['creatore'];
handler.command = /^(bc|comunicazione)$/i;
handler.owner = true;

export default handler;