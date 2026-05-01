const handler = async (m, { conn, command }) => {
  let groups = [];
  try {
    const data = await conn.groupFetchAllParticipating();
    groups = Object.values(data);
  } catch (e) {
    groups = Object.values(conn.chats).filter(v => v.id.endsWith('@g.us') && v.read_only === false);
  }

  if (!groups.length) return m.reply('⚠️ Nessun gruppo trovato.');

  const isClose = command === 'chiusogp';
  const action = isClose ? 'announcement' : 'not_announcement';
  
  m.reply(`⏳ Elaborazione di ${groups.length} gruppi...`);

  let success = 0;
  let failed = 0;

  for (let group of groups) {
    const jid = group.id || group.jid;
    try {
      await conn.groupSettingUpdate(jid, action);
      success++;
    } catch (e) {
      failed++;
      console.error(`Errore su ${jid}:`, e.message);
    }
    await new Promise(res => setTimeout(res, 1000));
  }

  m.reply(`✅ Fine.\n\n🟢 Riusciti: ${success}\n🔴 Falliti: ${failed}\n\nNota: Se sono falliti, controlla che il bot sia ADMIN.`);
};

handler.help = ['chiusogp', 'apertogp'];
handler.tags = ['owner'];
handler.command = ['chiusogp', 'apertogp'];
handler.owner = true;

export default handler;
