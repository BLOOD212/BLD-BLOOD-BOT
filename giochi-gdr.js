
let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!global.gdr) global.gdr = {}
    
    if (!text) {
        return m.reply(`*🎮 Mini GDR Testuale*

Scegli un'ambientazione per iniziare l'avventura:
📚 *Ambientazioni disponibili:*
• fantasy - Mondo medievale fantasy
• cyberpunk - Futuro distopico
• horror - Atmosfera dark/horror
• apocalisse - Mondo post-apocalittico
• spazio - Esplorazione spaziale
• western - Far West

*Uso:* ${usedPrefix + command} <ambientazione>
*Esempio:* ${usedPrefix + command} fantasy`)
    }

    const settings = {
        'fantasy': {
            name: 'Fantasy Medieval',
            intro: `Ti trovi nel regno di Eldoria, una terra di magia e misteri. 
Sei un avventuriero appena arrivato nel villaggio di Willowbrook.
Davanti a te vedi:
1️⃣ La locanda del Drago Dormiente
2️⃣ La bottega del fabbro
3️⃣ Il sentiero verso la foresta oscura`,
            options: {
                '1': {
                    text: 'Entri nella locanda. Un gruppo di mercenari sta discutendo di una missione urgente...',
                    choices: `
1️⃣ Offri il tuo aiuto ai mercenari
2️⃣ Ascolta di nascosto la conversazione
3️⃣ Ordina da bere e parli con l'oste`
                },
                '2': {
                    text: 'Il fabbro sta forgiando una spada misteriosa. Ti guarda e dice di aver bisogno di aiuto...',
                    choices: `
1️⃣ Aiutalo con la forgiatura
2️⃣ Chiedi della spada misteriosa
3️⃣ Offri di comprare la spada`
                },
                '3': {
                    text: 'Ti avventuri nella foresta. Tra gli alberi scorgi delle rovine antiche...',
                    choices: `
1️⃣ Esplora le rovine
2️⃣ Segui le tracce fresche vicino all'entrata
3️⃣ Cerca erbe rare nei dintorni`
                }
            }
        },
        'cyberpunk': {
            name: 'Neo Tokyo 2077',
            intro: `Ti risvegli in un vicolo di Neo Tokyo, la pioggia acida cade sui neon della città.
I tuoi impianti cibernetici segnalano pericolo. Puoi:
1️⃣ Hackerare il terminal più vicino
2️⃣ Contattare il tuo fixer
3️⃣ Investigare il segnale sospetto`,
            options: {
                '1': 'Mentre hacker il terminale, un\'IA ostile cerca di tracciare la tua posizione...',
                '2': 'Il fixer ti offre una missione ad alto rischio ma ben pagata...',
                '3': 'Seguendo il segnale trovi un laboratorio corporativo segreto...'
            }
        },
        'horror': {
            name: 'Silent Manor',
            intro: `Ti ritrovi in una vecchia villa abbandonata, è notte fonda.
Senti strani rumori e vedi:
1️⃣ Una porta socchiusa con una luce tremolante
2️⃣ Scale che portano in cantina
3️⃣ Una finestra che si apre da sola`,
            options: {
                '1': 'Nella stanza trovi un diario che rivela oscuri segreti...',
                '2': 'In cantina scopri rituali occulti incompiuti...',
                '3': 'Qualcosa di non umano ti osserva dall\'esterno...'
            }
        },
        'apocalisse': {
            name: 'Wasteland 2045',
            intro: `Il mondo è in rovina dopo il grande collasso.
Sei un sopravvissuto nel deserto radioattivo. Devi:
1️⃣ Cercare rifornimenti in una città fantasma
2️⃣ Seguire il segnale radio di altri sopravvissuti
3️⃣ Esplorare un bunker militare abbandonato`,
            options: {
                '1': 'La città è infestata da predatori mutanti...',
                '2': 'Il segnale proviene da una trappola di predoni...',
                '3': 'Nel bunker trovi tecnologia pre-apocalisse funzionante...'
            }
        },
        'spazio': {
            name: 'Space Explorer 3000',
            intro: `Sei il capitano della nave stellare "Aurora".
Un'anomalia spaziale appare davanti a te:
1️⃣ Analizza l'anomalia con i sensori
2️⃣ Invia una squadra di ricognizione
3️⃣ Cerca di comunicare con l'anomalia`,
            options: {
                '1': {
                    text: 'I sensori rilevano una struttura aliena all\'interno dell\'anomalia...',
                    choices: `
1️⃣ Attiva gli scudi e procedi con cautela
2️⃣ Invia un drone di ricognizione
3️⃣ Tenta un contatto radio`
                },
                '2': {
                    text: 'La squadra trova una nave aliena abbandonata...',
                    choices: `
1️⃣ Esplora l'interno della nave
2️⃣ Recupera la scatola nera
3️⃣ Attiva i sistemi di emergenza`
                },
                '3': {
                    text: 'Ricevi un messaggio criptato in risposta...',
                    choices: `
1️⃣ Tenta di decifrare il messaggio
2️⃣ Chiedi aiuto alla base stellare
3️⃣ Ignora e procedi con l'esplorazione`
                }
            }
        },
        'western': {
            name: 'Wild West Chronicles',
            intro: `È il 1875, sei appena arrivato nella città di Dustville.
Il sole tramonta e devi decidere:
1️⃣ Entra nel saloon locale
2️⃣ Visita l'ufficio dello sceriffo
3️⃣ Cerca una stanza nell'hotel`,
            options: {
                '1': {
                    text: 'Nel saloon c\'è una partita di poker molto tesa...',
                    choices: `
1️⃣ Partecipa alla partita
2️⃣ Osserva da lontano
3️⃣ Parla con il barista`
                },
                '2': {
                    text: 'Lo sceriffo ha un lavoro da proporti: cacciare una banda di fuorilegge...',
                    choices: `
1️⃣ Accetta l'incarico
2️⃣ Chiedi più dettagli
3️⃣ Rifiuta educatamente`
                },
                '3': {
                    text: 'Nell\'hotel senti rumori sospetti dal piano superiore...',
                    choices: `
1️⃣ Investiga i rumori
2️⃣ Avvisa il proprietario
3️⃣ Ignora e vai a dormire`
                }
            }
        }
    }

    const sessionId = m.chat
    if (global.gdr[sessionId]) {
        if (['1', '2', '3'].includes(text)) {
            const choice = text
            const setting = global.gdr[sessionId].setting
            const stage = global.gdr[sessionId].stage || 'intro'
            const previousChoice = global.gdr[sessionId].lastChoice || ''
            
            if (stage === 'intro') {
                const nextChoice = settings[setting].options[choice]
                global.gdr[sessionId].stage = 'level2'
                global.gdr[sessionId].lastChoice = choice
                
                await m.reply(`*🎲 La tua avventura continua:*\n\n${nextChoice.text}\n\n${nextChoice.choices}\n\n*Scegli la tua prossima azione (1-3)*`)
                return
            }
            
            if (stage === 'level2') {
                let ending = ''
                const endings = {
                    'fantasy': {
                        '1': { // Locanda
                            '1': 'Ti unisci ai mercenari e inizi una grande avventura. La missione si rivela essere la ricerca di un antico artefatto magico. Dopo settimane di viaggio e pericoli, il gruppo ha successo e vieni ricompensato generosamente. La tua reputazione cresce in tutto il regno!',
                            '2': 'Ascoltando di nascosto, scopri un complotto per rovesciare il re. Decidi di avvertire la guardia reale e diventi un eroe nell\'ombra, ricevendo una posizione come spia di corte.',
                            '3': 'L\'oste si rivela essere un ex-avventuriero in pensione. Ti prende sotto la sua ala e ti insegna preziosi segreti del mestiere. Apri la tua locanda che diventa famosa in tutto il regno!'
                        },
                        '2': { // Fabbro
                            '1': 'Aiutando il fabbro, impari l\'antica arte della forgiatura magica. La spada che aiuti a creare diventa leggendaria e la tua fama si diffonde nel regno.',
                            '2': 'La spada è maledetta! Ma grazie alla tua curiosità, scopri come spezzare la maledizione e diventi un esperto di artefatti maledetti.',
                            '3': 'Riesci a comprare la spada dopo aver completato una missione pericolosa. L\'arma si rivela essere l\'antica spada di un eroe dimenticato!'
                        },
                        '3': { // Foresta
                            '1': 'Nelle rovine scopri un portale per un regno fatato. Diventi un ambasciatore tra i due mondi!',
                            '2': 'Le tracce ti conducono a un drago ferito. Lo aiuti e guadagni un potente alleato!',
                            '3': 'Trovi un\'erba rarissima che salva la vita del re. Vieni nominato erborista reale!'
                        }
                    },
                    'cyberpunk': {
                        '1': {
                            '1': 'Hackeri con successo il sistema corporativo e liberi informazioni che cambiano il mondo!',
                            '2': 'Trovi prove di esperimenti illegali. Diventi un informatore ricercato ma rispettato.',
                            '3': 'Riesci a rubare tecnologia all\'avanguardia e diventi un potente netrunner indipendente.'
                        }
                    }
                }

                const finalEnding = endings[setting]?.[previousChoice]?.[choice] || 
                    'La tua avventura si conclude in modo memorabile... ma questa è un\'altra storia!'

                await m.reply(`*🎭 IL TUO DESTINO SI COMPIE!*\n\n${finalEnding}\n\n*Fine della storia!*\n\nUsa ${usedPrefix + command} per iniziare una nuova avventura.`)
                delete global.gdr[sessionId]
                return
            }
        }
    }
    if (!text) {
        return m.reply(`*🎮 Mini GDR Testuale*

Scegli un'ambientazione per iniziare l'avventura:
📚 *Ambientazioni disponibili:*
• fantasy - Mondo medievale fantasy
• cyberpunk - Futuro distopico
• horror - Atmosfera dark/horror
• apocalisse - Mondo post-apocalittico
• spazio - Esplorazione spaziale
• western - Far West

*Uso:* ${usedPrefix + command} <ambientazione>
*Esempio:* ${usedPrefix + command} fantasy`)
    }

    const setting = text.toLowerCase()
    if (!settings[setting]) {
        return m.reply('❌ Ambientazione non valida. Usa il comando senza argomenti per vedere le opzioni disponibili.')
    }
    global.gdr[sessionId] = {
        setting: setting,
        stage: 'intro',
        player: m.sender
    }
    const intro = `*🎮 ${settings[setting].name}*\n\n${settings[setting].intro}\n\n*Rispondi con un numero (1-3) per continuare l'avventura...*`
    
    await m.reply(intro)
    setTimeout(() => {
        if (global.gdr[sessionId]) {
            delete global.gdr[sessionId]
            m.reply('⏰ *Tempo scaduto!* L\'avventura è terminata per inattività.')
        }
    }, 5 * 60 * 1000)
}

handler.help = ['gdr <ambientazione>']
handler.tags = ['giochi']
handler.command = /^(gdr)$/i

export default handler