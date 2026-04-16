// c'è qualche errore da qualche parte, se lo trovi fammi sapere
export async function before(m, { conn, groupMetadata }) {
  if (!m.messageStubType && !m.message?.protocolMessage?.type) return;
  if (!m.isGroup) return;

  let sender = m.sender;
  if (sender && typeof sender === 'string' && sender.endsWith('@lid')) {
      const lidNumber = sender.split('@')[0].replace(/:\d+$/, '');
      const participant = groupMetadata.participants.find(p => p.id && (p.id.split('@')[0] === lidNumber));
      if (participant) sender = participant.id;
  }
  
  let param0 = m.messageStubParameters?.[0];
  if (param0 && typeof param0 === 'string' && param0.endsWith('@lid')) {
      const lidNumber = param0.split('@')[0].replace(/:\d+$/, '');
      const participant = groupMetadata.participants.find(p => p.id && (p.id.split('@')[0] === lidNumber));
      if (participant) param0 = participant.id;
  }

  let decodedSender = sender ? conn.decodeJid(sender) : null;
  let decodedParam0 = (param0 && typeof param0 === 'string') ? conn.decodeJid(param0) : null;

  let senderNumber = decodedSender ? parseInt(decodedSender) : '?';
  let param0Number = decodedParam0 ? parseInt(decodedParam0) : 'sconosciuto';

  const utente = formatPhoneNumber(senderNumber, true);
  const formattedParam0 = formatPhoneNumber(param0Number, true);

  const type = m.messageStubType;
  let ppBuffer;
  const vareb0t = 'https://i.ibb.co/hJW7WwxV/varebot.jpg';

  try {
    const ppUrl = await conn.profilePictureUrl(m.chat, 'image');
    ppBuffer = (await conn.getFile(ppUrl)).data;
  } catch {
    try {
      ppBuffer = (await conn.getFile(vareb0t)).data;
    } catch {
      ppBuffer = Buffer.alloc(0);
    }
  }
  const nomegp = groupMetadata.subject || 'vare ✧ bot';
  const am = {
    21: 'NOME GRUPPO MODIFICATO',
    22: 'IMMAGINE GRUPPO MODIFICATA',
    23: 'LINK GRUPPO REIMPOSTATO',
    25: 'PERMESSI GRUPPO MODIFICATI',
    26: 'STATO GRUPPO MODIFICATO',
    29: 'NUOVO ADMIN PROMOSSO',
    30: 'ADMIN RETROCESSO'
  };

  const varebot = {
    21: `ㅤㅤ⋆｡˚『 ╭ \`NOME GRUPPO\` ╯ 』˚｡⋆\n╭  \n│ 『 👤 』 \`Da:\` *${utente}*\n│ 『 🏷️ 』 \`Nuovo nome:\` *${nomegp || 'sconosciuto'}*\n*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`,
    22: `ㅤㅤ⋆｡˚『 ╭ \`IMMAGINE GRUPPO\` ╯ 』˚｡⋆\n╭  \n│ 『 👤 』 \`Da:\` *${utente}*\n*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`,
    23: `ㅤㅤ⋆｡˚『 ╭ \`LINK REIMPOSTATO\` ╯ 』˚｡⋆\n╭  \n│ 『 👤 』 \`Da:\` *${utente}*\n│ 『 📎 』 \`Stato:\` *Il link del gruppo aggiornato*\n*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`,
    25: `ㅤㅤ⋆｡˚『 ╭ \`MODIFICA PERMESSI\` ╯ 』˚｡⋆\n╭  \n│ 『 👤 』 \`Da:\` *${utente}*\n│ 『 ✏️ 』 \`Permessi:\` *${m.messageStubParameters[0] === 'on' ? 'solo gli admin' : 'tutti'} possono modificare le impostazioni*\n*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`,
    26: `ㅤㅤ⋆｡˚『 ╭ \`STATO GRUPPO\` ╯ 』˚｡⋆\n╭  \n│ 『 👤 』 \`Da:\` *${utente}*\n│ 『 📌 』 \`Stato gruppo:\` *${m.messageStubParameters[0] === 'on' ? 'chiuso' : 'aperto'}*\n│ 『 💬 』 \`Messaggi:\` *${m.messageStubParameters[0] === 'on' ? 'solo admin' : 'tutti'}*\n*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`,
    29: `ㅤㅤ⋆｡˚『 ╭ \`NUOVO ADMIN\` ╯ 』˚｡⋆\n╭  \n│ 『 👤 』 \`A:\` *${formattedParam0}*\n│ 『 🛠️ 』 \`Da:\` *${utente}*\n*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`,
    30: `ㅤㅤ⋆｡˚『 ╭ \`ADMIN RETROCESSO\` ╯ 』˚｡⋆\n╭  \n│ 『 👤 』 \`A:\` *${formattedParam0}*\n│ 『 🛠️ 』 \`Da:\` *${utente}*\n*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`
  };

  if (global.db.data.chats[m.chat].rileva && varebot[type]) {
    const azione = am[type] || 'EVENTO GRUPPO';
    const contextInfo = {
      ...(global.fake?.contextInfo || {}),
      externalAdReply: {
        ...(global.fake?.contextInfo?.externalAdReply || {}),
        title: nomegp,
        body: azione,
        thumbnail: ppBuffer,
        mediaType: 1,
        renderLargerThumbnail: false,
        sourceUrl: null
      },
      mentionedJid: []
    };

    const mentions = [];
    if (decodedSender && decodedSender !== 's.whatsapp.net') mentions.push(decodedSender);
    if (decodedParam0 && decodedParam0 !== 's.whatsapp.net') mentions.push(decodedParam0);
    contextInfo.mentionedJid = mentions;

    await conn.sendMessage(m.chat, {
      text: varebot[type],
      contextInfo
    });
  }
}

function formatPhoneNumber(number, includeAt = false) {
  if (!number || number === '?' || number === 'sconosciuto') return includeAt ? '@Sconosciuto' : 'Sconosciuto';
  return includeAt ? '@' + number : number;
}