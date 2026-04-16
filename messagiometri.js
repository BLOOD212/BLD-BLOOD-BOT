// reward.js - Ricompense automatiche per messaggi
let handler = m => m

handler.before = async function (m, { conn }) {
    // Impedisce al bot di auto-premiarsi o di contare messaggi fuori dai gruppi (opzionale)
    if (!m.chat || m.isBaileys || !m.text) return 

    // Assicurati che l'utente esista nel database globale
    if (!global.db.data.users[m.sender]) {
        global.db.data.users[m.sender] = { 
            money: 0, 
            messaggi: 0, 
            name: m.pushName || 'Utente' 
        }
    }

    let user = global.db.data.users[m.sender]
    
    // Incrementa il contatore messaggi globale dell'utente
    user.messaggi = (user.messaggi || 0) + 1

    // Logica della ricompensa: ogni 350 messaggi
    if (user.messaggi > 0 && user.messaggi % 350 === 0) {
        // Premio: 1/5 del totale messaggi (es. a 350 messaggi ricevi 70€)
        let reward = Math.floor(user.messaggi / 5)
        
        user.money = (user.money || 0) + reward
        
        let caption = `🎉 *𝗥𝗜𝗖𝗢𝗠𝗣𝗘𝗡𝗦𝗔 𝗠𝗘𝗦𝗦𝗔𝗚𝗚𝗜!*\n\n`
        caption += `Complimenti @${m.sender.split('@')[0]}!\n`
        caption += `Hai raggiunto un totale di *${user.messaggi}* messaggi inviati.\n\n`
        caption += `💰 Ti sono stati accreditati: *+${reward}€*`

        await conn.sendMessage(m.chat, {
            text: caption,
            mentions: [m.sender]
        }, { quoted: m })
    }

    return true
}

export default handler
