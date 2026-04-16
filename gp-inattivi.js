let handler = async (m, { conn, text, args, groupMetadata, isAdmin, isOwner }) => {
    await conn.sendPresenceUpdate('composing', m.chat);

    const lama = 86400000 * 7; // 7 giorni
    const now = new Date().toLocaleString("it-IT", { timeZone: "Europe/Rome" });
    const milliseconds = new Date(now).getTime();

    let member = groupMetadata.participants.map(v => v.id);
    let total = 0;
    const sider = [];

    for (let i = 0; i < member.length; i++) {
        let users = groupMetadata.participants.find(u => u.id === member[i]);
        if ((typeof global.db.data.users[member[i]] === 'undefined' || milliseconds - global.db.data.users[member[i]].lastseen > lama) && !users?.isAdmin && !users?.isSuperAdmin) {
            if (typeof global.db.data.users[member[i]] !== 'undefined') {
                if (global.db.data.users[member[i]].banned !== true) {
                    total++;
                    sider.push(member[i]);
                }
            } else {
                total++;
                sider.push(member[i]);
            }
        }
    }

    // Se non ci sono argomenti, mostra il menu con i bottoni
    if (!args[0]) {
        const buttons = [
            {
                buttonId: `.inattivi lista`,
                buttonText: { displayText: '📋 Visualizza Lista' },
                type: 1
            },
            {
                buttonId: `.inattivi rimuovi`,
                buttonText: { displayText: '🗑️ Rimuovi Inattivi' },
                type: 1
            }
        ];

        const buttonMessage = {
            text: `❄️ *Gestione coglioni Inattivi*\n\n📊 Membri rincoglioniti trovati: *${total}/${member.length}*\n\n⏰ Inattivi da più di 7 giorni\n\n🔽 Scegli un'opzione:`,
            footer: 'inizio ispezzione',
            buttons: buttons,
            headerType: 1
        };

        return conn.sendMessage(m.chat, buttonMessage, { quoted: m });
    }

    if (args[0] === 'lista') {
        if (!isAdmin && !isOwner) {
            return conn.reply(m.chat, '❌ Solo gli *admin* possono vedere la lista degli inattivi.', m);
        }
        
        if (total === 0) {
            const successButton = {
                text: '✅ *Nessun coglione inattivo trovato!*\n\n🎉 Tutti i cani del gruppo sono attivi.',
                footer: 'supervisione cani',
                buttons: [{
                    buttonId: `.inattivi`,
                    buttonText: { displayText: '🔄 Torna al Menu' },
                    type: 1
                }],
                headerType: 1
            };
            return conn.sendMessage(m.chat, successButton, { quoted: m });
        }
        
        const groupName = await conn.getName(m.chat);
        const message = `📋 *Lista coglioni Inattivi*\n\n👥 Gruppo: *${groupName}*\n📊 Inattivi: *${total}/${member.length}*\n\n${sider.map((v, i) => `${i + 1}. @${v.replace(/@.+/, '')}`).join('\n')}`;

        const listButtons = [
            {
                buttonId: `.rimuovi sti mongoplettici`,
                buttonText: { displayText: '🗑️ Rimuovili' },
                type: 1
            },
            {
                buttonId: `.inattivi`,
                buttonText: { displayText: '🔄 Torna al Menu' },
                type: 1
            }
        ];

        const listMessage = {
            text: message,
            footer: 'supervisine cani - lista rincoglioniti',
            buttons: listButtons,
            headerType: 1,
            contextInfo: {
                mentionedJid: sider
            }
        };

        return conn.sendMessage(m.chat, listMessage, { quoted: m });
    }

    if (args[0] === 'rimuovi') {
        if (!isOwner && !isAdmin) {
            return conn.reply(m.chat, '❌ Solo gli *admin* del gruppo possono rimuovere sti rincoglioniti.', m);
        }
        
        if (total === 0) {
            const noRemoveButton = {
                text: '✅ *Nessun down da rimuovere!*\n\n🎉 Tutti i cani del gruppo sono attivi.',
                footer: 'supervisione cani',
                buttons: [{
                    buttonId: `.inattivi`,
                    buttonText: { displayText: '🔄 Torna al Menu' },
                    type: 1
                }],
                headerType: 1
            };
            return conn.sendMessage(m.chat, noRemoveButton, { quoted: m });
        }

        // Messaggio di conferma prima della rimozione
        const confirmButtons = [
            {
                buttonId: `.inattivi conferma`,
                buttonText: { displayText: '✅ Conferma Rimozione' },
                type: 1
            },
            {
                buttonId: `.inattivi`,
                buttonText: { displayText: '❌ Annulla' },
                type: 1
            }
        ];

        const confirmMessage = {
            text: `⚠️ *Conferma Rimozione*\n\n🗑️ Stai per rimuovere *${total}* membri inattivi dal gruppo.\n\n❗ Questa azione è irreversibile!\n\n🤔 Sei sicuro di voler continuare?`,
            footer: 'supervisione cani - giustiziali',
            buttons: confirmButtons,
            headerType: 1
        };

        return conn.sendMessage(m.chat, confirmMessage, { quoted: m });
    }

    if (args[0] === 'conferma') {
        if (!isOwner && !isAdmin) {
            return conn.reply(m.chat, '❌ Solo gli *admin* del gruppo possono rimuovere i rincoglioniti.', m);
        }

        if (total === 0) {
            return conn.reply(m.chat, `❄️ *Non ci sono coglioni inattivi da rimuovere.*`, m);
        }

        let removedCount = 0;
        const errors = [];

        for (const user of sider) {
            try {
                await conn.groupParticipantsUpdate(m.chat, [user], 'remove');
                removedCount++;
            } catch (e) {
                errors.push(user);
                console.error(`Errore nella rimozione di ${user}:`, e);
            }
        }

        const successMessage = removedCount > 0 
            ? `✅ *Rimozione completata!*\n\n🗑️ Rimossi con successo: *${removedCount}* membri\n${errors.length > 0 ? `⚠️ Errori: *${errors.length}* membri non rimossi` : ''}` 
            : `❌ *Errore nella rimozione*\n\nNon è stato possibile rimuovere nessun membro.`;

        const resultButton = {
            text: successMessage,
            footer: 'supervisione cani - giustizia fatta',
            buttons: [{
                buttonId: `.inattivi`,
                buttonText: { displayText: '🔄 Torna al Menu' },
                type: 1
            }],
            headerType: 1
        };

        return conn.sendMessage(m.chat, resultButton, { quoted: m });
    }

    // Opzione non valida
    const errorButton = {
        text: `❌ *Opzione non valida*\n\nUsa i bottoni del menu per navigare correttamente.`,
        footer: 'supervisione cani',
        buttons: [{
            buttonId: `.inattivi`,
            buttonText: { displayText: '🔄 Torna al Menu' },
            type: 1
        }],
        headerType: 1
    };

    return conn.sendMessage(m.chat, errorButton, { quoted: m });
};

handler.help = ['inattivi'];
handler.tags = ['gruppo'];
handler.command = /^(inattivi)$/i;
handler.group = true;
handler.owner = false;
handler.botAdmin = true;

export default handler;
