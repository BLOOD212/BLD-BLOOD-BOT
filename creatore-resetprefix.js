const handler = async (m, {conn}) => {
  global.prefix = new RegExp('^[' + (opts['prefix'] || '‎xzXZ/i!#$%+£¢€¥^°=¶∆×÷π√✓©®:;?&.\\-').replace(/[|\\{}()[\]^$+*?.\-\^]/g, '\\$&') + ']');
  conn.fakeReply(m.chat, '✅️ *Prefisso ripristinato con successo!*', '0@s.whatsapp.net', '💫 PREFISSO RIPRISTINATO 💫')
};
handler.help = ['resetprefix'];
handler.tags = ['creatore'];
handler.command = /^(resetprefix)$/i;
handler.rowner = true;

export default handler;
