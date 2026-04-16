let handler = async (m, { conn }) => {

let res = await conn.groupRevokeInvite(m.chat)
let gruppo = m.chat
conn.reply(m.sender, 'https://chat.whatsapp.com/' + await conn.groupInviteCode(gruppo), m, )

}
handler.help = ['reimpostalink']
handler.tags = ['gruppo']
handler.command = ['reimpostalink', 'revoke','rlink']
handler.group = true
handler.admin = true
handler.botAdmin = true

export default handler;