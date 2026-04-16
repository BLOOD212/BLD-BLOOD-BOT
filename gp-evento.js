let handler = async (m, { conn, text }) => {
  const jid = m.chat;

  if (!text) {
    return conn.sendMessage(jid, {
      text:
        `\`Uso comando:\`\n*.evento nome evento | descrizione evento | nome luogo*\n\n` +
        `\`Esempio:\`\n*.evento E-sex | E-sex speciale | Zozzap*`
    }, { quoted: m });
  }

  let [name = 'Evento senza nome', description = 'Nessuna descrizione', locationName = 'Luogo sconosciuto'] = text.split('|').map(s => s.trim());

  const now = Math.floor(Date.now() / 1000);
  const startTime = now + 60 * 60;
  const endTime = now + 3 * 60 * 60;

  await conn.sendMessage(
    jid,
    {
      event: {
        isCanceled: false,
        name,
        description,
        location: {
          degreesLatitude: 45.4642,
          degreesLongitude: 9.19,
          name: locationName
        },
        startTime,
        endTime,
        extraGuestsAllowed: true
      }
    },
    { quoted: m }
  );
};

handler.command = ['evento'];
handler.admin = true;
handler.group = true;
export default handler;