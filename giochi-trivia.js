const questions = [
    {
        question: "Chi fu il padre di Melchisedec?",
        options: ["Abramo", "Noè", "Nessuno, Melchisedec non aveva padre"],
        answer: "C"
    },
    {
        question: "Qual è il nome del re che chiese di scrivere i Salmi?",
        options: ["Davide", "Salomone", "Ezechia"],
        answer: "A"
    },
    {
        question: "In quale libro della Bibbia si descrive la creazione del mondo?",
        options: ["Esodo", "Genesi", "Levitico"],
        answer: "B"
    },
    {
        question: "Quale profeta sfidò i profeti di Baal sul monte Carmelo?",
        options: ["Isaia", "Elia", "Geremia"],
        answer: "B"
    },
    {
        question: "Chi fu l'ultimo giudice d'Israele prima che si stabilisse la monarchia?",
        options: ["Samuele", "Debora", "Sansone"],
        answer: "A"
    },
    {
        question: "Quale re ordinò la costruzione del Tempio di Gerusalemme?",
        options: ["Davide", "Salomone", "Giosia"],
        answer: "B"
    },
    {
        question: "In quale libro si menziona la visione della valle dei ossa secche?",
        options: ["Isaia", "Ezechiele", "Geremia"],
        answer: "B"
    },
    {
        question: "Come si chiama la madre di Samuele?",
        options: ["Anna", "Elcana", "Rachele"],
        answer: "A"
    },
    {
        question: "Quale apostolo negò di conoscere Gesù tre volte prima del canto del gallo?",
        options: ["Pietro", "Giovanni", "Giacomo"],
        answer: "A"
    },
    {
        question: "Chi fu il primo martire cristiano?",
        options: ["Pietro", "Stefano", "Paolo"],
        answer: "B"
    },
    {
        question: "Quanti libri compongono l'Antico Testamento?",
        options: ["39", "27", "66"],
        answer: "A"
    },
    {
        question: "Qual è l'ultimo libro dell'Antico Testamento?",
        options: ["Malachia", "Zaccaria", "Isaia"],
        answer: "A"
    },
    {
        question: "Quale profeta fu inghiottito da un grande pesce?",
        options: ["Isaia", "Giona", "Elia"],
        answer: "B"
    },
    {
        question: "Chi fu l'ultimo re di Giuda prima della caduta di Gerusalemme?",
        options: ["Sedecia", "Manasse", "Giacobbe"],
        answer: "A"
    },
    {
        question: "Quale re fece fondere gli idoli d'oro durante l'uscita dall'Egitto?",
        options: ["Davide", "Salomone", "Aronne"],
        answer: "C"
    },
    {
        question: "Quale discepolo fu conosciuto come il 'discepolo amato'?",
        options: ["Pietro", "Giovanni", "Giacomo"],
        answer: "B"
    },
    {
        question: "Quale donna fu la madre di Samuele?",
        options: ["Anna", "Elcana", "Rachele"],
        answer: "A"
    },
    {
        question: "Quale libro della Bibbia contiene i Dieci Comandamenti?",
        options: ["Esodo", "Levitico", "Deuteronomio"],
        answer: "A"
    },
    {
        question: "Qual è il nome del profeta che sfidò il re Acab?",
        options: ["Isaia", "Elia", "Ezechiele"],
        answer: "B"
    },
    {
        question: "Quale apostolo fu conosciuto come il 'Doppio di cuore'?",
        options: ["Tommaso", "Matteo", "Andrea"],
        answer: "A"
    },
    {
        question: "Chi fu il re d'Israele che scrisse molti dei Proverbi?",
        options: ["Davide", "Salomone", "Ezechia"],
        answer: "B"
    },
    {
        question: "Quale re ebbe una visione di una statua con una testa d'oro?",
        options: ["Nabucodonosor", "Ciro", "Dario"],
        answer: "A"
    },
    {
        question: "Qual è il nome del leader degli israeliti che divise il Mar Rosso?",
        options: ["Mosè", "Giosuè", "Abramo"],
        answer: "A"
    },
    {
        question: "Chi fu il profeta che affrontò la regina Gezabele?",
        options: ["Elia", "Isaia", "Ezechiele"],
        answer: "A"
    },
    {
        question: "Qual è il primo libro del Nuovo Testamento?",
        options: ["Matteo", "Marco", "Luca"],
        answer: "A"
    },
    {
        question: "Quale persona fu resuscitata da Elia?",
        options: ["Il figlio della vedova di Sarepta", "Il figlio della vedova di Nain", "Lazzaro"],
        answer: "A"
    },
    {
        question: "Quale profeta visse nel ventre di un pesce per tre giorni?",
        options: ["Giona", "Elia", "Isaia"],
        answer: "A"
    },
    {
        question: "Chi fu il primo re d'Israele?",
        options: ["Davide", "Saul", "Salomone"],
        answer: "B"
    },
    {
        question: "Quale apostolo scrisse il libro dell'Apocalisse?",
        options: ["Pietro", "Giovanni", "Giacomo"],
        answer: "B"
    },
    {
        question: "In quale libro si trova la storia della Torre di Babele?",
        options: ["Genesi", "Esodo", "Levitico"],
        answer: "A"
    },
    {
        question: "Qual è il nome dell'albero da cui Eva mangiò?",
        options: ["L'albero della vita", "L'albero della conoscenza del bene e del male", "L'albero della saggezza"],
        answer: "B"
    },
    {
        question: "Chi fu il profeta che predisse la caduta di Ninive?",
        options: ["Amos", "Giona", "Isaia"],
        answer: "B"
    },
    {
        question: "Chi sviluppò la teoria della relatività?",
        options: ["Isaac Newton", "Nikola Tesla", "Albert Einstein"],
        answer: "C"
    },
    {
        question: "Quale molecola porta l'informazione genetica?",
        options: ["ADN", "ARN", "Proteine"],
        answer: "A"
    },
    {
        question: "Quale pianeta è conosciuto come il 'Pianeta Rosso'?",
        options: ["Giove", "Marte", "Saturno"],
        answer: "B"
    },
    {
        question: "Quale scienziato scoprì la legge di gravità?",
        options: ["Isaac Newton", "Albert Einstein", "Galileo Galilei"],
        answer: "A"
    },
    {
        question: "Che cos'è il bosone di Higgs?",
        options: ["Una particella subatomica", "Una legge fisica", "Un tipo di energia"],
        answer: "A"
    },
    {
        question: "Quale elemento chimico ha il simbolo 'O' nella tavola periodica?",
        options: ["Ossigeno", "Osmio", "Oro"],
        answer: "A"
    },
    {
        question: "Chi formulò la teoria dell'evoluzione per selezione naturale?",
        options: ["Charles Darwin", "Jean-Baptiste Lamarck", "Gregor Mendel"],
        answer: "A"
    },
    {
        question: "Quale fenomeno spiega l'espansione dell'universo?",
        options: ["Teoria della relatività", "Teoria del Big Bang", "Teoria quantistica"],
        answer: "B"
    },
    {
        question: "Quale tipo di cellula è responsabile della fotosintesi nelle piante?",
        options: ["Cellule epiteliali", "Cellule muscolari", "Cellule vegetali"],
        answer: "C"
    },
    {
        question: "Qual è l'unità di base della vita?",
        options: ["L'atomo", "La cellula", "L'organo"],
        answer: "B"
    },
    {
        question: "Quale gas è più abbondante nell'atmosfera terrestre?",
        options: ["Ossigeno", "Azoto", "Diossido di carbonio"],
        answer: "B"
    },
    {
        question: "In quale parte della cellula avviene la respirazione cellulare?",
        options: ["Il nucleo", "Le mitocondri", "Il citoplasma"],
        answer: "B"
    },
    {
        question: "Come si chiama il processo attraverso il quale le piante convertono la luce solare in energia?",
        options: ["Fermentazione", "Respirazione", "Fotosintesi"],
        answer: "C"
    },
    {
        question: "Quale modello astronomico descrive la Terra come il centro dell'universo?",
        options: ["Modello eliocentrico", "Modello geocentrico", "Modello della relatività"],
        answer: "B"
    },
    {
        question: "Che cos'è la teoria delle stringhe?",
        options: ["Una teoria sull'origine dell'universo", "Una teoria sulle particelle subatomiche", "Una teoria sulla gravità"],
        answer: "B"
    },
    {
        question: "Quale pianeta ha gli anelli più conosciuti?",
        options: ["Giove", "Saturno", "Urano"],
        answer: "B"
    },
    {
        question: "Chi scoprì la struttura dell'ADN?",
        options: ["James Watson e Francis Crick", "Louis Pasteur", "Marie Curie"],
        answer: "A"
    },
    {
        question: "Che cos'è la teoria della relatività generale?",
        options: ["Una teoria della gravità", "Una teoria dell'origine dell'universo", "Una teoria sulle particelle subatomiche"],
        answer: "A"
    },
    {
        question: "Che cos'è un buco nero?",
        options: ["Un fenomeno che assorbe tutto ciò che gli sta intorno", "Una stella morente", "Una nube di gas e polvere"],
        answer: "A"
    },
    {
        question: "In quale parte dell'atomo si trovano i protoni e i neutroni?",
        options: ["Nella crosta", "Nel nucleo", "Negli elettroni"],
        answer: "B"
    },
    {
        question: "Quale scienziato scoprì la penicillina?",
        options: ["Alexander Fleming", "Louis Pasteur", "Marie Curie"],
        answer: "A"
    },
    {
        question: "Come si chiama il processo che trasforma l'acqua in vapore?",
        options: ["Condensazione", "Evaporazione", "Fusione"],
        answer: "B"
    },
    {
        question: "Che cos'è un quark?",
        options: ["Una particella subatomica", "Una teoria sull'origine dell'universo", "Un tipo di energia"],
        answer: "A"
    },
    {
        question: "Qual è il principale componente delle euro?",
        options: ["Idrogeno", "Ossigeno", "Elio"],
        answer: "A"
    },
    {
        question: "Che cos'è il bosone di Higgs noto anche come 'la particella di Dio'?",
        options: ["Una particella subatomica", "Un tipo di energia", "Una legge fisica"],
        answer: "A"
    },
    {
        question: "Che cos'è l'antimateria?",
        options: ["Materia che ha proprietà opposte rispetto alle particelle comuni", "Un tipo di materia sconosciuta", "Energia che viene utilizzata nella fisica quantistica"],
        answer: "A"
    },
    {
        question: "Cosa significa il termine 'fissione nucleare'?",
        options: ["La divisione di un atomo in particelle più piccole", "La fusione di due atomi in uno", "Il rilascio di energia dagli atomi"],
        answer: "A"
    },
    {
        question: "Che cos'è un solstizio?",
        options: ["Il momento in cui il Sole è più vicino alla Terra", "Il momento in cui la Terra è più lontana dal Sole", "Il momento in cui l'inclinazione dell'asse terrestre è massima"],
        answer: "C"
    },
    {
        question: "Che cos'è la legge della conservazione della massa?",
        options: ["La massa totale in un sistema chiuso rimane costante", "La massa totale di un oggetto aumenta sempre", "La massa diminuisce sempre durante una reazione chimica"],
        answer: "A"
    },
    {
        question: "Quale elemento è conosciuto come 'gas nobile' per la sua stabilità?",
        options: ["Elio", "Neon", "Xenon"],
        answer: "A"
    },
    {
        question: "Qual è il principio che sostiene che gli atomi non possono essere creati né distrutti?",
        options: ["Legge della conservazione della massa", "Legge di gravità", "Teoria della relatività"],
        answer: "A"
    },
    {
        question: "Chi fu l'imperatore romano che divise l'Impero Romano in due parti?",
        options: ["Costantino I", "Diocleziano", "Teodosio I"],
        answer: "B"
    },
    {
        question: "Quale civiltà sviluppò il calendario maya?",
        options: ["Azteca", "Inca", "Maya"],
        answer: "C"
    },
    {
        question: "Qual è il nome della prima donna che vinse un Premio Nobel?",
        options: ["Marie Curie", "Dorothy Hodgkin", "Rosalind Franklin"],
        answer: "A"
    },
    {
        question: "Quale opera filosofica fu scritta da Immanuel Kant?",
        options: ["Critica della ragion pura", "Così parlò Zarathustra", "Il contratto sociale"],
        answer: "A"
    },
    {
        question: "Quale re francese fu conosciuto come 'Il Sole'?",
        options: ["Luigi XIV", "Luigi XVI", "Carlo I"],
        answer: "A"
    },
    {
        question: "Quale matematico greco è conosciuto per il suo teorema sui triangoli rettangoli?",
        options: ["Pitagora", "Euclide", "Archimede"],
        answer: "A"
    },
    {
        question: "Chi fu l'autore della famosa opera 'La Repubblica'?",
        options: ["Platone", "Aristotele", "Socrate"],
        answer: "A"
    },
    {
        question: "In quale battaglia si ebbe la sconfitta di Napoleone Bonaparte nel 1815?",
        options: ["Battaglia di Lipsia", "Battaglia di Waterloo", "Battaglia di Austerlitz"],
        answer: "B"
    },
    {
        question: "Quale scrittore britannico è conosciuto per la sua opera '1984'?",
        options: ["Aldous Huxley", "George Orwell", "William Blake"],
        answer: "B"
    },
    {
        question: "Quale scienziato è conosciuto per la sua teoria sui buchi neri?",
        options: ["Albert Einstein", "Stephen Hawking", "Isaac Newton"],
        answer: "B"
    },
    {
        question: "In quale guerra si scontrarono gli Stati Uniti e il Vietnam?",
        options: ["Guerra del Vietnam", "Guerra Fredda", "Guerra di Corea"],
        answer: "A"
    },
    {
        question: "Quale elemento chimico ha il simbolo 'W' nella tavola periodica?",
        options: ["Tungsteno", "Wolframio", "Wolfram"],
        answer: "A"
    },
    {
        question: "Quale filosofo greco fondò la scuola di filosofia chiamata 'Accademia'?",
        options: ["Platone", "Aristotele", "Socrate"],
        answer: "A"
    },
    {
        question: "Qual è l'opera più famosa di Miguel de Cervantes?",
        options: ["Don Chisciotte della Mancia", "La Galatea", "I lavori di Persiles e Sigismunda"],
        answer: "A"
    },
    {
        question: "Quale civiltà antica costruì le piramidi di Giza?",
        options: ["Greca", "Egizia", "Romana"],
        answer: "B"
    },
    {
        question: "Chi fu il primo essere umano a viaggiare nello spazio?",
        options: ["Yuri Gagarin", "Alan Shepard", "John Glenn"],
        answer: "A"
    },
    {
        question: "In che anno avvenne la caduta del Muro di Berlino?",
        options: ["1987", "1989", "1991"],
        answer: "B"
    },
    {
        question: "Quale scrittore statunitense è conosciuto per la sua opera 'Uccidere un usignolo'?",
        options: ["Harper Lee", "J.K. Rowling", "F. Scott Fitzgerald"],
        answer: "A"
    },
    {
        question: "Quale antico impero abbracciò gran parte del Medio Oriente, Asia Centrale e parti d'Europa?",
        options: ["Impero Mongolo", "Impero Persiano", "Impero Ottomano"],
        answer: "A"
    },
    {
        question: "Quale scienziato è conosciuto per le sue leggi sul movimento planetario?",
        options: ["Giovanni Keplero", "Galileo Galilei", "Isaac Newton"],
        answer: "A"
    },
    {
        question: "Quale antico città fu conosciuta come la 'Città dei Cesari'?",
        options: ["Roma", "Atene", "Costantinopoli"],
        answer: "C"
    },
    {
        question: "Qual è il colore del sole?",
        options: ["Giallo", "Verde", "Rosso"],
        answer: "A"
    },
    {
        question: "In quale continente si trova il Brasile?",
        options: ["Asia", "Europa", "America"],
        answer: "C"
    },
    {
        question: "Chi dipinse la Mona Lisa?",
        options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci"],
        answer: "C"
    },
    {
        question: "Quanti giorni ha un anno?",
        options: ["365", "366", "364"],
        answer: "A"
    },
    {
        question: "Qual è l'animale più grande del mondo?",
        options: ["Elefante", "Balena azzurra", "Rinoceronte"],
        answer: "B"
    },
    {
        question: "Quale sport si gioca con una palla rotonda?",
        options: ["Baseball", "Calcio", "Tennis"],
        answer: "B"
    },
    {
        question: "Chi è l'attuale presidente degli Stati Uniti? (2023)",
        options: ["Donald Trump", "Joe Biden", "Barack Obama"],
        answer: "B"
    },
    {
        question: "In quale mese si celebra la Festa della Mamma nella maggior parte dei paesi?",
        options: ["Maggio", "Aprile", "Giugno"],
        answer: "A"
    },
    {
        question: "Come si chiama il personaggio principale del film 'Frozen'?",
        options: ["Elsa", "Anna", "Raperonzolo"],
        answer: "A"
    },
    {
        question: "Qual è la lingua ufficiale del Brasile?",
        options: ["Spagnolo", "Portoghese", "Inglese"],
        answer: "B"
    },
    {
        question: "Qual è la capitale della Francia?",
        options: ["Londra", "Roma", "Parigi"],
        answer: "C"
    },
    {
        question: "Quanti continenti ci sono nel mondo?",
        options: ["5", "6", "7"],
        answer: "C"
    },
    {
        question: "Qual è il nome del primo pianeta del sistema solare?",
        options: ["Venere", "Mercurio", "Marte"],
        answer: "B"
    },
    {
        question: "In quale città si trova la Torre Eiffel?",
        options: ["Roma", "Parigi", "Londra"],
        answer: "B"
    },
    {
        question: "Quale animale è conosciuto per la sua lentezza e il suo guscio?",
        options: ["Coniglio", "Tartaruga", "Cane"],
        answer: "B"
    },
    {
        question: "In che anno ebbe inizio la Prima Guerra Mondiale?",
        options: ["1912", "1914", "1916"],
        answer: "B"
    },
    {
        question: "Qual è la capitale dell'Australia?",
        options: ["Sydney", "Melbourne", "Canberra"],
        answer: "C"
    },
    {
        question: "Quale autore scrisse il romanzo 'Uccidere un usignolo'?",
        options: ["Harper Lee", "J.K. Rowling", "F. Scott Fitzgerald"],
        answer: "A"
    },
    {
        question: "Qual è l'animale terrestre più grande?",
        options: ["Elefante africano", "Rinoceronte bianco", "Orso polare"],
        answer: "A"
    },
    {
        question: "In quale continente si trova il deserto del Sahara?",
        options: ["Asia", "Africa", "America"],
        answer: "B"
    },
    {
        question: "Chi dipinse la famosa opera 'La notte stellata'?",
        options: ["Pablo Picasso", "Vincent van Gogh", "Claude Monet"],
        answer: "B"
    },
    {
        question: "Quale nome riceve l'apparecchio che misura la temperatura?",
        options: ["Termometro", "Barometro", "Igrometro"],
        answer: "A"
    },
    {
        question: "Quale paese ha la popolazione più alta del mondo?",
        options: ["India", "Cina", "Stati Uniti"],
        answer: "B"
    },
    {
        question: "Chi fu il primo uomo a camminare sulla Luna?",
        options: ["Yuri Gagarin", "Neil Armstrong", "Buzz Aldrin"],
        answer: "B"
    },
    {
        question: "Qual è il fiume più lungo del mondo?",
        options: ["Nilo", "Amazonas", "Yangtsé"],
        answer: "A"
    },
    {
        question: "In che anno terminò la Seconda Guerra Mondiale?",
        options: ["1945", "1950", "1960"],
        answer: "A"
    },
    {
        question: "Chi è il creatore della teoria dell'evoluzione?",
        options: ["Albert Einstein", "Isaac Newton", "Charles Darwin"],
        answer: "C"
    },
    {
        question: "Come si chiama il continente che è completamente coperto di ghiaccio?",
        options: ["Antartide", "Asia", "Africa"],
        answer: "A"
    },
    {
        question: "Qual è il simbolo chimico dell'oro?",
        options: ["Ag", "Au", "O"],
        answer: "B"
    },
    {
        question: "Cosa significa l'acronimo 'ONU'?",
        options: ["Organizzazione Nazionale Unita", "Organizzazione delle Nazioni Unite", "Organizzazione per l'Unità delle Nazioni"],
        answer: "B"
    },
    {
        question: "Qual è la capitale della Spagna?",
        options: ["Barcellona", "Madrid", "Siviglia"],
        answer: "B"
    },
    {
        question: "Quale sport si gioca con una palla e un cerchio in un campo?",
        options: ["Calcio", "Pallacanestro", "Baseball"],
        answer: "B"
    },
    {
        question: "In quale continente si trova il paese d'Egitto?",
        options: ["Asia", "Europa", "Africa"],
        answer: "C"
    },
    {
        question: "Chi fu il primo presidente del Messico?",
        options: ["Benito Juárez", "Porfirio Díaz", "Agustín de Iturbide"],
        answer: "C"
    },
    {
        question: "Quale gas costituisce la maggior parte dell'atmosfera terrestre?",
        options: ["Ossigeno", "Azoto", "Diossido di carbonio"],
        answer: "B"
    },
    {
        question: "Quale paese inventò la pizza?",
        options: ["Italia", "Francia", "Spagna"],
        answer: "A"
    },
    {
        question: "In che anno fu firmata la Costituzione degli Stati Uniti?",
        options: ["1776", "1787", "1791"],
        answer: "B"
    },
    {
        question: "Chi è il dio del tuono nella mitologia nordica?",
        options: ["Ercole", "Thor", "Giove"],
        answer: "B"
    },
    {
        question: "Chi dipinse il famoso affresco 'La creazione di Adamo'?",
        options: ["Leonardo da Vinci", "Michelangelo", "Raffaello"],
        answer: "B"
    },
    {
        question: "Qual è il continente più grande del pianeta?",
        options: ["Africa", "Asia", "America"],
        answer: "B"
    },
    {
        question: "Quale paese è famoso per la torre Eiffel?",
        options: ["Italia", "Francia", "Regno Unito"],
        answer: "B"
    },
    {
        question: "Qual è la moneta del Giappone?",
        options: ["Yuan", "Yen", "Won"],
        answer: "B"
    },
    {
        question: "Quale città fu sede dei Giochi Olimpici nel 2008?",
        options: ["Londra", "Pechino", "Sydney"],
        answer: "B"
    },
    {
        question: "Quale nome riceve il processo attraverso il quale le piante producono il loro cibo?",
        options: ["Fotosintesi", "Respirazione", "Traspirazione"],
        answer: "A"
    },
    {
        question: "Chi fu l'ultimo imperatore romano d'Occidente?",
        options: ["Romolo Augustolo", "Costantino", "Teodosio"],
        answer: "A"
    },
    {
        question: "Quale scienziato formulò le leggi del movimento planetario?",
        options: ["Giovanni Keplero", "Galileo Galilei", "Isaac Newton"],
        answer: "A"
    },
    {
        question: "In quale battaglia fu sconfitto Napoleone Bonaparte nel 1815?",
        options: ["Battaglia di Lipsia", "Battaglia di Waterloo", "Battaglia di Austerlitz"],
        answer: "B"
    },
    {
        question: "Quale scrittore britannico è conosciuto per la sua opera '1984'?",
        options: ["George Orwell", "Aldous Huxley", "H.G. Wells"],
        answer: "A"
    },
    {
        question: "Qual è il paese più piccolo del mondo?",
        options: ["Monaco", "Città del Vaticano", "San Marino"],
        answer: "B"
    },
    {
        question: "Quale inventore è conosciuto per aver creato la lampadina elettrica?",
        options: ["Nikola Tesla", "Thomas Edison", "Alexander Graham Bell"],
        answer: "B"
    },
    {
        question: "In che anno fu fondata la città di Roma?",
        options: ["753 a.C.", "509 a.C.", "300 a.C."],
        answer: "A"
    },
    {
        question: "Quale filosofo greco fondò la scuola di filosofia chiamata 'Accademia'?",
        options: ["Aristotele", "Platone", "Socrate"],
        answer: "B"
    },
    {
        question: "Quale guerra ebbe luogo tra il 1950 e il 1953 nella penisola coreana?",
        options: ["Guerra Fredda", "Guerra del Vietnam", "Guerra di Corea"],
        answer: "C"
    },
    {
        question: "Chi fu il primo uomo a effettuare una passeggiata spaziale?",
        options: ["Neil Armstrong", "Yuri Gagarin", "Alexei Leonov"],
        answer: "C"
    },
    {
        question: "Qual è l'unico continente che non ha rettili nativi?",
        options: ["Asia", "Antartide", "Europa"],
        answer: "B"
    },
    {
        question: "Quale scrittore russo è conosciuto per le sue opere 'I fratelli Karamazov' e 'Delitto e castigo'?",
        options: ["Antón Chéjov", "Leone Tolstoj", "Fiódor Dostoevskij"],
        answer: "C"
    },
    {
        question: "Chi fu il primo presidente degli Stati Uniti?",
        options: ["Abraham Lincoln", "Thomas Jefferson", "George Washington"],
        answer: "C"
    },
    {
        question: "Quale filosofo fu il maestro di Alessandro Magno?",
        options: ["Aristotele", "Platone", "Socrate"],
        answer: "A"
    },
    {
        question: "Quale paese è conosciuto come la 'Terra degli Inca'?",
        options: ["Colombia", "Argentina", "Perù"],
        answer: "C"
    },
    {
        question: "Qual è la formula chimica dell'acido solforico?",
        options: ["HCl", "H2SO4", "NaOH"],
        answer: "B"
    },
    {
        question: "In quale continente si trova il Deserto di Atacama?",
        options: ["Africa", "America del Sud", "Asia"],
        answer: "B"
    },
    {
        question: "Qual è il terzo pianeta più vicino al Sole?",
        options: ["Venere", "Terra", "Marte"],
        answer: "B"
    },
    {
        question: "In quale paese nacque lo scrittore Franz Kafka?",
        options: ["Austria", "Repubblica Ceca", "Polonia"],
        answer: "B"
    },
    {
        question: "Quale scienziato sviluppò la teoria della relatività?",
        options: ["Niels Bohr", "Albert Einstein", "Marie Curie"],
        answer: "B"
    },
    {
        question: "Quale impero storico abbracciò gran parte del Medio Oriente, Asia Centrale e parti d'Europa?",
        options: ["Impero Ottomano", "Impero Persiano", "Impero Mongolo"],
        answer: "C"
    },
    {
        question: "Qual è l'unico metallo che è liquido a temperatura ambiente?",
        options: ["Mercurio", "Piombo", "Rame"],
        answer: "A"
    },
    {
        question: "Qual è la capitale della Mongolia?",
        options: ["Bishkek", "Ulaanbaatar", "Astana"],
        answer: "B"
    },
    {
        question: "Chi fu il leader della Rivoluzione Messicana?",
        options: ["Pancho Villa", "Emiliano Zapata", "Francisco I. Madero"],
        answer: "C"
    },
    {
        question: "In che anno fu firmata la Dichiarazione di Indipendenza degli Stati Uniti?",
        options: ["1776", "1783", "1791"],
        answer: "A"
    },
    {
        question: "Quale città fu sede dei primi Giochi Olimpici moderni nel 1896?",
        options: ["Londra", "Parigi", "Atene"],
        answer: "C"
    },
    {
        question: "Qual è la lingua ufficiale dell'Iran?",
        options: ["Arabo", "Persiano", "Turco"],
        answer: "B"
    },
    {
        question: "Qual è il fiume più lungo del mondo?",
        options: ["Amazonas", "Nilo", "Yangtsé"],
        answer: "A"
    },
    {
        question: "Chi dipinse la Mona Lisa?",
        options: ["Vincent van Gogh", "Pablo Picasso", "Leonardo da Vinci"],
        answer: "C"
    },
    {
        question: "Quanti pianeti ci sono nel sistema solare?",
        options: ["7", "8", "9"],
        answer: "B"
    },
    {
        question: "Chi scrisse 'Delitto e castigo'?",
        options: ["Fiódor Dostoevskij", "Leone Tolstoj", "Franz Kafka"],
        answer: "A"
    },
    {
        question: "Qual è l'elemento chimico con il numero atomico 92?",
        options: ["Plutonio", "Uranio", "Neptunio"],
        answer: "B"
    },
    {
        question: "In che anno cadde Costantinopoli per mano dell'Impero Ottomano?",
        options: ["1453", "1492", "1517"],
        answer: "A"
    },
    {
        question: "Quale paese ha il maggior numero di fusi orari?",
        options: ["Russia", "Francia", "Stati Uniti"],
        answer: "B"
    },
    {
        question: "Qual è la lingua ufficiale del Mozambico?",
        options: ["Portoghese", "Suajili", "Francese"],
        answer: "A"
    },
    {
        question: "Qual è la stella più vicina alla Terra dopo il Sole?",
        options: ["Alfa Centauri", "Proxima Centauri", "Sirio"],
        answer: "B"
    },
    {
        question: "Quale matematico formulò l'ultimo teorema che rimase senza prova per 358 anni?",
        options: ["Pierre de Fermat", "Leonhard Euler", "Carl Friedrich Gauss"],
        answer: "A"
    },
    {
        question: "Qual è la capitale del Bhutan?",
        options: ["Katmandu", "Thimphu", "Daca"],
        answer: "B"
    },
    {
        question: "Quale fisico sviluppò l'equazione di Schrödinger?",
        options: ["Werner Heisenberg", "Erwin Schrödinger", "Paul Dirac"],
        answer: "B"
    },
    {
        question: "Chi compose l'opera 'Il barbiere di Siviglia'?",
        options: ["Wolfgang Amadeus Mozart", "Gioachino Rossini", "Ludwig van Beethoven"],
        answer: "B"
    },
    {
        question: "In quale paese si trova la struttura megalitica di Göbekli Tepe?",
        options: ["Iraq", "Turchia", "Iran"],
        answer: "B"
    },
    {
        question: "Quale filosofo è conosciuto per la frase 'Penso, quindi esisto'?",
        options: ["Immanuel Kant", "René Descartes", "Socrate"],
        answer: "B"
    },
    {
        question: "In che anno fu scoperta la struttura dell'ADN?",
        options: ["1943", "1953", "1963"],
        answer: "B"
    },
    {
        question: "Chi è considerato il fondatore del calcolo differenziale e integrale?",
        options: ["Isaac Newton", "Gottfried Wilhelm Leibniz", "Blaise Pascal"],
        answer: "B"
    },
    {
        question: "Quale città fu capitale del Giappone prima di Tokyo?",
        options: ["Kyoto", "Osaka", "Nagasaki"],
        answer: "A"
    },
    {
        question: "In quale secolo ebbe luogo la Guerra dei Trent'Anni?",
        options: ["Secolo XVI", "Secolo XVII", "Secolo XVIII"],
        answer: "B"
    },
    {
        question: "Quale di questi paesi non è mai stato colonizzato?",
        options: ["Etiopia", "Tailandia", "Afganistan"],
        answer: "B"
    },
    {
        question: "Chi scoprì la penicillina?",
        options: ["Alexander Fleming", "Louis Pasteur", "Robert Koch"],
        answer: "A"
    },
    {
        question: "Quale imperatore romano ordinò la costruzione del Muro di Adriano?",
        options: ["Nerone", "Traiano", "Adriano"],
        answer: "C"
    },
    {
        question: "Qual è il metallo più abbondante nella crosta terrestre?",
        options: ["Ferro", "Alluminio", "Rame"],
        answer: "B"
    }
];

let triviaSessions = new Map();

let handler = async (m, { conn, usedPrefix, command, text }) => {
    
    if (command === 'trivia') {
        let randomIndex = Math.floor(Math.random() * questions.length);
        let questionData = questions[randomIndex];

        triviaSessions.set(m.chat, { 
            index: randomIndex, 
            answered: false,
            timestamp: Date.now()
        });
        
        const buttons = [
            { buttonId: `${usedPrefix}risposta A`, buttonText: { displayText: questionData.options[0] }, type: 1 },
            { buttonId: `${usedPrefix}risposta B`, buttonText: { displayText: questionData.options[1] }, type: 1 },
            { buttonId: `${usedPrefix}risposta C`, buttonText: { displayText: questionData.options[2] }, type: 1 }
        ];
        
        const buttonMessage = {
            text: `『 🎓 』 *\`Quiz di Cultura Generale\`*\n\n『 📝 』 *\`Domanda:\`* *${questionData.question}*`,
            footer: 'vare 紗 bot',
            buttons: buttons,
            headerType: 1
        };
        await conn.sendMessage(m.chat, buttonMessage, { quoted: m });
        return;
    }
    
    if (command === 'risposta') {
        const session = triviaSessions.get(m.chat);
        
        if (!session) {
            return conn.reply(m.chat, `Nessun quiz attivo. Usa *${usedPrefix}trivia* per iniziare una nuova partita.`, m);
        }

        if (session.answered) {
            return conn.reply(m.chat, `⚠️ Hai già risposto a questa domanda. Usa *${usedPrefix}trivia* per una nuova.`, m);
        }

        if (Date.now() - session.timestamp > 300000) {
            triviaSessions.delete(m.chat);
            return conn.reply(m.chat, `⌛ Il tempo per rispondere è scaduto. Usa *${usedPrefix}trivia* per iniziare di nuovo.`, m);
        }

        const questionData = questions[session.index];
        const userAnswer = text.trim().toUpperCase();
        const correctLetter = questionData.answer.toUpperCase();

        let isCorrect = (userAnswer === correctLetter);

        session.answered = true;
        triviaSessions.set(m.chat, session);

        const correctIndex = ["A", "B", "C"].indexOf(correctLetter);
        const correctOptionText = questionData.options[correctIndex];

        const feedback = isCorrect
            ? `『 🎉 』 *\`Corretto!\`* La risposta esatta è *\`"${correctOptionText}"\`*.`
            : `『 ❌ 』 *\`Sbagliato.\`* La risposta corretta era *\`"${correctOptionText}"\`*.`;

        const newGameButton = {
            buttonId: `${usedPrefix}trivia`,
            buttonText: { displayText: '🔄 Fai un altro quiz!' },
            type: 1
        };

        const buttonMessage = {
            text: feedback,
            footer: 'vare 紗 bot',
            buttons: [newGameButton],
            headerType: 1
        };
        
        await conn.sendMessage(m.chat, buttonMessage, { quoted: m });
    }
};

handler.command = /^(trivia|risposta)$/i;
handler.help = ['trivia'];
handler.tags = ['giochi'];
handler.register = true
export default handler;