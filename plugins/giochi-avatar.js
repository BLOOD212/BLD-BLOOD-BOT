import pkg from 'canvas';
const { createCanvas } = pkg;

// Catalogo completo Uomo (50 capi)
const catalogoUomo = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1, sesso: 'm', tipo: i < 10 ? 'Giacca' : (i < 20 ? 'Scarpe' : 'Accessorio'),
    modello: i < 10 ? `Blazer Premium ${i + 1}` : (i < 20 ? `Sneakers Tech ${i + 1}` : `Orologio Lusso ${i + 1}`),
    costo: 500 + (i * 100), fas: 20 + i, stl: 20 + i, col: '#2d3748'
}));

// Catalogo completo Donna (50 capi)
const catalogoDonna = Array.from({ length: 50 }, (_, i) => ({
    id: i + 1, sesso: 'f', tipo: i < 10 ? 'Vestito' : (i < 20 ? 'Scarpe' : 'Accessorio'),
    modello: i < 10 ? `Abito Alta Moda ${i + 1}` : (i < 20 ? `Tacchi Glam ${i + 1}` : `Borsa Firmata ${i + 1}`),
    costo: 600 + (i * 120), fas: 25 + i, stl: 25 + i, col: '#ffb6c1'
}));

let handler = async (m, { conn, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender];
    if (!user) user = global.db.data.users[m.sender] = { euro: 10000, guardaroba: [], vestitoAttivo: null, genere: null };

    if (command === 'avatar') {
        let buttons = [
            { buttonId: '.setgenere m', buttonText: { displayText: 'Uomo 🧔' }, type: 1 },
            { buttonId: '.setgenere f', buttonText: { displayText: 'Donna 👩' }, type: 1 }
        ];
        return conn.sendMessage(m.chat, { 
            text: "Benvenuto nel tuo Atelier personale. Scegli il genere del tuo Avatar:", 
            buttons: buttons, 
            footer: "Sistema Avatar v1.0", 
            headerType: 1 
        }, { quoted: m });
    }

    if (command === 'setgenere') {
        let g = m.text.toLowerCase().includes(' m') ? 'm' : 'f';
        user.genere = g;
        user.guardaroba = [];
        return m.reply(`Avatar configurato come: ${g === 'm' ? 'Uomo 🧔' : 'Donna 👩'}. Usa .shopvestiti per vedere tutti i 50 capi dedicati.`);
    }

    if (command === 'shopvestiti') {
        if (!user.genere) return m.reply("Prima usa .avatar");
        let cat = user.genere === 'm' ? catalogoUomo : catalogoDonna;
        let txt = `--- BOUTIQUE ${user.genere === 'm' ? 'MASCHILE' : 'FEMMINILE'} (50 CAPI) ---\n\n`;
        // Mostra la lista completa
        cat.forEach(v => txt += `${v.id}. [${v.tipo}] ${v.modello} - ${v.costo}€\n`);
        return m.reply(txt);
    }

    if (command === 'compravestito') {
        let cat = user.genere === 'm' ? catalogoUomo : catalogoDonna;
        let id = parseInt(m.text.split(' ')[1]);
        let v = cat.find(x => x.id === id);
        if (!v || user.euro < v.costo) return m.reply("Capo non trovato o fondi insufficienti.");
        user.euro -= v.costo;
        user.guardaroba.push(v);
        return m.reply(`Acquistato con successo: ${v.modello}!`);
    }

    if (command === 'armadio') {
        let v = user.guardaroba[m.text.split(' ')[1] ? parseInt(m.text.split(' ')[1]) - 1 : 0];
        if (!v) return m.reply("Armadio vuoto.");
        let buffer = await generaCanvas(v);
        return conn.sendMessage(m.chat, { image: buffer, caption: `Outfit attivo: ${v.modello}\nFascino: +${v.fas}` }, { quoted: m });
    }
};

async function generaCanvas(v) {
    const canvas = createCanvas(500, 300);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#111827';
    ctx.fillRect(0, 0, 500, 300);
    ctx.fillStyle = v.col;
    ctx.fillRect(150, 50, 200, 200);
    ctx.fillStyle = '#fff';
    ctx.font = '20px Arial';
    ctx.fillText(v.modello, 20, 280);
    return canvas.toBuffer('image/png');
}

handler.command = ['avatar', 'setgenere', 'shopvestiti', 'compravestito', 'armadio'];
export default handler;
