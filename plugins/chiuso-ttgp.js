const handler = async (m, { conn, command }) => {
  m.reply('⏳ Recupero della lista completa dei gruppi...');

  let groups;
  try {
    groups = await conn.groupFetchAllParticipating();
  } catch (e) {
    return m.reply('❌ Errore nel recupero dei gruppi.');
  }

  const jids = Object.keys(groups);

  if (!jids.length)
    return m.reply('⚠️ Non sono stato trovato in nessun gruppo.');

  const isClose = command === 'chiusogp';
  const action = isClose ? 'announcement' : 'not_announcement';
  
  m.reply(`${isClose ? '🔒 Chiusura' : '🔓 Apertura'} di ${jids.length} gruppi in corso...`);

  let count = 0;
  for (let jid of jids) {
    try {
      await conn.groupSettingUpdate(jid, action);
      count++;
      await new Promise(res => setTimeout(res, 1500));
    } catch (e) {
      console.log(`Fallito su ${jid}: bot non admin o errore sessione.`);
    }
  }

  m.reply(`✅ Operazione terminata.\nGruppi elaborati con successo: ${count}/${jids.length}`);
};

handler.help = ['chiusogp', 'apertogp'];
handler.tags = ['owner'];
handler.command = ['chiusogp', 'apertogp'];
handler.owner = true;

export default handler;
