const handler = async (m, { conn, command }) => {
  const chats = Object.entries(conn.chats)
    .filter(([jid, chat]) => jid.endsWith('@g.us') && chat.isChats);

  if (!chats.length)
    return m.reply('⚠️ Il bot non è presente in nessun gruppo.');

  const isClose = command === 'chiusogp';
  const action = isClose ? 'announcement' : 'not_announcement';
  
  m.reply(`${isClose ? '🔒 Chiusura' : '🔓 Apertura'} di ${chats.length} gruppi in corso...`);

  for (let [jid] of chats) {
    try {
      await conn.groupSettingUpdate(jid, action);
      await new Promise(res => setTimeout(res, 1000));
    } catch (e) {
      console.log(`Errore ${jid}`, e);
    }
  }

  m.reply(`✅ Operazione completata: tutti i gruppi sono stati ${isClose ? 'chiusi' : 'aperti'}.`);
};

handler.help = ['chiusogp', 'apertogp'];
handler.tags = ['owner'];
handler.command = ['chiusogp', 'apertogp'];
handler.owner = true;

export default handler;
