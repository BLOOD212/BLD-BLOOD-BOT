let handler = m => m
handler.before = async function (m, { conn, isAdmin, isBotAdmin }) {
    if (!m.isGroup) return false
    let chat = global.db.data.chats[m.chat]
    if (chat.autoAceptar && !isAdmin && isBotAdmin) {
        const participants = await conn.groupRequestParticipantsList(m.chat)
        const numita = '39'
        const filteredParticipants = participants.filter(p => {
            const decodedJid = conn.decodeJid(p.jid)
            return decodedJid.includes('@s.whatsapp.net') && decodedJid.split('@')[0].startsWith(numita)
        })
        for (const participant of filteredParticipants) {
            await conn.groupRequestParticipantsUpdate(m.chat, [participant.jid], "approve")
        }
        if (m.messageStubType === 172 && m.messageStubParameters) {
            const [jid] = m.messageStubParameters
            const decodedJid = conn.decodeJid(jid)
            if (decodedJid.includes('@s.whatsapp.net') && decodedJid.split('@')[0].startsWith(numita)) {
                await conn.groupRequestParticipantsUpdate(m.chat, [jid], "approve")
            }
        }
    }
    return true
}
export default handler