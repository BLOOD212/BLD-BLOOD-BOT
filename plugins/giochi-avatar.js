import pkg from 'canvas';
const { createCanvas } = pkg;

const catalogoUomo = [
    { id: 1, sesso: 'm', tipo: 'giacca', modello: 'Blazer Armani Slim', costo: 1200, fas: 80, stl: 85, col: '#1a1a1a' },
    { id: 2, sesso: 'm', tipo: 'street', modello: 'Hoodie Off-White', costo: 800, fas: 60, stl: 90, col: '#000000' },
    { id: 3, sesso: 'm', tipo: 'scarpe', modello: 'Jordan 1 Retro High', costo: 1500, fas: 70, stl: 95, col: '#ff0000' },
    { id: 4, sesso: 'm', tipo: 'accessorio', modello: 'Rolex Submariner', costo: 9000, fas: 100, stl: 100, col: '#c0c0c0' },
    { id: 5, sesso: 'm', tipo: 'jeans', modello: 'Baggy Levi\'s Vintage', costo: 300, fas: 40, stl: 50, col: '#4a5568' },
    { id: 6, sesso: 'm', tipo: 'giacca', modello: 'Bomber Varsity', costo: 500, fas: 45, stl: 60, col: '#2b6cb0' },
    { id: 7, sesso: 'm', tipo: 'scarpe', modello: 'Stivaletti Chelsea', costo: 700, fas: 50, stl: 70, col: '#2d3748' },
    { id: 8, sesso: 'm', tipo: 'accessorio', modello: 'Catena Oro 24k', costo: 2500, fas: 85, stl: 80, col: '#fbbf24' },
    { id: 9, sesso: 'm', tipo: 'street', modello: 'Cargo Pants Tech', costo: 400, fas: 35, stl: 65, col: '#1a202c' },
    { id: 10, sesso: 'm', tipo: 'accessorio', modello: 'Occhiali Aviator RayBan', costo: 200, fas: 30, stl: 50, col: '#000000' },
    ...Array.from({ length: 40 }, (_, i) => ({ id: i + 11, sesso: 'm', tipo: 'varie', modello: `Capo Maschile ${i + 11}`, costo: 100 + (i * 50), fas: 10 + i, stl: 10 + i, col: '#333333' }))
];

const catalogoDonna = [
    { id: 1, sesso: 'f', tipo: 'vestito', modello: 'Abito Chanel Tweed', costo: 3500, fas: 90, stl: 95, col: '#ffffff' },
    { id: 2, sesso: 'f', tipo: 'gonne', modello: 'Gonna Dior Plissettata', costo: 1800, fas: 75, stl: 85, col: '#000000' },
    { id: 3, sesso: 'f', tipo: 'scarpe', modello: 'Décolleté Louboutin', costo: 900, fas: 85, stl: 90, col: '#ff0000' },
    { id: 4, sesso: 'f', tipo: 'accessorio', modello: 'Collana Tiffany', costo: 5000, fas: 100, stl: 100, col: '#87ceeb' },
    { id: 5, sesso: 'f', tipo: 'jeans', modello: 'Mom-Fit Gucci', costo: 1200, fas: 60, stl: 75, col: '#5a6772' },
    { id: 6, sesso: 'f', tipo: 'top', modello: 'Crop Top Prada', costo: 600, fas: 50, stl: 70, col: '#e53e3e' },
    { id: 7, sesso: 'f', tipo: 'scarpe', modello: 'Stivali Cuissard', costo: 1100, fas: 65, stl: 80, col: '#2d3748' },
    { id: 8, sesso: 'f', tipo: 'accessorio', modello: 'Borsa Birkin Mini', costo: 8000, fas: 100, stl: 100, col: '#7c2d12' },
    { id: 9, sesso: 'f', tipo: 'gonne', modello: 'Minigonna in Pelle', costo: 500, fas: 40, stl: 60, col: '#1a202c' },
    { id: 10, sesso: 'f', tipo: 'top', modello: 'Blusa Seta Versace', costo: 900, fas: 70, stl: 75, col: '#f6ad55' },
    ...Array.from({ length: 40 }, (_, i) => ({ id: i + 11, sesso: 'f', tipo: 'varie', modello: `Capo Femminile ${i + 11}`, costo: 150 + (i * 60), fas: 15 + i, stl: 15 + i, col: '#ffb6c1' }))
];

let handler = async (m, { conn, args, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender];
    if (!user) user = global.db.data.users[m.sender] = { euro: 10000, guardaroba: [], vestitoAttivo: null, genere: null };

    if (command === 'avatar') return m.reply("Scegli: .setgenere m (Uomo) o .setgenere f (Donna)");
    
    if (command === 'setgenere') {
        user.genere = args[0] === 'm' ? 'm' : 'f';
        user.guardaroba = [];
        return m.reply(`Avatar configurato come ${user.genere === 'm' ? 'Uomo' : 'Donna'}.`);
    }

    if (command === 'shopvestiti') {
        let cat = user.genere === 'm' ? catalogoUomo : catalogoDonna;
        let txt = `--- SHOP ${user.genere === 'm' ? 'UOMO' : 'DONNA'} ---\n\n`;
        cat.forEach(v => txt += `${v.id}. ${v.modello} - ${v.costo}€\n`);
        return m.reply(txt);
    }

    if (command === 'compravestito') {
        let cat = user.genere === 'm' ? catalogoUomo : catalogoDonna;
        let v = cat.find(x => x.id === parseInt(args[0]));
        if (!v || user.euro < v.costo) return m.reply("Non disponibile o fondi insufficienti.");
        user.euro -= v.costo;
        user.guardaroba.push(v);
        return m.reply(`Acquistato: ${v.modello}`);
    }

    if (command === 'armadio') {
        let v = user.guardaroba[args[0] ? parseInt(args[0]) - 1 : 0];
        if (!v) return m.reply("Armadio vuoto o capo inesistente.");
        let buffer = await generaCanvas(v);
        return conn.sendMessage(m.chat, { image: buffer, caption: `Indossato: ${v.modello}` }, { quoted: m });
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
