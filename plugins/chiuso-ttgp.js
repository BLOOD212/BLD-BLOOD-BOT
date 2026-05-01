const handler = async (m, { conn, command }) => {
  m.reply('⏳ Recupero lista gruppi e avvio chiusura sequenziale...');

  let groups;
  try {
    groups = await conn.groupFetchAllParticipating();
  } catch (e) {
    return m.reply('❌ Errore nel recupero gruppi.');
  }

  const jids = Object.keys(groups);
  if (!jids.length) return m.reply('⚠️ Nessun gruppo trovato.');

  const isClose = command === 'chiusogp';
  const action = isClose ? 'announcement' : 'not_announcement';
  
  let success = 0;
  let failed = 0;

  for (let jid of jids) {
    try {
      await conn.groupSettingUpdate(jid, action);
      success++;
      await new Promise(res => setTimeout(res, 2000));
    } catch (e) {
      failed++;
      console.log(`Errore su ${jid}`);
      await new Promise(res => setTimeout(res, 500));
    }
  }

  m.reply(`✅ Operazione terminata.\n\n🟢 Riusciti: ${success}\n🔴 Falliti: ${failed}\n\nSe i falliti sono molti, il bot non è admin in quei gruppi.`);
};

handler.help = ['chiusogp', 'apertogp'];
handler.tags = ['owner'];
handler.command = ['chiusogp', 'apertogp'];
handler.owner = true;

export default handler;
