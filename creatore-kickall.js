import axios from 'axios';

let handler = async (m, { conn, participants }) => {
    const groupAdmins = participants.filter(p => p.admin);
    const botId = conn.user.jid;
    const groupOwner = groupAdmins.find(p => p.isAdmin)?.id;
    const groupNoAdmins = participants.filter(p => p.id !== botId && p.id !== groupOwner && !p.admin).map(p => p.id);
    if (groupNoAdmins.length === 0) throw '*⚠️ Non ci sono utenti da eliminare.*';
    
    await conn.groupParticipantsUpdate(m.chat, groupNoAdmins, 'remove');
    conn.reply(m.chat, '*⚔️ Eliminazione completata con successo.*', m);
    m.react('✅');
};

handler.help = ['kickall'];
handler.command = /^(kickall)$/i;
handler.group = true;
handler.rowner = true;
handler.botAdmin = true;
export default handler;