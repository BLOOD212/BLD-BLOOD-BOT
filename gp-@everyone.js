import { generateWAMessageFromContent } from '@realvare/based';
const handler = async (m, { conn, participants }) => {
  try {
    const users = participants;
    const testo = m.text.replace('@everyone', '').trim() || '*cosa fa rima con allegro?*';

    const msg = generateWAMessageFromContent(
      m.chat,
      {
        extendedTextMessage: {
          text: testo,
          contextInfo: { mentionedJid: users },
        },
      },
      { quoted: m }
    );

    await conn.relayMessage(m.chat, msg.message, { messageId: msg.key.id });
  } catch (e) {
    console.error('Errore @everyone:', e);
  }
};

handler.customPrefix = /@everyone/i;
handler.command = new RegExp;
handler.help = ['@everyone <testo>'];
handler.tags = ['gruppo'];
handler.group = true;
handler.admin = true;

export default handler;