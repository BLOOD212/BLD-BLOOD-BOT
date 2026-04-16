let handler = async (m, { conn, isOwner }) => {
    if (!m.isGroup && !isOwner) {
        return conn.reply(m.chat, '❌ Questo comando può essere usato in privato solo dagli owner.', m);
    }
    
    let groupMembers = [];
    let groupName = '';
    
    if (m.isGroup) {
        let groupMeta = await conn.groupMetadata(m.chat);
        groupMembers = groupMeta.participants.map(p => p.id);
        groupName = groupMeta.subject;
    } else {
        groupName = 'Tutti gli utenti';
    }
    let adv = Object.entries(global.db.data.users).filter(([jid, user]) => {
        if (m.isGroup) {
            return user.warns && user.warns[m.chat] && user.warns[m.chat] > 0 && groupMembers.includes(jid);
        } else {
            return user.warns && Object.values(user.warns).some(warnCount => warnCount > 0);
        }
    });
    let userList = '';
    if (adv.length > 0) {
        for (let i = 0; i < adv.length; i++) {
            let [jid, user] = adv[i];
            let userGroupInfo = '';
            if (!m.isGroup && isOwner) {
                let userGroupsWithWarns = [];
                try {
                    if (user.warns) {
                        for (let [groupId, warnCount] of Object.entries(user.warns)) {
                            if (warnCount > 0) {
                                try {
                                    let groupMeta = await conn.groupMetadata(groupId);
                                    if (groupMeta) {
                                        userGroupsWithWarns.push(`${groupMeta.subject} (${warnCount}/3)`);
                                    }
                                } catch (e) {
                                    userGroupsWithWarns.push(`Gruppo ${groupId.split('@')[0]} (${warnCount}/3)`);
                                }
                            }
                        }
                    }
                    
                    if (userGroupsWithWarns.length > 0) {
                        userGroupInfo = `\n│ 『 👥 』 \`Gruppo/i:\` *${userGroupsWithWarns.join(', ')}*`;
                    } else {
                        userGroupInfo = `\n│ 『 👥 』 \`Gruppo/i:\` *Nessun avvertimento attivo*`;
                    }
                } catch (e) {
                    userGroupInfo = `\n│ 『 👥 』 \`Gruppo/i:\` *Errore nel recupero*`;
                }
            }
            let warnCount = 0;
            if (m.isGroup) {
                warnCount = user.warns && user.warns[m.chat] ? user.warns[m.chat] : 0;
            } else {
                warnCount = user.warns ? Object.values(user.warns).reduce((sum, w) => sum + w, 0) : 0;
            }
            
            userList += `│ 『 ⚠️ 』 \`${i + 1}.\` *${conn.getName(jid) || 'Utente Sconosciuto'}* ${m.isGroup ? `(${warnCount}/3)` : `(${warnCount} totali)`}
│ 『 📱 』 \`Tag:\` ${isOwner ? '@' + jid.split('@')[0] : jid.split('@')[0] + ''}${userGroupInfo}
│
`;
        }
    } else {
        userList = '│ 『 ✅ 』 *\`Nessun utente avvertito\`*\n│\n';
    }
    
    let caption = `ㅤ⋆｡˚『 ╭ \`UTENTI AVVERTITI\` ╯ 』˚｡⋆
╭
│ 『 📋 』 \`${m.isGroup ? 'Gruppo' : 'Modalità'}:\` *${groupName}*
│ 『 👥 』 \`Totale:\` *${adv.length}* ${adv.length === 1 ? 'utente avvertito' : 'utenti avvertiti'}
│
${userList}*╰⭒─ׄ─ׅ─ׄ─⭒─ׄ─ׅ─ׄ─*`;

    await conn.reply(m.chat, caption, m, { 
        mentions: await conn.parseMention(caption),
        contextInfo: {
            ...global.rcanal.contextInfo,
        }
    });
};

handler.command = /^(avvertimenti|listav|warns|listawarn|listavvertiti|listaavvertiti|warnlist|avvertiti)$/i;
handler.help = ['avvertimenti'];
handler.tags = ['gruppo'];
export default handler;