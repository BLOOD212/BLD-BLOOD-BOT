const handler = async (m, { conn, command }) => {
  m.reply('⏳ Recupero della lista completa...');

  let groups;
  try {
    groups = await conn.groupFetchAllParticipating();
  } catch (e) {
    return m.reply('❌ Errore nel recupero dei gruppi.');
  }

  const jids = Object.keys(groups);
  if (!jids.length) return m.reply('⚠️ Nessun gruppo trovato.');

  const isClose = command === 'chiusogp';
  const action = isClose ? 'announcement' : 'not_announcement';
  
  m.reply(`🚀 Operazione su ${jids.length} gruppi in corso...`);

  let success = 0;
  let failed = 0;

  for (let jid of jids) {
    try {
      const metadata = groups[jid];
      const participants = metadata.participants || [];
      const botNumber = conn.user.jid || conn.user.id.split(':')[0] + '@s.whatsapp.net';
      const isBotAdmin = participants.some(p => p.id === botNumber && (p.admin === 'admin' || p.admin === 'superadmin'));

      if (isBotAdmin) {
        await conn.groupSettingUpdate(jid, action);
        success++;
      } else {
        failed++;
      }
      
      await new Promise(res => setTimeout(res, 3500));

    } catch (e) {
      failed++;
      if (e.message.includes('rate-overlimit')) {
        await new Promise(res => setTimeout(res, 10000));
      }
    }
  }

  m.reply(`✅ Operazione conclusa.\n\n🟢 Riusciti: ${success}\n🔴 Falliti: ${failed}`);
};

handler.help = ['chiusogp', 'apertogp'];
handler.tags = ['owner'];
handler.command = ['chiusogp', 'apertogp'];
handler.owner = true;

export default handler;
