const insultiebs = [
    "b[4a@]st[4a@]rd[0o]",
    "[sS]tr[o0]n[zZ][oa4@]",
    "f[i1][gG][4aA]",
    "[cC][4aA][zZ][zZ][o0]",
    "p[e3]n[e3]",
    "c[o0]gl[i1][o0]n[e3i1]",
    "f[i1][gG][l1][i1][oO]d[i1]p[uU]tt[4aA]n[4aA]",
    "p[uU]tt[4aA]n[e3][l1][l1][4aA]",
    "p[uU]tt[4aA]n[0o4aA]",
    "tr[o0][i1][4aA]",
    "z[o0]cc[o0]l[4aA]",
    "b[4aA]g[4aA]sc[i1][4aA]",
    "[pP]r[0oO][sS5][tT][i1][tT][uU][tT][e3a]",
    "f[rR][o0][cC][i1][oO]",
    "f[i1][nN][o0][cC][cC][hH][i1][oO]",
    "[e3][fF][fF][e3]mm[i1]n[4aA]t[o0]",
    "succh[i1][a4][l1][a4o0]", 
    "succh[i1][a4]m[e3][l1][oO]",
    "[sS][uU][cC][cC][hH][i1][4aA]",
    "[pP][o0]mp[i1]n[4aA]r[o0a]",
    "v[4aA][fF][fF][4aA][nN][cC][uU][l1][oO]",
    "[fF][o0][tT][tT][uU]t[o0a]",
    "[nN][e3][gG]r[o0a]",
]
const ir = new RegExp(`\\b(${insultiebs.join('|')})\\b`, 'i')
let handler = m => m
handler.before = async function (m, { conn, isAdmin, isBotAdmin, isOwner }) {
    if (m.isBaileys && m.fromMe) return true
    if (!m.isGroup) return false
    let chat = global.db.data.chats[m.chat]
    let user = global.db.data.users[m.sender]
    const isToxic = ir.exec(m.text)
    if (isToxic && chat.antiToxic && !isOwner && !isAdmin) {
        user.warn += 1
        const decodedSender = conn.decodeJid(m.sender)
        const badWord = isToxic[0]
        if (user.warn < 4) {
            await conn.sendMessage(m.chat, {
                text: `🚫 *Nuh uh, no buono*\n\n@${decodedSender.split`@`[0]}, hai detto una parola vietata: "${badWord}"\n- ⚠️ Avvertimenti: *${user.warn}/3*`,
                mentions: [decodedSender]
            }, { quoted: m })
        }
        if (user.warn >= 3) {
            user.warn = 0
            await conn.sendMessage(m.chat, {
                text: `⛔ *Sparisci* @${decodedSender.split`@`[0]} sei stato rimosso per comportamento tossico.\n- Addio.`,
                mentions: [decodedSender]
            }, { quoted: m })
            if (isBotAdmin) {
                await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
            } else {
                await conn.sendMessage(m.chat, { text: `⚠️ Non posso rimuovere l'utente perché non sono Admin del gruppo.` }, { quoted: m })
            }
        }
    }
    return true
}

export default handler