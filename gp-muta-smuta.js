import { createCanvas, loadImage } from 'canvas';

// --- LOGICA DI CANCELLAZIONE MESSAGGI ---
export async function before(m, { conn, isAdmin, isBotAdmin }) {
    if (m.isBaileys && m.fromMe) return true;
    if (!m.isGroup) return false;

    const user = global.db.data.users?.[m.sender];
    if (user && user.muto && isBotAdmin && !isAdmin) {
        await conn.sendMessage(m.chat, { delete: m.key });
        return false;
    }
    return true;
}

// --- LOGICA DEL COMANDO ---
const handler = async (m, { conn, command, text, isAdmin, isBotAdmin }) => {
  const BOT_OWNERS = (global.owner || []).map(o => o[0] + '@s.whatsapp.net');
  let mentionedJid = m.mentionedJid?.[0] || m.quoted?.sender;

  if (!mentionedJid && text) {
    let number = text.replace(/[^0-9]/g, '');
    if (number.length >= 8) mentionedJid = number + '@s.whatsapp.net';
  }

  const chatId = m.chat;
  const botNumber = conn.user.jid;

  if (!isAdmin) throw '⚠️ Solo gli amministratori possono usare questo comando.';
  if (!isBotAdmin) throw '⚠️ Il bot deve essere admin per poter cancellare i messaggi.';
  if (!mentionedJid) return m.reply(`💡 *Esempio:* .${command} @tag`);

  let groupOwner = null;
  try {
    const metadata = await conn.groupMetadata(chatId);
    groupOwner = metadata.owner;
  } catch { groupOwner = null }

  if ([groupOwner, botNumber, ...BOT_OWNERS].includes(mentionedJid))
    throw '🛡️ *ERRORE:* Impossibile mutare un superiore (Owner/Bot).';

  if (!global.db.data.users[mentionedJid]) global.db.data.users[mentionedJid] = { muto: false };
  const user = global.db.data.users[mentionedJid];
  const isMute = command === 'muta';
  const tag = '@' + mentionedJid.split('@')[0];

  // Cambio stato
  if (isMute) {
    if (user.muto) throw '🔇 L\'utente è già mutato.';
    user.muto = true;
  } else {
    if (!user.muto) throw '🔊 L\'utente non è mutato.';
    user.muto = false;
  }

  const caption = isMute 
    ? `『 *SISTEMA MODERAZIONE* 』\n\n🛑 *Utente:* ${tag}\n⚖️ *Stato:* Silenziato\n🛡️ *Admin:* @${m.sender.split('@')[0]}\n\n*Nota:* I messaggi di questo utente verranno eliminati automaticamente.`
    : `『 *SISTEMA MODERAZIONE* 』\n\n✅ *Utente:* ${tag}\n⚖️ *Stato:* Riabilitato\n🔔 *Info:* L'utente può tornare a scrivere.`;

  // --- TENTATIVO CANVAS (Fallback se fallisce) ---
  try {
    const canvas = createCanvas(800, 300);
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#121212';
    ctx.fillRect(0, 0, 800, 300);
    ctx.fillStyle = isMute ? '#ff4b5c' : '#4bffb3';
    ctx.fillRect(0, 0, 15, 300);

    let pp;
    try { 
      pp = await conn.profilePictureUrl(mentionedJid, 'image');
    } catch { 
      pp = 'https://i.imgur.com/8K9mXz4.png';
    }
    
    const avatar = await loadImage(pp);
    ctx.save();
    ctx.beginPath();
    ctx.arc(160, 150, 90, 0, Math.PI * 2, true);
    ctx.closePath();
    ctx.clip();
    ctx.drawImage(avatar, 70, 60, 180, 180);
    ctx.restore();

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 50px sans-serif';
    ctx.fillText(isMute ? 'MUTE ATTIVATO' : 'MUTE RIMOSSO', 300, 110);
    
    ctx.font = '30px sans-serif';
    ctx.fillStyle = '#bbbbbb';
    ctx.fillText(`ID: ${mentionedJid.split('@')[0]}`, 300, 165);
    
    ctx.fillStyle = isMute ? '#ff4b5c' : '#4bffb3';
    ctx.beginPath();
    ctx.arc(315, 220, 12, 0, Math.PI * 2);
    ctx.fill();

    ctx.font = 'bold 40px sans-serif';
    ctx.fillText(isMute ? 'SILENZIATO' : 'ATTIVO', 345, 235);

    await conn.sendMessage(chatId, { 
      image: canvas.toBuffer(), 
      caption: caption,
      mentions: [mentionedJid, m.sender]
    }, { quoted: m });

  } catch (e) {
    // SE CANVAS FALLISCE (Termux o errori librerie)
    console.error('Canvas non disponibile, invio solo testo:', e.message);
    await conn.sendMessage(chatId, { 
      text: caption, 
      mentions: [mentionedJid, m.sender] 
    }, { quoted: m });
  }
};

handler.command = /^(muta|smuta)$/i;
handler.group = true;
handler.admin = true;
handler.botAdmin = true;

export default handler;
