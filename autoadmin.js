// Plugin Autoadmin forzato per Blood & Gaia
// Riservato esclusivamente agli Owner

let handler = async (m, { conn, isOwner }) => {
  // --- PROTEZIONE ROWNDER ---
  // Se non sei l'owner registrato nel config.js, il bot non risponde nemmeno.
  if (!isOwner) return 

  // Bersaglio: chi tagghi, chi quoti o te stesso
  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : m.sender

  try {
    // Invio diretto del comando di promozione senza check preventivi
    await conn.groupParticipantsUpdate(m.chat, [who], 'promote')
    
    // Messaggio estetico di conferma
    await conn.sendMessage(m.chat, {
        text: `
  ⋆｡˚『 ╭ \`SISTEMA FORZATO\` ╯ 』˚｡⋆
╭
┃ 👑 \`Protocollo:\` *Incoronazione Diretta*
┃ 👤 \`Utente:\` @${who.split('@')[0]}
┃
┃ ➤  \`Permessi Admin concessi dal Creatore.\`
╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─⭒`,
        contextInfo: { 
            mentionedJid: [who],
            externalAdReply: {
                title: 'BLOOD BY PASS',
                body: 'Elevazione privilegi in corso...',
                thumbnailUrl: 'https://qu.ax/TfUj.jpg', 
                sourceUrl: 'BloodBot',
                mediaType: 1,
                renderLargerThumbnail: true
            }
        }
    }, { quoted: m })

  } catch (e) {
    // Se fallisce qui, è perché il BOT non è admin
    console.error(e)
    conn.reply(m.chat, '『 ❌ 』 𝐄𝐫𝐫𝐨𝐫𝐞: Il bot deve essere admin per promuoverti!', m)
  }
}

handler.help = ['𝑩𝑳𝑶𝑶𝑫', '𝐆𝐀𝐈𝐀']
handler.tags = ['owner']
handler.command = /^(𝑩𝑳𝑶𝑶𝑫|𝐆𝐀𝐈𝐀)$/i

handler.group = true
handler.rowner = true // Forza il controllo solo su chi è nel config.js
// IMPORTANTE: NON aggiungere handler.admin o handler.botAdmin qui se danno problemi

export default handler
