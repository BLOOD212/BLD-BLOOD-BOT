let handler = async (m, { conn }) => {

  const testo = `*imera sto coglione ha una palla storta e un dente nel naso ma gli voglio tanto bene al mio palermitano stronzo preferito melo chiavo tutti giorni*`;

  await conn.sendMessage(
    m.chat,
    {
      text: testo
    },
    { quoted: m }
  );
};

handler.help = ['imera'];
handler.tags = ['giochi'];
handler.command = ['imera'];

export default handler;