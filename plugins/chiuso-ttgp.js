const handler = async (m, { conn }) => {
  const chats = Object.entries(conn.chats)
    .filter(([jid, chat]) => jid.endsWith('@g.us') && chat.isChats);

  if (!chats.length)
    return m.reply('⚠️ Il bot non è presente in nessun gruppo.');

  m.reply(`🔒 Chiusura di ${chats.length} gruppi in corso...`);

  for (let [jid] of chats) {
    try {
      await conn.groupSettingUpdate(jid, 'announcement');
      await new Promise(res => setTimeout(res, 1000));
    } catch (e) {
      console.log(`Errore ${jid}`, e);
    }
  }

  m.reply('✅ Operazione completata.');
};

handler.help = ['chiusogp'];
handler.tags = ['owner'];
handler.command = ['chiusogp'];
handler.owner = true;

export default handler;
