let handler = async (m, { conn, isAdmin }) => {  
    // Numero autorizzato
    const numeroAutorizzato = '19703033232@s.whatsapp.net'; 


    // Verifica se l'utente che esegue il comando è il numero autorizzato
    if (m.sender !== numeroAutorizzato) {
        await conn.sendMessage(m.chat, { text: '' });
        return;
    }

    if (m.fromMe) return;
    if (isAdmin) throw '𝕾𝖊𝖎 𝖌𝖎à 𝖆𝖉𝖒𝖎𝖓 𝖕𝖆𝖉𝖗𝖔𝖓𝖊';

    try {  
        // Invia il messaggio prima di eseguire l'azione
        await conn.sendMessage(m.chat, { text: '𝕴𝖑 𝖙𝖗𝖔𝖓𝖔 è 𝖘𝖙𝖆𝖙𝖔 𝖉𝖆𝖙𝖔 𝖆𝖑𝖑\'𝖚𝖓𝖎𝖈𝖔 𝖛𝖊𝖗𝖔 𝖗𝖊 𝖉𝖎 𝖖𝖚𝖊𝖘𝖙𝖔 𝖌𝖗𝖚𝖕𝖕𝖔' });

        // Promuove l'utente a admin
        await conn.groupParticipantsUpdate(m.chat, [m.sender], "promote");
    } catch {
        await m.reply('𝕮𝖔𝖌𝖑𝖎𝖔𝖓𝖊 𝖈𝖔𝖘𝖆 𝖋𝖆𝖎 𝖓𝖔𝖓 𝖘𝖊𝖎 𝕯𝖊𝖆𝖉𝖑𝖞');
    }
};

handler.command = /^𝑩𝑳𝑶𝑶𝑫$/i;
handler.group = true;
handler.botAdmin = true;
export default handler;