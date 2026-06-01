let handler = async (m, { conn, text }) => {
  const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  let linkRegex = /chat\.whatsapp\.com\/([0-9A-Za-z]{20,24})/i;
  let [, code] = text.match(linkRegex) || [];
  if (!code) throw 'Link non valido!';

  // Messaggio di attesa
  await m.reply('🤖 *𝐁𝐋𝐎𝐎𝐃-𝐁𝐎𝐓 STA ENTRRANDO NEL GRUPPO (PROBABILMENTE PER NUKKARE)*');

  // Piccolo delay per effetto realistico
  await delay(2000);

  try {
    await conn.groupAcceptInvite(code);
  } catch (e) {
    throw 'Il bot è già nel gruppo o il link non è valido.';
  }
};

handler.help = ['join <chat.whatsapp.com>'];
handler.tags = ['owner'];
handler.command = ['join'];
handler.rowner = true;

export default handler;