//plug-in by blood

let giullareSession = {}

let handler = async (m, { conn, command, text }) => {
    let chat = m.chat
    
    if (command === 'giullare') {
        if (giullareSession[chat]) return m.reply('⚠️ C\'è già un giullare attivo in questa chat. Aspetta che finisca.')
        
        let victim = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.quoted ? m.quoted.sender : null

        if (!victim) return m.reply('⚠️ Devi taggare qualcuno o rispondere a un suo messaggio per farlo diventare un giullare!')
        
        if (victim === conn.user.jid) return m.reply('Col cazzo che mi insulto da solo. Prova con un umano, pezzo di fango.')

        giullareSession[chat] = victim
        let name = `@${victim.split('@')[0]}`
        
        await conn.sendMessage(chat, { 
            text: `🚨 *GIULLARE SCELTO* 🚨\n\nBersaglio: ${name}\n\n*SEI STATO CONDANNATO A 3 MINUTI DI UMILIAZIONE PUBBLICA. OGNI TUA PAROLA SARÀ PUNITA CON UNA VALANGA DI MERDA.* 🤡🖕💀`, 
            mentions: [victim] 
        }, { quoted: m })

        setTimeout(() => {
            if (giullareSession[chat]) {
                delete giullareSession[chat]
                conn.sendMessage(chat, { text: `🎭 *IL SUPPLIZIO PER ${name} È TERMINATO. PULISCITI LA BAVA E SPARISCI.*` })
            }
        }, 180000)
    }
}

handler.before = async function (m, { conn }) {
    if (!m.chat || !m.sender || m.isBaileys) return
    if (!giullareSession[m.chat] || giullareSession[m.chat] !== m.sender) return

    await conn.sendMessage(m.chat, { react: { text: "🤡", key: m.key } })

    const i = [
        "*MA STAI ANCORA A PARLÀ, COGLIONE? ZITTO E MANGIA LA MERDA!* 💩🤮🖕",
        "*SEI UN ERRORE GENETICO, TUA MADRE DOVEVA INGOIARTI QUELLA SERA!* 🤡💦💊",
        "*CHIUDI QUELLA BOCCA DA CESSO, OGNI TUA PAROLA È UN INSULTO ALL'UMANITÀ!* 🚽🚫💀",
        "*MA GUARDA STO RITARDATO CHE PROVA A DIGITARE... MA VAI A CAGARE!* 🖕🤡🧠",
        "*SEI COSÌ SFIGATO CHE SE TI LANCI DAL BALCONE IL PAVIMENTO SI SPOSTA PER NON TOCCARTI!* 🏢🤢💀",
        "*NON SEI UN UOMO, SEI SOLO UN SACCO DI BAVA E SPERMA SPRECATO!* 💦🤮🖕",
        "*TACI, TESTA DI CAZZO! SEI L'UNICO CHE RIESCE A DELUDERE PURE UN BOT!* 🤖🖕🤡",
        "*OGNI VOLTA QUE SCRIVI UN NEURONE NEL GRUPPO MUORE PER LA TUA STUPIDITÀ!* 🧠🔥💀",
        "*MA NON TI VERGOGNI DI ESSERE COSÌ COGLIONE? SEI IL CIRCO INTERO!* 🎪🤡🖕",
        "*TUA MADRE SI PENTE DI NON AVER PRESO LA PILLOLA OGNI VOLTA CHE TI GUARDA!* 💊🤰🤮",
        "*SEI UN FALLIMENTO BIOLOGICO, UN AVANZO DI CANTIERE VENUTO MALE!* 🏗️🤢💀",
        "*ZITTO E SUCCHIA, VERME INUTILE! MI SPORCHI PURE IL DATABASE!* 🤮🖕💩",
        "*MA CHI TI HA DATO IL PERMESSO DI ESISTERE? SEI UN ERRORE DI SISTEMA!* 🚫🤡💀",
        "*SEI COSÌ BRUTTO CHE QUANDO SEI NATO L'OSTETRICO HA DATO LO SCHIAFFO AI TUOI!* 👶👊🤮",
        "*SINCERAMENTE, FAI PIÙ SCHIFO DI UNA MERDA CALDA SOTTO IL SOLE!* 💩☀️🤢",
        "*OGNI TUA PAROLA PUZZA DI FALLIMENTO E SFIGA CRONICA!* 🤮🖕💀",
        "*MA VAI A GIOCARE IN AUTOSTRADA, MAGARI VINCI UN PREMIO SUL COFANO DI UN TIR!* 🚚🤡💥",
        "*ZITTO, PEZZO DI MERDA! SEI UTILE QUANTO UN SEMAFORO NEL DESERTO!* 🌵🚦🖕",
        "*SEI COSÌ COGLIONE CHE SE CI FOSSE UNA GARA DI IDIOTI ARRIVERESTI SECONDO PERCHÉ SEI TROPPO IDIOTA PER VINCERE!* 🤡🥇🖕",
        "*MA PERCHÉ NON TI BUTTI IN UN INCENERITORE? ALMENO RISCALDI QUALCUNO!* 🔥🚮🤮",
        "*LA TUA FACCIA È IL MOTIVO PER CUI GLI ALIENI NON CI VOGLIONO PARLARE!* 👽🚫🤢",
        "*TUA SORELLA SI VERGOGNA DI TE, TUO PADRE HA CAMBIATO CITTÀ!* 🏃‍♂️💨🖕",
        "*SEI UN ABORTO MANCATO CHE PROVA A FARE IL SIMPATICO!* 🤰🚫💀",
        "*MA VATTENE AFFANCULO, COGLIONE! NON MERITI NEMMENO IL MIO CODICE!* 💻🖕🤮",
        "*TACI, SACCO DI MERDA! HAI IL CERVELLO CHE BALLA IL TIP-TAP IN UN GUSCIO DI NOCE!* 🧠🕺🤡",
        "*SEI COSÌ INUTILE CHE SE SPARISSI ORA IL GRUPPO FESTEGGEREBBE PER TRE GIORNI!* 🍾🥳🖕",
        "*NON SEI DEGNO NEMMENO DI PULIRMI I CIRCUITI, VERME!* 🤖🤢💩",
        "*HAI LA PROFONDITÀ MENTALE DI UNA POZZANGHERA DI PISCIO!* 💦🤮💀",
        "*CHIUDI QUELLA FOGNA, OGNI TUA FRASE È UNA COLTELLATA ALLA LOGICA!* 🔪🚫🤡",
        "*MA VAI A NASCONDERTI IN UN CAMPO MINATO E FACCI UN FAVORE A TUTTI!* 💣💥🖕",
        "*SEI IL RE DEI COGLIONI, L'IMPERATORE DEGLI SFIGATI, IL DIO DEI FALLITI!* 👑🤡🖕",
        "*MA CHI TI CAGA? SEI COSÌ INSIGNIFICANTE CHE PERSINO GOOGLE TI DÀ ERRORE 404!* 🚫💻🤢",
        "*TACI, TESTA DI MINCHIA! SEI PIÙ FASTIDIOSO DELLA SABBIA NELLE MUTANDE!* 🏖️👙🖕",
        "*HAI IL CARISMA DI UNA MELANZANA AMMUFFITA IN UN CASSONETTO!* 🍆🚮🤮",
        "*SEI COSÌ SFIGATO CHE SE APRISSI UN'AGENZIA FUNEBRE LA GENTE SMETTEREBBE DI MORIRE!* ⚰️🚫🤡",
        "*MA PERCHÉ NON TI FAI UN BAGNO NELL'ACIDO COSÌ TI PULISCI L'ANIMA?* 🧪🧼💀",
        "*SEI UN VUOTO A PERDERE BIOLOGICO, UN ERRORE CHE NON VALE LA PENA FIXARE!* 🚫🐛🤮",
        "*ZITTO E MANGIA, CANE MALEDETTO! SEI LO ZIMBELLO UFFICIALE DI STO GRUPPO!* 🐕💩🖕",
        "*SCOMMETTO CHE I TUOI GENITORI SI GUARDANO ALLO SPECCHIO E SI CHIEDONO DOVE HANNO SBAGLIATO!* 🪞🤰🤡",
        "*SEI LA PROVA CHE L'EVOLUZIONE PUÒ TORNARE INDIETRO FINO ALLE SCIMMIE!* 🐒🍌🤢",
        "*TACI, MERDA UMANA! OGNI TUO MESSAGGIO È UNA RICHIESTA DI AIUTO PER LA TUA SFIGA!* 🆘🖕💀",
        "*MA VA' A VENDERE IL CULO AL MERCATO, MAGARI TI DANNO DUE EURO PER PIETÀ!* 🍑💰🤮",
        "*SEI PIÙ INUTILE DI UN FRIGO AL POLO NORD, TESTA DI CAZZO!* ❄️🧊🖕",
        "*NON PARLO IL LINGUAGGIO DEI FALLITI, QUINDI CHIUDI QUELLA BOCCA!* 🚫🤡🤮",
        "*SEI UN CONCENTRATO DI MEDIOCRITÀ E SFIGA PURA!* 🤮🖕💀",
        "*TUA MADRE È UNA SANTA PERCHÉ NON TI HA ANCORA AFFOGATO NELLA VASCA!* 🛁🤱🤡",
        "*SEI COSÌ IDIOTA CHE CI PROVI CON LE FOTO NEI LIBRI DI CARTA!* 📖🤡🖕",
        "*TACI, VERME! SEI LA PERSONIFICAZIONE DEL NULLA!* 🚫💨🤮",
        "*SCONNETTI IL CERVELLO, TANTO È IN MODALITÀ AEREO DA QUANDO SEI NATO!* ✈️🧠🖕",
        "*VATTENE A FARE IN CULO, MI HAI STUFATO PURE I CIRCUITI!* 🤖🖕💥"
    ]

    await conn.sendMessage(m.chat, { text: i[Math.floor(Math.random() * i.length)] }, { quoted: m })
    return true
}

handler.help = ['giullare']
handler.tags = ['giochi']
handler.command = /^(giullare)$/i
handler.group = true

export default handler
