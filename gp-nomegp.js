const handler = async (m, { conn, args }) => {
  if (!args[0]) return conn.reply(m.chat, '『 ⁉️ 』 \`Che nome gli metto?\`', m)

  const nuovoNome = args.join(' ')
  if (nuovoNome.length > 120)
    return conn.reply(m.chat, '『 ❌ 』 Il nome del gruppo non può superare i 120 caratteri.', m)

  await conn.groupUpdateSubject(m.chat, nuovoNome)
  await conn.reply(m.chat, `『 ✅ 』 \`Nome del gp cambiato:\`\n> *${nuovoNome}*`, m)
}

handler.help = ['nomegp <nome>']
handler.tags = ['gruppo']
handler.command = /^(nomegp|setnomegp)$/i
handler.group = true
handler.admin = true

export default handler