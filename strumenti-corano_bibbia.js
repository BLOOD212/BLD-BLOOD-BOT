import fetch from 'node-fetch'

const bibliaDB = {
    "Giovanni": {
        "original": "Εὐαγγέλιον κατὰ Ἰωάννην",
        "3:16": "Dio infatti ha tanto amato il mondo da dare il suo Figlio unigenito, perché chiunque crede in lui non muoia, ma abbia la vita eterna.",
        "14:6": "Gesù gli disse: «Io sono la via, la verità e la vita. Nessuno viene al Padre se non per mezzo di me.»",
        "1:1": "In principio era il Verbo, e il Verbo era presso Dio e il Verbo era Dio.",
        "15:13": "Nessuno ha un amore più grande di questo: dare la vita per i propri amici.",
        "8:12": "Di nuovo Gesù parlò loro: «Io sono la luce del mondo; chi segue me, non camminerà nelle tenebre, ma avrà la luce della vita.»",
        "10:10": "Il ladro non viene se non per rubare, uccidere e distruggere; io sono venuto perché abbiano la vita e l'abbiano in abbondanza.",
        "16:33": "Vi ho detto queste cose, perché abbiate pace in me. Nel mondo avrete tribolazione; ma abbiate coraggio, io ho vinto il mondo.",
        "1:12": "A quanti però l'hanno accolto, ha dato potere di diventare figli di Dio: a quelli che credono nel suo nome."
    },
    "Salmi": {
        "original": "תהילים (Tehillim)", 
        "23:1": "Il Signore è il mio pastore: non manco di nulla.",
        "23:2": "Su pascoli erbosi mi fa riposare, ad acque tranquille mi conduce.",
        "23:3": "Rinfranca l'anima mia, mi guida per il giusto cammino, per amore del suo nome.",
        "1:1": "Beato l'uomo che non segue il consiglio degli empi, non indugia nella via dei peccatori e non siede in compagnia degli stolti.",
        "46:2": "Dio è per noi rifugio e forza, aiuto sempre vicino nelle angosce.",
        "119:105": "Lampada per i miei passi è la tua parola, luce sul mio cammino.",
        "91:1": "Tu che dimori al riparo dell'Altissimo e riposi all'ombra dell'Onnipotente.",
        "91:2": "Di' al Signore: «Mio rifugio e mia fortezza, mio Dio, in cui confido»."
    },
    "Matteo": {
        "original": "Εὐαγγέλιον κατὰ Ματθαῖον",
        "5:3": "Beati i poveri in spirito, perché di essi è il regno dei cieli.",
        "5:4": "Beati gli afflitti, perché saranno consolati.",
        "5:5": "Beati i miti, perché erediteranno la terra.",
        "6:33": "Cercate prima il regno di Dio e la sua giustizia, e tutte queste cose vi saranno date in aggiunta.",
        "7:7": "Chiedete e vi sarà dato; cercate e troverete; bussate e vi sarà aperto.",
        "11:28": "Venite a me, voi tutti che siete stanchi e oppressi, e io vi darò riposo.",
        "28:19": "Andate dunque e fate discepoli tutti i popoli, battezzandoli nel nome del Padre e del Figlio e dello Spirito Santo.",
        "28:20": "Insegnando loro a osservare tutto ciò che vi ho comandato. Ed ecco, io sono con voi tutti i giorni, fino alla fine del mondo."
    },
    "Proverbi": {
        "original": "מִשְלֵי שְׁלֹמֹה (Mishlei Shlomo)",
        "3:5": "Confida nel Signore con tutto il cuore e non appoggiarti sulla tua intelligenza.",
        "3:6": "Riconoscilo in tutti i tuoi passi ed egli appianerà i tuoi sentieri.",
        "16:9": "La mente dell'uomo pensa alla sua via, ma il Signore dirige i suoi passi.",
        "4:23": "Custodisci il tuo cuore con ogni cura, perché da esso sgorga la vita.",
        "18:10": "Il nome del Signore è una forte torre: il giusto vi si rifugia ed è al sicuro.",
        "22:6": "Educa il ragazzo secondo la via che deve seguire; neppure quando sarà vecchio se ne allontanerà."
    },
    "Isaia": {
        "original": "יְשַׁעְיָהוּ (Yeshayahu)",
        "40:31": "Ma quanti sperano nel Signore riacquistano forza, mettono ali come aquile, corrono senza affannarsi, camminano senza stancarsi.",
        "41:10": "Non temere, perché io sono con te; non smarrirti, perché io sono il tuo Dio. Ti rendo forte e anche ti vengo in aiuto e ti sostengo con la destra vittoriosa.",
        "53:5": "Egli è stato trafitto per i nostri delitti, schiacciato per le nostre iniquità. Il castigo che ci dà salvezza si è abbattuto su di lui; per le sue piaghe noi siamo stati guariti.",
        "9:5": "Poiché un bambino è nato per noi, ci è stato dato un figlio. Sulle sue spalle è il potere e il suo nome sarà: Consigliere mirabile, Dio potente, Padre per sempre, Principe della pace."
    },
    "Romani": {
        "original": "Πρὸς Ῥωμαίους (Pros Rhōmaious)",
        "8:28": "Del resto, noi sappiamo che tutto concorre al bene di coloro che amano Dio, che sono stati chiamati secondo il suo disegno.",
        "12:2": "Non conformatevi alla mentalità di questo secolo, ma trasformatevi rinnovando la vostra mente, per poter discernere la volontà di Dio, ciò che è buono, a lui gradito e perfetto.",
        "5:8": "Ma Dio dimostra il suo amore verso di noi perché, mentre eravamo ancora peccatori, Cristo è morto per noi.",
        "10:9": "Poiché se con la tua bocca avrai confessato Gesù come Signore e avrai creduto con il tuo cuore che Dio lo ha risuscitato dai morti, sarai salvo.",
        "6:23": "Perché il salario del peccato è la morte, ma il dono di Dio è la vita eterna in Cristo Gesù nostro Signore."
    },
    "Filippesi": {
        "original": "Πρὸς Φιλιππησίους (Pros Philippēsius)",
        "4:13": "Tutto posso in colui che mi dà forza.",
        "4:6": "Non angustiatevi per nulla, ma in ogni necessità esponete a Dio le vostre richieste con preghiere, suppliche e ringraziamenti.",
        "4:7": "E la pace di Dio, che sorpassa ogni intelligenza, custodirà i vostri cuori e i vostri pensieri in Cristo Gesù.",
        "2:3": "Non fate nulla per spirito di parte o per vana gloria, ma ciascuno con umiltà stimi gli altri superiori a se stesso."
    },
    "Efesini": {
        "original": "Πρὸς Ἐφεσίους (Pros Ephesius)",
        "2:8": "Per questa grazia infatti siete salvi mediante la fede; e ciò non viene da voi, ma è dono di Dio.",
        "4:32": "Siate invece benevoli gli uni verso gli altri, misericordiosi, perdonandovi a vicenda come Dio ha perdonato a voi in Cristo.",
        "6:10": "Per il resto, attingete forza nel Signore e nel vigore della sua potenza.",
        "3:20": "A colui che in tutto ha potere di fare molto più di quanto possiamo domandare o pensare, secondo la potenza che già opera in noi.",
        "5:1": "Fatevi dunque imitatori di Dio, quali figli carissimi."
    },
    "Geremia": {
        "original": "יִרְמְיָהוּ (Yirmeyahu)",
        "29:11": "Io conosco i progetti che ho fatto a vostro riguardo - dice il Signore - progetti di pace e non di sventura, per concedervi un futuro pieno di speranza.",
        "33:3": "Invocami e io ti risponderò e ti annunzierò cose grandi e impenetrabili, che tu non conosci.",
        "1:5": "Prima di formarti nel grembo materno, ti conoscevo, prima che tu uscissi alla luce, ti avevo consacrato."
    },
    "Luca": {
        "original": "Εὐαγγέλιον κατὰ Λουκᾶν",
        "6:31": "Ciò che volete gli uomini facciano a voi, anche voi fatelo a loro.",
        "1:37": "Nulla è impossibile a Dio.",
        "6:27": "Ma a voi che ascoltate, io dico: Amate i vostri nemici, fate del bene a coloro che vi odiano.",
        "11:9": "Ebbene io vi dico: Chiedete e vi sarà dato, cercate e troverete, bussate e vi sarà aperto.",
        "15:7": "Così, vi dico, ci sarà più gioia in cielo per un solo peccatore che si pente, che per novantanove giusti che non hanno bisogno di pentimento."
    },
    "1 Corinzi": {
        "original": "Πρὸς Κορινθίους Α΄ (Pros Korinthious A)",
        "13:4": "La carità è paziente, è benigna la carità; non è invidiosa la carità, non si vanta, non si gonfia.",
        "13:13": "Queste dunque le tre cose che rimangono: la fede, la speranza e la carità; ma di tutte più grande è la carità.",
        "16:14": "Tutto si faccia tra voi nella carità.",
        "10:13": "Nessuna tentazione vi ha colti se non umana; infatti Dio è fedele e non permetterà che siate tentati oltre le vostre forze.",
        "15:58": "Perciò, fratelli miei carissimi, state saldi, irremovibili, sempre più ricchi nell'opera del Signore, sapendo che la vostra fatica non è vana nel Signore."
    },
    "2 Corinzi": {
        "original": "Πρὸς Κορινθίους Β΄ (Pros Korinthious B)",
        "5:17": "Quindi se uno è in Cristo, è una creatura nuova; le cose vecchie sono passate, ecco ne sono nate di nuove.",
        "12:9": "Ti basta la mia grazia; la mia potenza infatti si manifesta pienamente nella debolezza.",
        "4:18": "Mentre noi non fissiamo lo sguardo sulle cose visibili, ma su quelle invisibili.",
        "9:7": "Ciascuno dia secondo quanto ha deciso nel suo cuore, non con tristezza né per forza, perché Dio ama chi dona con gioia."
    },
    "Apocalisse": {
        "original": "Ἀποκάλυψις Ἰωάννου (Apokalypsis Ioannou)",
        "21:4": "E tergerà ogni lacrima dai loro occhi; non ci sarà più la morte, né lutto, né lamento, né affanno, perché le cose di prima sono passate.",
        "3:20": "Ecco, sto alla porta e busso. Se qualcuno ascolta la mia voce e mi apre la porta, io verrò da lui, cenerò con lui ed egli con me.",
        "1:8": "Io sono l'Alfa e l'Omega, dice il Signore Dio, Colui che è, che era e che viene, l'Onnipotente!"
    },
    "Esodo": {
        "original": "שְׁמוֹת (Shemot)",
        "14:14": "Il Signore combatterà per voi, e voi starete tranquilli.",
        "33:14": "Il Signore rispose: «Io camminerò con voi e ti darò riposo».",
        "20:12": "Onora tuo padre e tua madre, perché si prolunghino i tuoi giorni nel paese che ti dà il Signore, tuo Dio."
    },
    "Genesi": {
        "original": "בְּרֵאשִׁית (Bereshit)",
        "1:1": "In principio Dio creò il cielo e la terra.",
        "1:27": "Dio creò l'uomo a sua immagine; a immagine di Dio lo creò; maschio e femmina li creò.",
        "28:15": "Ecco io sono con te e ti proteggerò dovunque tu andrai."
    },
    "Giacomo": {
        "original": "Ἰάκωβος (Iakōbos)",
        "1:5": "Se qualcuno di voi manca di sapienza, la chieda a Dio che dona a tutti generosamente e senza rinfacciare, e gli sarà data.",
        "2:17": "Così anche la fede: se non ha le opere, è morta in se stessa.",
        "4:7": "Sottomettetevi dunque a Dio; resistete al diavolo, ed egli fuggirà da voi."
    },
    "Giovanni 1": {
        "original": "Ἰωάννου Α΄ (Ioannou A)",
        "4:7": "Carissimi, amiamoci gli uni gli altri, perché l'amore è da Dio e chiunque ama è nato da Dio e conosce Dio.",
        "4:8": "Chi non ama non ha conosciuto Dio, perché Dio è amore.",
        "1:9": "Se confessiamo i nostri peccati, egli è fedele e giusto da perdonarci i peccati e purificarci da ogni iniquità."
    },
    "Pietro 1": {
        "original": "Πέτρου Α΄ (Petrou A)",
        "5:7": "Gettate in lui ogni vostra preoccupazione, perché egli ha cura di voi.",
        "2:9": "Ma voi siete una stirpe eletta, un sacerdozio regale, una nazione santa, un popolo che Dio si è acquistato perché proclami le opere meravigliose di lui che vi ha chiamato dalle tenebre alla sua mirabile luce.",
        "4:10": "Ciascuno, secondo il dono che ha ricevuto, lo metta a servizio degli altri, come buoni amministratori della multiforme grazia di Dio."
    }
}

let handler = async (m, { conn, text, args, usedPrefix, command }) => {
    const aliasesCorano = ['coran', 'islam', 'quran']
    const aliasesBibbia = ['bible', 'vangelo']

    handler.command = ['corano', 'bibbia', ...aliasesCorano, ...aliasesBibbia]

    let caption = '';
    let isButtonMessage = false;

    const wait = await m.reply('⏳ *Ricerca in corso...*')

    try {
        if (!text && !m.quoted?.text) {
            if (command === 'corano' || aliasesCorano.includes(command)) {
                const sura = Math.floor(Math.random() * 114) + 1
                const maxAya = await getMaxAyaForSura(sura)
                const aya = Math.floor(Math.random() * maxAya) + 1

                const res = await fetch(`https://api.alquran.cloud/v1/ayah/${sura}:${aya}/it.piccardo`)
                const json = await res.json()

                if (json.code !== 200) throw 'Errore nel recupero del versetto'
                caption += `\`${json.data.surah.englishName} - العربية: القرآن الكريم\`\n`
                caption += `- *Corano ${sura}:${aya}*\n\n`
                caption += `*${json.data.text}*\n`
                isButtonMessage = true;
            } else if (command === 'bibbia' || aliasesBibbia.includes(command)) {
                const libri = Object.keys(bibliaDB).filter(key => key !== 'original');
                const libroRandom = libri[Math.floor(Math.random() * libri.length)]
                const versetti = Object.keys(bibliaDB[libroRandom]).filter(key => key !== 'original');
                const versettoRandom = versetti[Math.floor(Math.random() * versetti.length)]

                const testo = bibliaDB[libroRandom][versettoRandom]
                const titoloOriginale = bibliaDB[libroRandom]['original'] || '';
                caption += `\`${libroRandom}${titoloOriginale ? ` - ${versettoRandom} - ${titoloOriginale}\`` : ''}\n\n`
                caption += `*${testo}*\n`
                isButtonMessage = true;
            }
        } else {
            if (command === 'corano' || aliasesCorano.includes(command)) {
                const [sura, aya] = text.split(':').map(v => parseInt(v))
                if (!sura || sura < 1 || sura > 114) throw 'Formato non valido. Usa: numero_sura[:numero_versetto]'

                if (aya) {
                    const res = await fetch(`https://api.alquran.cloud/v1/ayah/${sura}:${aya}/it.piccardo`)
                    const json = await res.json()

                    if (json.code !== 200) throw 'Versetto non trovato'

                    caption = `🕌 *Corano ${sura}:${aya}*\n`
                    caption += `_(${json.data.surah.englishName} - العربية: القرآن الكريم)_\n\n`
                    caption += `${json.data.text}\n`
                    isButtonMessage = true;
                } else {
                    const res = await fetch(`https://api.alquran.cloud/v1/surah/${sura}/it.piccardo`)
                    const json = await res.json()

                    if (json.code !== 200) throw 'Sura non trovata'

                    caption = `🕌 *Sura ${sura}: ${json.data.name}*\n`
                    caption += `_(${json.data.englishName} - العربية: القرآن الكريم - ${json.data.numberOfAyahs} versetti)_\n\n`
                    
                    json.data.ayahs.forEach((ayah, index) => {
                        caption += `*${index + 1}.* ${ayah.text}\n\n`
                    })
                }
            } else if (command === 'bibbia' || aliasesBibbia.includes(command)) {
                const [libro, riferimento] = text.split(' ')
                if (!libro || !riferimento || !bibliaDB[libro] || !bibliaDB[libro][riferimento]) {
                    throw 'Versetto non trovato. Usa: libro capitolo:versetto\nEs: Giovanni 3:16'
                }

                const titoloOriginale = bibliaDB[libro]['original'] || '';

                caption = `✝️ *${libro} ${riferimento}*\n`
                caption += `\`${titoloOriginale ? `${titoloOriginale}` : libro}\`\n\n`
                caption += `${bibliaDB[libro][riferimento]}\n\n`
                isButtonMessage = true;
            }
        }

        if (caption) {
            if (isButtonMessage) {
                const buttons = [
                    { buttonId: `${usedPrefix}bibbia`, buttonText: { displayText: 'Versetto Bibbia' }, type: 1 },
                    { buttonId: `${usedPrefix}corano`, buttonText: { displayText: 'Versetto Corano' }, type: 1 }
                ]
                const buttonMessage = {
                    text: caption,
                    footer: "",
                    buttons: buttons,
                    headerType: 1
                }
                await conn.sendMessage(m.chat, buttonMessage, { quoted: m })
            } else {
                await conn.reply(m.chat, caption, m)
            }
        }

    } catch (e) {
        console.error('Errore:', e)
        await m.reply('❌ Errore nella ricerca. Verifica il formato e riprova.')
    } finally {
        await conn.sendMessage(m.chat, { delete: wait.key })
    }
}

async function getMaxAyaForSura(sura) {
    try {
        const res = await fetch(`https://api.alquran.cloud/v1/surah/${sura}`)
        const json = await res.json()
        return json.data.numberOfAyahs
    } catch {
        return 20
    }
}

handler.help = ['corano [sura:aya]', 'bibbia [libro capitolo:versetto]']
handler.tags = ['strumenti']
handler.command = ['corano', 'bibbia']

export default handler