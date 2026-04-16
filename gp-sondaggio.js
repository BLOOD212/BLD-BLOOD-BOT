let handler = async (m, { conn, text, args, usedPrefix, command }) => {
  if (!args[0]) throw `⚠️️ *_Inserisci un titolo e almeno due opzioni per avviare il sondaggio._*\n\n📌 Esempio :\n*${usedPrefix + command}* Titolo del sondaggio | opzione1 | opzione2`
  if (!text.includes('|')) throw `⚠️️ Separa il titolo e le opzioni del sondaggio con *|*\n\n📌 Esempio :\n*${usedPrefix + command}* Titolo | opzione1 | opzione2`
  
  let parti = text.split('|').map(s => s.trim());
  if (parti.length < 3) throw `⚠️️ Devi inserire almeno un titolo e due opzioni!\n\n📌 Esempio:\n*${usedPrefix + command}* Titolo | opzione1 | opzione2`

  let titolo = parti.shift();
  let opzioni = parti;
  const selectableCount = 1;
  const toAnnouncementGroup = false;

  await conn.sendMessage(m.chat, {
    poll: {
      name: titolo,
      values: opzioni,
      selectableCount,
      toAnnouncementGroup
    }
  }, { quoted: m });
}

handler.help = ['sondaggio <titolo>| <a>|<b>']
handler.tags = ['gruppo']
handler.command = ['poll', 'sondaggio']
handler.group = true

export default handler