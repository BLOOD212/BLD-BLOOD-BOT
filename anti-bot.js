let puliti = [];

function rilevaDispositivoCheck(msgID = '') {
  if (!msgID) return 'sconosciuto';
  if (/^[a-zA-Z]+-[a-fA-F0-9]+$/.test(msgID)) return 'bot';
  if (msgID.startsWith('false_') || msgID.startsWith('true_')) return 'web';
  if (msgID.startsWith('3EB0') && /^[A-Z0-9]+$/.test(msgID)) return 'webbot';
  if (msgID.includes(':')) return 'desktop';
  if (/^[A-F0-9]{32}$/i.test(msgID)) return 'android';
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(msgID)) return 'ios';
  if (/^[A-Z0-9]{20,25}$/i.test(msgID) && !msgID.startsWith('3EB0')) return 'ios';
  if (msgID.startsWith('3EB0')) return 'android_old';
  return 'sconosciuto';
}

export async function before(m, { conn, isAdmin, isOwner, isSam }) {
  const chat = global.db.data.chats[m.chat];
  
  // Controllo attivazione Antibot
  if (!chat?.antiBot) return;
  if (!m.isGroup || !m.sender || !m.key?.id) return;
  
  // Gli admin, Blood e il bot stesso sono immuni
  if (isAdmin || isOwner || isSam || m.fromMe) return;

  const msgID = m.key?.id;
  const device = rilevaDispositivoCheck(msgID);
  const sospettiDispositivi = ['bot', 'web', 'webbot'];

  // Se il dispositivo non è tra quelli sospetti, esce
  if (!sospettiDispositivi.includes(device)) return;

  const metadata = await conn.groupMetadata(m.chat);
  const botNumber = conn.user.jid;
  const autorizzati = [botNumber, metadata.owner, ...puliti];

  // Se l'utente è in whitelist o è il fondatore, esce
  if (autorizzati.includes(m.sender)) return;

  // Esecuzione sanzione
  await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove');

  // Messaggio estetico BLD-BLOOD
  const text = `
⋆｡˚『 ╭ \`SISTEMA ANTIBOT\` ╯ 』˚｡⋆
╭
┃ 🛡️ \`Stato:\` *Protocollo Blood Attivo*
┃
┃ 『 👤 』 \`Target:\` @${m.sender.split('@')[0]}
┃ 『 🤖 』 \`Dispositivo:\` *${device.toUpperCase()}*
┃ 『 🚫 』 \`Azione:\` *Eliminazione immediata*
┃
┃ ⚠️ \`Nota:\` Bot o connessioni web non autorizzate.
╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒`

  await conn.sendMessage(m.chat, {
    text,
    mentions: [m.sender],
    contextInfo: {
      externalAdReply: {
        title: 'BLD-BLOOD SECURITY',
        body: 'Rilevamento connessione non sicura',
        thumbnailUrl: 'https://qu.ax/TfUj.jpg', // Usa la tua immagine se ne hai una specifica
        mediaType: 1,
        renderLargerThumbnail: true
      }
    }
  });
}
