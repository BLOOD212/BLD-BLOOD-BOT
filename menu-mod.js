/**
 * MENU MOD – SOLO TESTO
 */

const handler = async (message, { conn, usedPrefix = '.' }) => {

    const menuText = `
🌟 *MENU MODERATORI*

════════════════════
🛠️ *COMANDI MOD*
➤ ${usedPrefix}tagmod
➤ ${usedPrefix}pingmod
➤ ${usedPrefix}delm
➤ ${usedPrefix}nukegp
➤ ${usedPrefix}warnmod
➤ ${usedPrefix}unwarnmod

════════════════════
`.trim();

    // INVIO SOLO TESTO
    await conn.sendMessage(message.chat, { text: menuText });
};

handler.help = ['menumod'];
handler.tags = ['menu'];
handler.command = /^(menumod)$/i;

export default handler;