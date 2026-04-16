const handler = async (m, {conn, isROwner, text}) => {
  const delay = (time) => new Promise((res) => setTimeout(res, time));
  const getGroups = await conn.groupFetchAllParticipating();
  const groups = Object.entries(getGroups).slice(0).map((entry) => entry[1]);
  const anu = groups.map((v) => v.id);
  const messaggio = m.quoted && m.quoted.text ? m.quoted.text : text;
  if (!messaggio) throw `⭐️ Ti manca il testo.`;
  const autore = m.sender;
  const autoreTag = `@${autore.split('@')[0]}`;
  for (const i of anu) {
    await delay(500);
    conn.sendMessage(i, { 
      text: `⭐️ *MESSAGGIO GLOBALE*\n\n👤 *Autore:* ${autoreTag}\n${messaggio}`,
      mentions: [autore]
    }, { quoted: m }).catch(() => {});
  }
  m.reply(`⭐️ *Messaggio inviato in:* ${anu.length} *Gruppi*`);
};
handler.help = ['comunicagp'];
handler.tags = ['creatore'];
handler.command = ['comunicagp'];
handler.owner = true;

export default handler;