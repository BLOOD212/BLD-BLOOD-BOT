let handler = async (m, { conn, text }) => {
  try {
    let who;

    if (text && /^\d{7,15}$/.test(text)) {
      who = text.replace(/\D/g, '') + '@s.whatsapp.net';
    } else if (m.quoted) {
      who = m.quoted.sender;
    } else if (m.mentionedJid && m.mentionedJid.length > 0) {
      who = m.mentionedJid[0];
    } else {
      who = m.fromMe ? conn.user.jid : m.sender;
    }

    let name = await conn.getName(who);

    let pp;
    try {
      pp = await conn.profilePictureUrl(who, 'image');
    } catch {
      pp = null;
    }

    if (!pp) {
      await conn.reply(m.chat, `『 🚫 』 *${name} non ha una foto profilo.*`, m, fake);
      return;
    }

    await conn.sendFile(m.chat, pp, 'profile.jpg', `『 🖼️ 』 *Foto profilo di ${name}*`, m);

  } catch (err) {
    console.error('Errore nel comando .pfp:', err);
    await conn.reply(m.chat, `${global.errore}`, m);
  }
};

handler.help = ['pfp [@tag|reply|numero]'];
handler.tags = ['gruppo'];
handler.command = ['pfp', 'fotoprofilo', 'pic'];
handler.admin = true;

export default handler;