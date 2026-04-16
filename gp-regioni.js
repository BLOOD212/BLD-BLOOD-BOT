let handler = async (m, { conn }) => {
  try {
    const nordregioni = '📍 Di quale regione sei? (Nord + Centro)';
    const sudregioni = '📍 Di quale regione sei? (Sud + Isole)';
    const regioninord = [
      'Emilia-Romagna',
      'Friuli Venezia Giulia',
      'Lazio',
      'Liguria',
      'Lombardia',
      'Marche',
      'Piemonte',
      'Toscana',
      'Trentino-Alto Adige',
      'Umbria',
      "Valle d'Aosta",
      'Veneto'
    ];
    const regionisud = [
      'Abruzzo',
      'Basilicata',
      'Calabria',
      'Campania',
      'Molise',
      'Puglia',
      'Sardegna',
      'Sicilia'
    ];
    await conn.sendMessage(m.chat, {
      poll: {
        name: nordregioni,
        values: regioninord,
        selectableCount: 1,
        toAnnouncementGroup: false
      }
    });
    await new Promise(resolve => setTimeout(resolve, 500));
    await conn.sendMessage(m.chat, {
      poll: {
        name: sudregioni,
        values: regionisud,
        selectableCount: 1,
        toAnnouncementGroup: false
      }
    });

  } catch (error) {
    console.error('Errore in pollregioni:', error);
    await conn.reply(m.chat, `${global.errore}`, m);
  }
};

handler.help = ['pollregioni'];
handler.tags = ['gruppo'];
handler.command = ['pollregioni', 'regioni'];
handler.group = true;
handler.admin = true;
export default handler;