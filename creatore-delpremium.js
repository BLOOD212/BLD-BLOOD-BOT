
const handler = async (m, {conn, text, usedPrefix, command}) => {
  let who;
  if (m.isGroup) who = m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : false;
  else who = m.chat;
  const user = global.db.data.users[who];
  if (!who) throw `🏓 Inserisci un @tag per rimuovere il premium a quell'utente`;
  if (!user) throw `*☘️ Questo utente non è presente nel mio database*`;
  if (user.premiumTime === 0) throw '*🥷 Questo utente non è un utente premium 👑*';
  const txt = text.replace('@' + who.split`@`[0], '').trim();

  user.premiumTime = 0;

  user.premium = false;

  const textdelprem = `*@${who.split`@`[0]} non è più un utente premium 👑*`;
  m.reply(textdelprem, null, {mentions: conn.parseMention(textdelprem)});
};
handler.help = ['delprem <@user>'];
handler.tags = ['creatore'];
handler.command = /^(remove|-|del)premium$/i;
handler.group = true;
handler.prems = true;
export default handler;
