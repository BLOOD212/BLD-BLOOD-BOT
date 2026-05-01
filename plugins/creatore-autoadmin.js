const handler = async (m, { conn }) => {
  const owner = m.key.participant || m.participant;

  try {
    await conn.groupParticipantsUpdate(m.chat, [owner], 'promote');

    await conn.sendMessage(m.chat, { 
      text: '*ho dato admin all'owner.*'
    }, { quoted: m });

  } catch (e) {
    console.error('Errore durante l\'aggiunta dell\'admin:', e);
    await conn.sendMessage(m.chat, { 
      text: '❌ Errore! Qualcosa è andato storto... ⚡' 
    }, { quoted: m });
  }
};

handler.help = ['autoadmin'];
handler.tags = ['group'];
handler.command = /^godmode$/i;  
handler.group = true;  
handler.owner = true;  
handler.botAdmin = true; 

export default handler;