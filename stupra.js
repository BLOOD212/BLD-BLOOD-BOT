globalThis.abbracciRank = globalThis.abbracciRank || {};

let handler = async (m, { conn }) => {

  let sender = m.sender;
  let target = null;

  if (m.mentionedJid && m.mentionedJid[0]) {
    target = m.mentionedJid[0];
  } else if (m.quoted && m.quoted.sender) {
    target = m.quoted.sender;
  } else {
    return m.reply("Devi menzionare qualcuno da stuorare😏");
  }

  const frasi = [
    `@${sender.split("@")[0]} *stupra e ingravida pesantemente a* @${target.split("@")[0]} `,
    `@${sender.split("@")[0]} *ha spanato l'ano senza pieta a* @${target.split("@")[0]} `,
    `*Oh*! @${target.split("@")[0]} *è stato rapito da*  @${sender.split("@")[0]} *ed è stato portato in un capanno lo ha legato e iniziato a stuprare hard*  `,
    `@${sender.split("@")[0]} *ha tentato di stuprare* @${target.split("@")[0]} *ma le forza dell' ordine u fimmaru*`,
    `*Tutto il gruppo assiste a* @${sender.split("@")[0]} *rapire a* @${target.split("@")[0]} *nessuno fa niente*`
  ];

  const fraseRandom = frasi[Math.floor(Math.random() * frasi.length)];

  // Ranking abbracci
  if (!globalThis.abbracciRank[target]) globalThis.abbracciRank[target] = 0;
  globalThis.abbracciRank[target] += 1;

  const testoFinale = `${fraseRandom}\n Stupri ricevuti da @${sender.split("@")[0]}: ${globalThis.abbracciRank[target]}`;

  await conn.sendMessage(
    m.chat,
    {
      text: testoFinale,
      mentions: [sender, target]
    },
    { quoted: m }
  );

};

handler.help = ['stupra',];
handler.tags = ['giochi'];
handler.command = /^(stupra)$/i;
handler.group = true;
handler.botAdmin = false;
handler.fail = null;
export default handler;