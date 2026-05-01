const handler = async (m, { conn, command }) => {
  const groups = await conn.groupFetchAllParticipating();
  const jids = Object.keys(groups);

  if (!jids.length)
    return m.reply('⚠️ Il bot non è presente in nessun gruppo.');

  const isClose = command === 'chiusogp';
  const action = isClose ? 'announcement' : 'not_announcement';
  
  m.reply(`${isClose ? '🔒 Chiusura' : '🔓 Apertura'} di ${jids.length} gruppi in corso...`);

  for (let jid of jids) {
    try {
      await conn.groupSettingUpdate(jid, action);
      await new Promise(res => setTimeout(res, 1000));
    } catch (e) {
      console.log(`Salto gruppo ${jid} (probabilmente non sono admin)`);
    }
  }

  m.reply(`✅ Operazione completata su tutti i gruppi accessibili.`);
};

handler.help = ['chiusogp', 'apertogp'];
handler.tags = ['owner'];
handler.command = ['chiusogp', 'apertogp'];
handler.owner = true;

export default handler;
