const handler = m => m;

handler.before = async function (m, { conn, participants, isBotAdmin }) {
  if (!m.isGroup) return;
  if (!isBotAdmin) return;

  const chat = global.db.data.chats[m.chat];
  if (!chat?.antinuke) return;

  // Monitora: Cambio nome (21), Rimozione (28), Promozione (29), Retrocessione (30)
  if (![21, 28, 29, 30].includes(m.messageStubType)) return;

  const sender = m.key?.participant || m.participant || m.sender;
  if (!sender) return;

  const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';
  
  // --- PROTEZIONE OWNER DEL BOT ---
  // Prende la lista degli owner dal global.owner e la formatta correttamente
  const BOT_OWNERS = global.owner
    .filter(o => o[0])
    .map(o => o[0].replace(/[^0-9]/g, '') + '@s.whatsapp.net');

  const localWhitelist = chat.whitelist || [];
  
  let ownerGroup = null;
  try {
    const metadata = await conn.groupMetadata(m.chat);
    ownerGroup = metadata.owner || metadata.subjectOwner;
  } catch {
    ownerGroup = null;
  }

  // LISTA AUTORIZZATI (Bot, Proprietari del Bot, Whitelist, Creatore Gruppo)
  const allowed = [
    botJid,
    ...BOT_OWNERS,
    ...localWhitelist, 
    ownerGroup
  ].filter(Boolean);

  // Se l'azione è compiuta da un OWNER del bot o autorizzato, l'antinuke si ferma
  if (allowed.includes(sender)) return;

  if (m.messageStubType === 28) {
    const affected = m.messageStubParameters?.[0];
    if (affected === sender) return;
  }

  const senderData = participants.find(p => p.jid === sender);
  if (!senderData?.admin) return;

  // FILTRO: Rimuove admin a tutti tranne che agli OWNER del bot e autorizzati
  const usersToDemote = participants
    .filter(p => p.admin)
    .map(p => p.jid)
    .filter(jid => jid && !allowed.includes(jid));

  if (!usersToDemote.length && m.messageStubType !== 21) return;

  if (usersToDemote.length) {
    await conn.groupParticipantsUpdate(m.chat, usersToDemote, 'demote');
  }

  // Chiude il gruppo
  await conn.groupSettingUpdate(m.chat, 'announcement');

  const action =
    m.messageStubType === 21 ? 'cambio nome' :
    m.messageStubType === 28 ? 'rimozione membro' :
    m.messageStubType === 29 ? 'promozione admin' :
    'retrocessione admin';

  const text = `
  ⋆｡˚『 ╭ \`ANTINUKE ATTIVO\` ╯ 』˚｡⋆
╭
┃ 🚨 \`Stato:\` *Blood ha messo il preservativo*
┃
┃ 『 👤 』 \`Autore:\` @${sender.split('@')[0]}
┃ 『 🚫 』 \`Azione:\` *${action}* NON autorizzata
┃
┃ 🔻 \`Sanzioni Applicate:\`
┃ ➤ *Admin rimossi* (Owner Bot protetti)
┃ ➤ *Gruppo chiuso in sola lettura*
┃
┃ 👑 \`Proprietari avvisati.\`
╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒`

  await conn.sendMessage(m.chat, {
    text,
    contextInfo: {
      mentionedJid: [sender, ...usersToDemote, ...BOT_OWNERS].filter(Boolean),
      externalAdReply: {
        title: 'SISTEMA DI SICUREZZA OWNER',
        body: 'Protezione Proprietari Attiva',
        thumbnailUrl: 'https://qu.ax/TfUj.jpg',
        sourceUrl: 'BLOODANTINUKE',
        mediaType: 1,
        renderLargerThumbnail: true
      }
    },
  });
};

export default handler;
