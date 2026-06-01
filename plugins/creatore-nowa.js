/*
* by sam aka vare
* github.com/realvare
* non togliere i crediti
*/

let handler = async (m, { conn, text, usedPrefix, command }) => {
    if (!text) throw `*👨‍💻 Usa così il comando*\n\nEsempio:\n${usedPrefix + command} +39 347 123 3xxx`;

    let countX = (text.match(/x/gi) || []).length;
    if (countX === 0) throw '❌ Devi includere almeno una "x" nel numero per la ricerca';
    if (countX > 3) throw '❌ Puoi utilizzare massimo 3 "x" per la ricerca';

    let total = Math.pow(10, countX);
    let baseNumber = text.replace(/[- ]/g, '');
    
    const BATCH_SIZE = 10;
    const UPDATE_INTERVAL = 50;
    const DELAY = 100;

    let msg = await m.reply('🔍 *Ricerca in corso...*');
    let results = [];
    let notFound = [];
    let found = 0;
    
    try {
        for (let i = 0; i < total; i += BATCH_SIZE) {
            let batch = [];
            
            for (let j = 0; j < BATCH_SIZE && (i + j) < total; j++) {
                let number = baseNumber;
                let combo = (i + j).toString().padStart(countX, '0');
                let pos = 0;
                number = number.replace(/x/gi, () => combo[pos++]);
                batch.push(number);
            }

            const batchPromises = batch.map(number => 
                Promise.race([
                    conn.onWhatsApp(number).catch(() => [{ exists: false }]),
                    new Promise(resolve => setTimeout(() => resolve([{ exists: false }]), 5000))
                ])
            );

            const batchResults = await Promise.all(batchPromises);

            for (let idx = 0; idx < batchResults.length; idx++) {
                const [result] = batchResults[idx];
                if (result?.exists) {
                    found++;
                    results.push([batch[idx], '']);
                } else { /*by sam aka vare*/
                    notFound.push(batch[idx]);
                }
            }

            await new Promise(resolve => setTimeout(resolve, DELAY));
        }

        let foundList = results.map(([num]) => `✅ wa.me/${num}`).join('\n');
        let notFoundList = notFound.map(num => `❌ ${num}`).join('\n');

        let finalMsg = `✅ *Ricerca completata!*\n┌───────────\n⁉️ *Trovati:* ${found}\n❌ *Non trovati:* ${notFound.length}\n└───────────\n\n*Numeri esistenti:*\n${foundList}\n\n*Numeri non esistenti:*\n${notFoundList}\n\n> BLD-BOT`;

        await conn.sendMessage(m.chat, {
            text: finalMsg,
            edit: msg.key
        });

    } catch (error) {
        console.error('Errore nella ricerca:', error);
        await m.reply('❌ *Errore durante la ricerca*\nRiprova più tardi.');
    }
};

handler.help = ['nowa'];
handler.tags = ['creatore', 'premium'];
handler.command = ['nowa'];
handler.owner = true;
handler.premium = true;

export default handler;