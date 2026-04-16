import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer';

const PERCORSO_DB_NOTE = path.join(process.cwd(), 'media', 'database', 'note.json');
function caricaNoteDaFile() {
    try {
        if (fs.existsSync(PERCORSO_DB_NOTE)) {
            const dati = fs.readFileSync(PERCORSO_DB_NOTE, 'utf-8');
            return JSON.parse(dati || '{}');
        }
        return {};
    } catch (errore) {
        console.error('Errore durante il caricamento di note.json:', errore);
        return {};
    }
}

function salvaNoteSuFile(dati) {
    try {
        const dir = path.dirname(PERCORSO_DB_NOTE);
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(PERCORSO_DB_NOTE, JSON.stringify(dati, null, 2));
    } catch (errore) {
        console.error('Errore durante il salvataggio di note.json:', errore);
    }
}
const NotesInterface = ({ notes = [], action = 'list' }) => {
    const noteOrdinate = [...notes].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
    
    return React.createElement('div', {
        style: {
            width: '800px',
            height: '1280px',
            background: 'linear-gradient(135deg, #1a1a1c 0%, #000000 100%)',
            position: 'relative',
            fontFamily: 'Arial, sans-serif',
            overflow: 'hidden'
        }
    }, [
        React.createElement(BackgroundPattern, { key: 'bg' }),
        React.createElement(Header, { key: 'header' }),
        React.createElement(SearchBar, { key: 'search' }),
        React.createElement('div', {
            key: 'content',
            style: { marginTop: '220px' }
        }, 
            notes.length === 0 ? 
                React.createElement(EmptyState) : 
                React.createElement(NotesGrid, { notes: noteOrdinate })
        ),
        React.createElement(ActionButton, { key: 'action' }),
        React.createElement(NavigationBar, { key: 'nav' })
    ]);
};
const BackgroundPattern = () => {
    const dots = [];
    for (let i = 0; i < 200; i += 4) {
        for (let j = 0; j < 320; j += 4) {
            dots.push(
                React.createElement('div', {
                    key: `${i}-${j}`,
                    style: {
                        position: 'absolute',
                        left: `${i}px`,
                        top: `${j * 4}px`,
                        width: '1px',
                        height: '1px',
                        backgroundColor: 'rgba(255, 255, 255, 0.02)',
                        borderRadius: '50%',
                    }
                })
            );
        }
    }
    return React.createElement('div', null, dots);
};
const Header = () => React.createElement('div', {
    style: {
        position: 'absolute',
        top: '40px',
        left: '40px',
    }
}, React.createElement('h1', {
    style: {
        fontSize: '54px',
        fontWeight: 'bold',
        color: 'white',
        margin: 0,
        background: 'linear-gradient(90deg, #FFFFFF 0%, #E0E0E0 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
        filter: 'drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4))',
    }
}, '📝 Le Tue Note'));
const SearchBar = () => React.createElement('div', {
    style: {
        position: 'absolute',
        top: '130px',
        left: '40px',
        width: '720px',
        height: '60px',
        backgroundColor: '#1C1C1E',
        borderRadius: '30px',
        display: 'flex',
        alignItems: 'center',
        paddingLeft: '25px',
        boxSizing: 'border-box',
    }
}, React.createElement('span', {
    style: {
        fontSize: '24px',
        color: '#8E8E93',
    }
}, '🔎 Cerca una nota...'));
const NotesGrid = ({ notes }) => {
    const spazio = 25;
    const larghezzaCard = (800 - 3 * spazio) / 2;
    const altezzaCard = 200;
    
    return React.createElement('div', {
        style: {
            position: 'relative',
            width: '100%',
            padding: `0 ${spazio}px`,
            boxSizing: 'border-box',
        }
    }, notes.map((nota, index) => {
        const inCol1 = index % 2 === 0;
        const colIndex = Math.floor(index / 2);
        const xCard = inCol1 ? 0 : larghezzaCard + spazio;
        const yCard = colIndex * (altezzaCard + spazio);
        
        return React.createElement(NoteCard, {
            key: nota.id,
            nota: nota,
            index: index,
            x: xCard,
            y: yCard,
            width: larghezzaCard,
            height: altezzaCard
        });
    }));
};
const NoteCard = ({ nota, index, x, y, width, height }) => {
    const formatData = (timestamp) => {
        const data = new Date(timestamp);
        return `${data.toLocaleDateString('it-IT', { day: '2-digit', month: 'short' })}, ${data.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}`;
    };
    
    const troncaTesto = (testo, max) => {
        if (!testo) return '';
        const str = String(testo);
        return str.length > max ? str.substring(0, max) + '...' : str;
    };

    const wrapText = (text, maxLength = 80) => {
        if (!text) return '';
        const str = String(text);
        if (str.length <= maxLength) return str;
        
        const words = str.split(' ');
        let result = '';
        let currentLine = '';
        
        for (const word of words) {
            if ((currentLine + word).length <= maxLength) {
                currentLine += (currentLine ? ' ' : '') + word;
            } else {
                result += (result ? '\n' : '') + currentLine;
                currentLine = word;
            }
        }
        
        if (currentLine) {
            result += (result ? '\n' : '') + currentLine;
        }
        const lines = result.split('\n').slice(0, 2);
        if (result.split('\n').length > 2) {
            lines[1] = lines[1].substring(0, 40) + '...';
        }
        
        return lines.join('\n');
    };

    return React.createElement('div', {
        style: {
            position: 'absolute',
            left: `${x}px`,
            top: `${y}px`,
            width: `${width}px`,
            height: `${height}px`,
            background: 'linear-gradient(135deg, #2f2f31 0%, #1a1a1c 100%)',
            borderRadius: '24px',
            border: '1px solid #4a4a4a',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.5)',
            padding: '20px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
        }
    }, [
        React.createElement('div', { key: 'content' }, [
            React.createElement('h3', {
                key: 'title',
                style: {
                    fontSize: '26px',
                    fontWeight: 'bold',
                    color: 'white',
                    margin: '0 0 15px 0',
                    textShadow: '0 2px 5px rgba(0, 0, 0, 0.3)',
                }
            }, `${index + 1}. ${troncaTesto(nota.titolo || nota.title, 15)}`),
            React.createElement('p', {
                key: 'text',
                style: {
                    fontSize: '22px',
                    color: '#C0C0C0',
                    margin: 0,
                    lineHeight: '1.4',
                    whiteSpace: 'pre-line',
                }
            }, wrapText(nota.contenuto || nota.content))
        ]),
        React.createElement('div', {
            key: 'timestamp',
            style: {
                fontSize: '20px',
                color: '#8E8E93',
                marginTop: '10px',
            }
        }, formatData(nota.timestamp))
    ]);
};
const EmptyState = () => React.createElement('div', {
    style: {
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        textAlign: 'center',
        marginTop: '-100px',
    }
}, [
    React.createElement('div', {
        key: 'icon',
        style: {
            fontSize: '120px',
            marginBottom: '30px',
            opacity: '0.6',
        }
    }, '🌟'),
    React.createElement('h2', {
        key: 'title',
        style: {
            fontSize: '28px',
            fontWeight: 'bold',
            color: '#E5E5EA',
            margin: '0 0 20px 0',
        }
    }, 'Nessuna nota qui'),
    React.createElement('p', {
        key: 'subtitle',
        style: {
            fontSize: '22px',
            color: '#8E8E93',
            margin: 0,
        }
    }, 'Usa .addnota per iniziare!')
]);
const ActionButton = () => React.createElement('div', {
    style: {
        position: 'absolute',
        top: '1080px',
        right: '40px',
        width: '80px',
        height: '80px',
        borderRadius: '50%',
        background: 'radial-gradient(circle, #FFEB3B 0%, #FBC02D 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 15px 35px rgba(255, 220, 40, 0.6)',
    }
}, React.createElement('span', {
    style: {
        fontSize: '50px',
        fontWeight: 'bold',
        color: '#212121',
        lineHeight: '1',
    }
}, '➕'));
const NavigationBar = () => React.createElement('div', {
    style: {
        position: 'absolute',
        bottom: '0',
        left: '0',
        width: '100%',
        height: '100px',
    }
}, [
    React.createElement('div', {
        key: 'separator',
        style: {
            width: '100%',
            height: '1.5px',
            backgroundColor: '#3A3A3C',
            marginBottom: '15px',
        }
    }),
    React.createElement('div', {
        key: 'nav-content',
        style: {
            display: 'flex',
            height: '100%',
        }
    }, [
        React.createElement('div', {
            key: 'notes-tab',
            style: {
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
            }
        }, [
            React.createElement('span', {
                key: 'icon',
                style: { fontSize: '38px', marginBottom: '5px' }
            }, '📝'),
            React.createElement('span', {
                key: 'label',
                style: {
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#FFD60A',
                }
            }, 'Note')
        ]),
        React.createElement('div', {
            key: 'tasks-tab',
            style: {
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
            }
        }, [
            React.createElement('span', {
                key: 'icon',
                style: { fontSize: '38px', marginBottom: '5px' }
            }, '✅'),
            React.createElement('span', {
                key: 'label',
                style: {
                    fontSize: '18px',
                    fontWeight: 'bold',
                    color: '#8E8E93',
                }
            }, 'Attività')
        ])
    ])
]);
async function creaImmagineNote(notes, idUtente, action = 'list') {
    try {
        const htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="UTF-8">
            <style>
                body {
                    margin: 0;
                    padding: 0;
                    font-family: Arial, sans-serif;
                }
                * {
                    box-sizing: border-box;
                }
            </style>
        </head>
        <body>
            ${renderToStaticMarkup(React.createElement(NotesInterface, { notes, action }))}
        </body>
        </html>
        `;
        const dirTemp = './temp';
        if (!fs.existsSync(dirTemp)) {
            fs.mkdirSync(dirTemp, { recursive: true });
        }
        const htmlPath = path.join(dirTemp, `temp_${idUtente}_${Date.now()}.html`);
        fs.writeFileSync(htmlPath, htmlContent);
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const page = await browser.newPage();
        await page.setViewport({ width: 800, height: 1280 });
        await page.goto(`file://${path.resolve(htmlPath)}`);
        
        const percorsoImmagine = path.join(dirTemp, `note_${idUtente}_${Date.now()}.png`);
        await page.screenshot({
            path: percorsoImmagine,
            width: 800,
            height: 1280,
            type: 'png'
        });

        await browser.close();
        fs.unlinkSync(htmlPath);
        
        return percorsoImmagine;
    } catch (errore) {
        console.error('Errore durante la creazione dell\'immagine:', errore);
        throw errore;
    }
}
function analizzaInputNota(testo) {
    const indiceSeparatore = testo.indexOf('|');
    if (indiceSeparatore !== -1) {
        const titolo = testo.substring(0, indiceSeparatore).trim() || 'Senza titolo';
        const contenuto = testo.substring(indiceSeparatore + 1).trim() || '';
        return { titolo, contenuto };
    }
    return { titolo: testo.trim(), contenuto: '' };
}

function creaOggettoNota(titolo, contenuto, nomeCreatore, numeroCreatore) {
    return {
        id: Date.now() + Math.random(),
        nomeCreatore: nomeCreatore,
        numeroCreatore: numeroCreatore,
        timestamp: new Date().toISOString(),
        titolo: String(titolo || ''),
        contenuto: String(contenuto || '')
    };
}

function formattaMessaggioSuccesso(tipo, messaggio, dettagli = '') {
    const icone = {
        aggiunto: '✅',
        eliminato: '🗑️',
        modificato: '✍️',
        svuotato: '🧹'
    };
    return `${icone[tipo]} *${messaggio}*${dettagli ? `\n\n${dettagli}` : ''}`;
}
const handler = async (m, { conn, text, command }) => {
    let magazzinoNote = caricaNoteDaFile();
    const idUtente = m.sender;
    if (!magazzinoNote[idUtente]) {
        magazzinoNote[idUtente] = [];
    }
    const noteUtente = magazzinoNote[idUtente];

    try {
        let comandoPrincipale = '';
        let azione = 'list';
        
        if (/^(addnota|nota\+)$/i.test(command)) {
            comandoPrincipale = 'addnota';
            azione = 'add';
        } else if (/^(nota|note|listanote)$/i.test(command)) {
            comandoPrincipale = 'listanote';
            azione = 'list';
        } else if (/^(delnota|rimuovinota)$/i.test(command)) {
            comandoPrincipale = 'delnota';
            azione = 'delete';
        } else if (/^(editnota|modificanota)$/i.test(command)) {
            comandoPrincipale = 'editnota';
            azione = 'edit';
        } else if (/^(svuotanote|cancellatutto)$/i.test(command)) {
            comandoPrincipale = 'svuotanote';
            azione = 'clear';
        }

        switch (comandoPrincipale) {
            case 'addnota': {
                if (!text) return m.reply('✍️ *Come si usa:* `.addnota Titolo | Contenuto della nota`');
                const { titolo, contenuto } = analizzaInputNota(text);
                const nuovaNota = creaOggettoNota(titolo, contenuto, m.name, m.sender);
                noteUtente.unshift(nuovaNota);
                salvaNoteSuFile(magazzinoNote);

                const percorsoImmagine = await creaImmagineNote(noteUtente, idUtente, azione);
                await conn.sendFile(m.chat, percorsoImmagine, 'notes.png', 
                    formattaMessaggioSuccesso('aggiunto', 'Nota salvata!', `*Titolo:* ${nuovaNota.titolo}`), m);
                fs.unlinkSync(percorsoImmagine);
                break;
            }

            case 'listanote': {
                const percorsoImmagine = await creaImmagineNote(noteUtente, idUtente, azione);
                const didascalia = noteUtente.length > 0 ? `📂 Ecco le tue ${noteUtente.length} note.` : '🌟 Non hai ancora nessuna nota.';
                await conn.sendFile(m.chat, percorsoImmagine, 'notes.png', didascalia, m);
                fs.unlinkSync(percorsoImmagine);
                break;
            }

            case 'delnota': {
                if (!text) return m.reply('🔢 Inserisci il numero della nota da eliminare. Es: `.delnota 2`');
                const indice = parseInt(text.trim(), 10) - 1;
                const noteOrdinatePerEliminazione = [...noteUtente].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                
                if (isNaN(indice) || indice < 0 || indice >= noteOrdinatePerEliminazione.length) {
                    return m.reply(`❌ Numero non valido. Hai ${noteUtente.length} note.`);
                }
                
                const notaDaEliminare = noteOrdinatePerEliminazione[indice];
                const indiceOriginale = noteUtente.findIndex(n => n.id === notaDaEliminare.id);
                
                if (indiceOriginale === -1) {
                    return m.reply('❌ Errore interno: nota non trovata per l\'eliminazione.');
                }

                const [notaEliminata] = noteUtente.splice(indiceOriginale, 1);
                salvaNoteSuFile(magazzinoNote);

                const percorsoImmagine = await creaImmagineNote(noteUtente, idUtente, azione);
                await conn.sendFile(m.chat, percorsoImmagine, 'notes.png', 
                    formattaMessaggioSuccesso('eliminato', 'Nota eliminata.', `*Titolo:* ${notaEliminata.titolo}`), m);
                fs.unlinkSync(percorsoImmagine);
                break;
            }

            case 'editnota': {
                const [indiceStr, ...partiNuovoContenuto] = text.trim().split(' ');
                if (!indiceStr || partiNuovoContenuto.length === 0) return m.reply('✍️ *Come si usa:* `.editnota <numero> <nuovo titolo | nuovo contenuto>`');
                const indice = parseInt(indiceStr, 10) - 1;
                
                const noteOrdinatePerModifica = [...noteUtente].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

                if (isNaN(indice) || indice < 0 || indice >= noteOrdinatePerModifica.length) return m.reply(`❌ Nota #${indiceStr} non trovata.`);
                
                const notaDaModificare = noteOrdinatePerModifica[indice];
                const indiceOriginale = noteUtente.findIndex(n => n.id === notaDaModificare.id);

                if (indiceOriginale === -1) {
                    return m.reply('❌ Errore interno: nota non trovata per la modifica.');
                }

                const nuovoTesto = partiNuovoContenuto.join(' ');
                const { titolo, contenuto } = analizzaInputNota(nuovoTesto);

                noteUtente[indiceOriginale].titolo = String(titolo);
                noteUtente[indiceOriginale].contenuto = String(contenuto);
                salvaNoteSuFile(magazzinoNote);

                const percorsoImmagine = await creaImmagineNote(noteUtente, idUtente, azione);
                await conn.sendFile(m.chat, percorsoImmagine, 'notes.png', 
                    formattaMessaggioSuccesso('modificato', `Nota #${indice + 1} aggiornata!`, `*Nuovo titolo:* ${titolo}`), m);
                fs.unlinkSync(percorsoImmagine);
                break;
            }

            case 'svuotanote': {
                if (noteUtente.length === 0) return m.reply('🧹 Il tuo taccuino è già vuoto!');
                const conteggio = noteUtente.length;
                magazzinoNote[idUtente] = [];
                salvaNoteSuFile(magazzinoNote);

                const percorsoImmagine = await creaImmagineNote([], idUtente, azione);
                await conn.sendFile(m.chat, percorsoImmagine, 'notes.png', 
                    formattaMessaggioSuccesso('svuotato', `Tutte le ${conteggio} note sono state eliminate.`), m);
                fs.unlinkSync(percorsoImmagine);
                break;
            }

            default: {
                const percorsoImmagine = await creaImmagineNote(noteUtente, idUtente, azione);
                await conn.sendFile(m.chat, percorsoImmagine, 'notes.png', '', m);
                fs.unlinkSync(percorsoImmagine);
                break;
            }
        }
    } catch (errore) {
        console.error('Errore nel gestore delle note:', errore);
        m.reply('❌ Ops! Qualcosa è andato storto. Riprova.');
    }
};

handler.help = ['nota', 'addnota', 'delnota', 'editnota', 'svuotanote'];
handler.tags = ['strumenti'];
handler.command = /^(addnota|nota\+|nota|note|listanote|delnota|rimuovinota|editnota|modificanota|svuotanote|cancellatutto)$/i;

export default handler;