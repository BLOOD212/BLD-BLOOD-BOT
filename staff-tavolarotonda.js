let handler = async(m, { conn, command, text, usedPrefix }) => {
  if (!text) return m.reply(`❗ *Inserisci il motivo per la riunione dello staff!*`);
  
  const gruppostaff = 'https://tinyurl.com/' //usate short link, con chat.whatsapp.com non va (?)
  const butimnumberone = 'https://i.ibb.co/nNQX4Xmc/tavolarotonda.jpg';
  
  let messaggio = `
─ׄ─⭒『 \`TAVOLA ROTONDA\` 』⭒─ׄ─

『 👑 』 \`Convocati da:\` @${m.sender.split`@`[0]}
『 📝 』 \`Motivo:\` *${text}*
`.trim();

  const owners = global.owner.map(owner => `${owner[0]}@s.whatsapp.net`);

  m.reply('『 ✅ 』 *Convocazione inviata a tutti gli owner.*');
  for (let ownerJid of owners) {
    let data = (await conn.onWhatsApp(ownerJid))?.[0] || {};
    
    if (data.exists) {
      await conn.sendMessage(data.jid, {
        image: { url: butimnumberone },
        caption: messaggio,
        footer: '',
        mentions: [m.sender],
        interactiveButtons: [
          {
            name: 'cta_url',
            buttonParamsJson: JSON.stringify({
              display_text: 'Entra nel Gruppo Staff',
              url: gruppostaff
            })
          }
        ]
      });

    } else {
      console.log(`Il numero ${ownerJid.split[0]} non è su WhatsApp o non è raggiungibile.`);
    }
  }
};

handler.tags = ['creatore'];
handler.command = handler.help = ['tavolarotonda', 'riunione'];
handler.owner = true;
export default handler;