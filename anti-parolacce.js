const uhuh = /\b(b[4a@]st[4a@]rd[0o]|[Ff][1iI][cC][4aA]|succh[i1][a4][l1][a4o0]|[Cc][i1][uU][cC][cC][i1][oO]|succh[i1][a4]m[e3][l1][oO]|v[e3]rm[e3]|f[i1][gG][l1][i1][oO]d[i1]p[uU]tt[4aA]n[4aA]|[sS]tr[o0]n[zZ][oa]|[l1][i1]n[gG][uU][a4][cC][cC][i1][uU]t[4aA]|l[4aA]d[o0]nn[4aA]d[i1]dd[i1][oO]|p[uU]tt[4aA]n[e3][l1][l1][4aA]|p[uU]tt[4aA]n[0o]|[pP]r[0oO][sS5][tT][i1][tT][uU][tT][e3]|[a4A]n[sS5][i1][oO][l1][i1]t[i1][cC][oO]|dr[0oO][gG][hH][e3]|dr[0oO][gG][4aA]|p[e3]n[e3]|[nN][e3][gG]r[o0]|f[rR][o0][cC][i1][oO]|f[i1][nN][o0][cC][cC][hH][i1][oO]|v[4aA][fF][fF][4aA][nN][cC][uU][l1][oO]|[e3][fF][fF][e3]mm[i1]n[4aA]t[o0]|[cC][o0][cC][4aA][i1]n[4aA]|[mM][4aA]r[i1][jJ][uU][4aA]n[4aA]|[vV][e3][cC][cC][hH][i1][o0aA]|[cC][4aA][gG][o0]n[e3aA]|[sS][cC][o0]r[e3][gG][gG][i1][o0]n[e3aA]|pr[e3][sS5][uU]m[tT][uU][o0][sS5][o0aA]|[cC][4aA][zZ][zZ][o0]|[sS][uU][cC][cC][hH][i1][4aA]|[mM][e3]rd[4aA]|[sS][cC][e3]m[o0aA]|[pP][4aA][zZ][zZ][o0aA]|[pP][o0]mp[i1]n[4aA]r[o0]|[sS]t[uU]p[i1]d[o0aA]|[i1]d[i1][o0]t[4aA]|tr[o0][i1][4aA]|[sS]tr[o0]n[zZ][4aA]t[4aA]|[sS]p[e3]rm[4aA]|[sS][cC][o0]p[4aA]t[o0]r[e3]|[fF][o0][tT][tT][uU]t[o0])\b/i

let handler = m => m
handler.before = async function (m, { conn, isAdmin, isBotAdmin, isOwner }) { 
    if (m.isBaileys && m.fromMe) return true
    if (!m.isGroup) return false
    let user = global.db.data.users[m.sender]
    let chat = global.db.data.chats[m.chat]
    const t = uhuh.exec(m.text)
    if (chat.antiparolacce && !isOwner && !isAdmin) {
        const decodedSender = conn.decodeJid(m.sender)
        user.warn += 1
        if (!(user.warn >= 4)) {
            await conn.sendMessage(m.chat, {
                text: `${user.warn == 1 ? `*@${decodedSender.split`@`[0]}*` : `*@${decodedSender.split`@`[0]}*`}, hai: (${t}) avvertimenti... hai: *${user.warn}/4*\n\ndi avvertimenti.`,
                mentions: [decodedSender]
            }, { quoted: m })
        }

        if (user.warn >= 4) {
            user.warn = 0
            await conn.sendMessage(m.chat, {
                text: `sparisci \n*@${decodedSender.split`@`[0]}*`,
                mentions: [decodedSender]
            }, { quoted: m })
            user.banned = true
            await conn.groupParticipantsUpdate(m.chat, [m.sender], 'remove')
        }
    }
    return true
}

export default handler