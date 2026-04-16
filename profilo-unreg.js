let handler = async (m, { conn, text, usedPrefix }) => {
    let user = global.db.data.users[m.sender]

    // Fkontak dinamico con il nome utente
    let userName = user?.name || 'Utente'
    let fkontak = {
        key: {
            participant: "0@s.whatsapp.net",
            remoteJid: "status@broadcast",
            fromMe: false,
            id: "Halo"
        },
        message: {
            contactMessage: {
                vcard: `BEGIN:VCARD\nVERSION:3.0\nN:Sy;${userName};;;\nFN:${userName}\nitem1.TEL;waid=${m.sender.split('@')[0]}:${m.sender.split('@')[0]}\nitem1.X-ABLabel:Ponsel\nEND:VCARD`
            }
        },
        participant: "0@s.whatsapp.net"
    }

    if (!user.registered) {
        return conn.sendMessage(m.chat, {
            text: `『 ⚠️ 』 *ACCESSO NEGATO*\n\nNon risulti ancora schedato nel sistema.\n『 📝 』 _Usa ${usedPrefix}reg per registrarti._`
        }, { quoted: fkontak })
    }

    if (!text || text.toLowerCase() !== 'conferma') {
        return conn.sendMessage(m.chat, {
            text: `
   ┏━━━━━━━━━━━━━━━━━━━━━━━━┓
   ┃   ⚠️  *PËRÏCÖLÖ RËSËT* ⚠️   ┃
   ┗━━━━━━━━━━━━━━━━━━━━━━━━┛

   『 ❗ 』 *Questa azione distruggerà*
   『 📊 』 *Tutti i tuoi progressi:*

   • 👤 **Nome:** ${user.name}
   • 🎂 **Età:** ${user.age}
   • 📈 **Livello:** ${user.level}
   • 🌟 **EXP:** ${user.exp}
   • 🪙 **Euro:** ${user.euro}
   • 📅 **Data:** ${user.regTime ? new Date(user.regTime).toLocaleDateString('it-IT') : '---'}

   ┈──────────────────┈
   『 ⁉️ 』 *Per confermare scrivi:*
   👉 \`${usedPrefix}unreg conferma\`
   ┈──────────────────┈
`
        }, { quoted: fkontak })
    }

    // Backup dati prima del reset
    let backup = {
        name: user.name || 'Sconosciuto',
        age: user.age || 0,
        regTime: user.regTime || 0,
        exp: user.exp || 0,
        level: user.level || 0,
        euro: user.euro || 0
    }

    let regDate = backup.regTime ? new Date(backup.regTime).toLocaleDateString('it-IT', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    }) : 'Data ignota'

    // Reset totale dei dati
    user.registered = false
    user.name = ''
    user.age = 0
    user.regTime = 0
    user.exp = 0
    user.level = 0
    user.euro = 0

    await global.db.write();

    return conn.sendMessage(m.chat, {
        text: `
   ┏━━━━━━━━━━━━━━━━━━━━━━━━┓
   ┃   🗑️  *DÖSSÏËR ËLÏMÏNÄTÖ* ┃
   ┗━━━━━━━━━━━━━━━━━━━━━━━━┛

   『 📊 』 *RIEPILOGO CANCELLAZIONE:*
   
   『 👤 』 **Profilo:** ${backup.name}
   『 📅 』 **Anzianità:** dal ${regDate}

   『 🎮 』 **Statistiche Perse:**
   • Livello: ${backup.level}
   • Esperienza: ${backup.exp.toLocaleString()} XP
   • Euro: ${backup.euro.toLocaleString()}

   ┈──────────────────┈
   _Identità ripulita. Sei fuori dal giro._
   > *Data: ${new Date().toLocaleString('it-IT')}*
   ┈──────────────────┈
`
    }, { quoted: fkontak })
}

handler.help = ['unreg']
handler.tags = ['profilo']
handler.command = /^unreg(ister)?$/i

export default handler
