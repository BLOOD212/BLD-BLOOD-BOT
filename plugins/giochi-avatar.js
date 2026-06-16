import pkg from 'canvas';
const { createCanvas } = pkg;

const catalogoUomo = [
    { id: 1, tipo: 'Giacca', modello: 'Blazer Armani Slim', costo: 1200, fas: 90, col: '#1a1a1a' },
    { id: 2, tipo: 'Giacca', modello: 'Bomber Off-White', costo: 950, fas: 85, col: '#2d3748' },
    { id: 3, tipo: 'Giacca', modello: 'Cappotto Prada Nero', costo: 2500, fas: 95, col: '#000000' },
    { id: 4, tipo: 'Scarpe', modello: 'Jordan 1 Retro High', costo: 1500, fas: 92, col: '#c53030' },
    { id: 5, tipo: 'Scarpe', modello: 'Yeezy Boost 350 V2', costo: 800, fas: 88, col: '#f6ad55' },
    { id: 6, tipo: 'Accessorio', modello: 'Rolex Submariner', costo: 9000, fas: 100, col: '#cbd5e0' },
    { id: 7, tipo: 'Accessorio', modello: 'Gucci Aviator', costo: 450, fas: 75, col: '#000000' },
    { id: 8, tipo: 'Accessorio', modello: 'Catena Versace Oro', costo: 3200, fas: 94, col: '#fbbf24' },
    { id: 9, tipo: 'Giacca', modello: 'Pelle Saint Laurent', costo: 3800, fas: 96, col: '#1a202c' },
    { id: 10, tipo: 'Scarpe', modello: 'Chelsea Bottega', costo: 1100, fas: 89, col: '#2d3748' },
    { id: 11, tipo: 'Street', modello: 'Supreme Box Logo', costo: 700, fas: 82, col: '#e53e3e' },
    { id: 12, tipo: 'Accessorio', modello: 'Cintura Hermes H', costo: 600, fas: 80, col: '#744210' },
    { id: 13, tipo: 'Street', modello: 'Cargo Off-White', costo: 900, fas: 84, col: '#4a5568' },
    { id: 14, tipo: 'Giacca', modello: 'Moncler Maya', costo: 1400, fas: 91, col: '#1a365d' },
    { id: 15, tipo: 'Scarpe', modello: 'Nike Dunk Travis', costo: 1600, fas: 93, col: '#718096' },
    { id: 16, tipo: 'Accessorio', modello: 'AP Royal Oak', costo: 15000, fas: 100, col: '#a0aec0' },
    { id: 17, tipo: 'Giacca', modello: 'Trench Burberry', costo: 1800, fas: 90, col: '#d69e2e' },
    { id: 18, tipo: 'Scarpe', modello: 'McQueen Oversized', costo: 500, fas: 85, col: '#ffffff' },
    { id: 19, tipo: 'Accessorio', modello: 'Borsello LV', costo: 1200, fas: 87, col: '#462a16' },
    { id: 20, tipo: 'Giacca', modello: 'Balenciaga Oversize', costo: 2200, fas: 92, col: '#000000' },
    { id: 21, tipo: 'Accessorio', modello: 'Bracciale Tiffany', costo: 900, fas: 86, col: '#81e6d9' },
    { id: 22, tipo: 'Scarpe', modello: 'Gucci Ace', costo: 650, fas: 88, col: '#ffffff' },
    { id: 23, tipo: 'Street', modello: 'Fear of God Tee', costo: 400, fas: 80, col: '#e2e8f0' },
    { id: 24, tipo: 'Giacca', modello: 'Varsity Celine', costo: 2500, fas: 94, col: '#1a202c' },
    { id: 25, tipo: 'Accessorio', modello: 'Chrome Hearts Ring', costo: 1300, fas: 90, col: '#718096' },
    { id: 26, tipo: 'Scarpe', modello: 'New Balance 550', costo: 400, fas: 83, col: '#f7fafc' },
    { id: 27, tipo: 'Accessorio', modello: 'Gucci Fedora', costo: 550, fas: 78, col: '#000000' },
    { id: 28, tipo: 'Street', modello: 'BAPE Camo Hoodie', costo: 600, fas: 85, col: '#48bb78' },
    { id: 29, tipo: 'Giacca', modello: 'Blazer Tom Ford', costo: 3000, fas: 98, col: '#1a202c' },
    { id: 30, tipo: 'Accessorio', modello: 'Occhiali Cartier', costo: 1100, fas: 93, col: '#fbbf24' },
    { id: 31, tipo: 'Scarpe', modello: 'Balenciaga Triple S', costo: 950, fas: 90, col: '#718096' },
    { id: 32, tipo: 'Accessorio', modello: 'Zaino MCM', costo: 800, fas: 84, col: '#d69e2e' },
    { id: 33, tipo: 'Street', modello: 'Pantalone Essentials', costo: 300, fas: 75, col: '#a0aec0' },
    { id: 34, tipo: 'Giacca', modello: 'Stone Island Field', costo: 900, fas: 88, col: '#4a5568' },
    { id: 35, tipo: 'Accessorio', modello: 'Goyard Wallet', costo: 700, fas: 86, col: '#000000' },
    { id: 36, tipo: 'Scarpe', modello: 'Raf Simons Ozweego', costo: 550, fas: 82, col: '#ffffff' },
    { id: 37, tipo: 'Accessorio', modello: 'Sciarpa LV', costo: 600, fas: 80, col: '#462a16' },
    { id: 38, tipo: 'Giacca', modello: 'Denim Dsquared2', costo: 850, fas: 87, col: '#2b6cb0' },
    { id: 39, tipo: 'Street', modello: 'New Era Lux Cap', costo: 250, fas: 70, col: '#1a202c' },
    { id: 40, tipo: 'Accessorio', modello: 'Gemelli Montblanc', costo: 400, fas: 76, col: '#cbd5e0' },
    { id: 41, tipo: 'Scarpe', modello: 'Timberland LUX', costo: 350, fas: 74, col: '#9c4221' },
    { id: 42, tipo: 'Giacca', modello: 'Cucinelli Gilet', costo: 2000, fas: 95, col: '#e2e8f0' },
    { id: 43, tipo: 'Street', modello: 'Jersey NBA Lux', costo: 300, fas: 79, col: '#c53030' },
    { id: 44, tipo: 'Accessorio', modello: 'Tag Heuer Watch', costo: 3500, fas: 92, col: '#2d3748' },
    { id: 45, tipo: 'Scarpe', modello: 'Loafers Tods', costo: 600, fas: 85, col: '#4a5568' },
    { id: 46, tipo: 'Giacca', modello: 'Canada Goose Parka', costo: 1300, fas: 89, col: '#000000' },
    { id: 47, tipo: 'Street', modello: 'Tuta Palm Angels', costo: 700, fas: 84, col: '#1a202c' },
    { id: 48, tipo: 'Accessorio', modello: 'Tiffany Silver Chain', costo: 500, fas: 81, col: '#cbd5e0' },
    { id: 49, tipo: 'Scarpe', modello: 'Fila LUX', costo: 250, fas: 72, col: '#ffffff' },
    { id: 50, tipo: 'Giacca', modello: 'Blazer Valentino', costo: 2800, fas: 96, col: '#e53e3e' }
];

const catalogoDonna = [
    { id: 1, tipo: 'Vestito', modello: 'Abito Chanel Tweed', costo: 3500, fas: 98, col: '#ffffff' },
    { id: 2, tipo: 'Vestito', modello: 'Dress Versace Seta', costo: 2800, fas: 95, col: '#f6ad55' },
    { id: 3, tipo: 'Borsa', modello: 'Birkin Hermes Mini', costo: 9000, fas: 100, col: '#7c2d12' },
    { id: 4, tipo: 'Scarpe', modello: 'Louboutin Heels', costo: 950, fas: 93, col: '#c53030' },
    { id: 5, tipo: 'Accessorio', modello: 'Tiffany Heart', costo: 4500, fas: 99, col: '#81e6d9' },
    { id: 6, tipo: 'Gonna', modello: 'Dior Plissé', costo: 1800, fas: 90, col: '#000000' },
    { id: 7, tipo: 'Borsa', modello: 'Gucci Marmont', costo: 2200, fas: 92, col: '#000000' },
    { id: 8, tipo: 'Accessorio', modello: 'Cartier Tank', costo: 5500, fas: 97, col: '#c0c0c0' },
    { id: 9, tipo: 'Scarpe', modello: 'Balenciaga Cuissard', costo: 1300, fas: 94, col: '#1a202c' },
    { id: 10, tipo: 'Vestito', modello: 'Gown Dolce&Gabbana', costo: 4200, fas: 96, col: '#e53e3e' },
    { id: 11, tipo: 'Accessorio', modello: 'Bracciale Love', costo: 6000, fas: 98, col: '#fbbf24' },
    { id: 12, tipo: 'Top', modello: 'Crop Top Prada', costo: 550, fas: 85, col: '#000000' },
    { id: 13, tipo: 'Borsa', modello: 'LV Neverfull', costo: 1900, fas: 88, col: '#744210' },
    { id: 14, tipo: 'Accessorio', modello: 'Prada Cat-Eye', costo: 400, fas: 82, col: '#000000' },
    { id: 15, tipo: 'Scarpe', modello: 'Sandali Jimmy Choo', costo: 850, fas: 89, col: '#ecc94b' },
    { id: 16, tipo: 'Vestito', modello: 'Saint Laurent Slip', costo: 2100, fas: 91, col: '#1a202c' },
    { id: 17, tipo: 'Borsa', modello: 'Lady Dior', costo: 4500, fas: 97, col: '#e2e8f0' },
    { id: 18, tipo: 'Accessorio', modello: 'Chanel J12', costo: 6500, fas: 99, col: '#ffffff' },
    { id: 19, tipo: 'Scarpe', modello: 'Golden Goose', costo: 450, fas: 80, col: '#f7fafc' },
    { id: 20, tipo: 'Gonna', modello: 'Gonna Midi Fendi', costo: 1200, fas: 88, col: '#4a5568' },
    { id: 21, tipo: 'Top', modello: 'Camicia Gucci Seta', costo: 900, fas: 87, col: '#e53e3e' },
    { id: 22, tipo: 'Accessorio', modello: 'Foulard Hermes', costo: 400, fas: 83, col: '#e53e3e' },
    { id: 23, tipo: 'Vestito', modello: 'Valentino Chiffon', costo: 3200, fas: 95, col: '#f87171' },
    { id: 24, tipo: 'Scarpe', modello: 'Gucci Jordaan', costo: 750, fas: 89, col: '#000000' },
    { id: 25, tipo: 'Borsa', modello: 'Celine Belt', costo: 2000, fas: 90, col: '#a0aec0' },
    { id: 26, tipo: 'Accessorio', modello: 'Van Cleef Earrings', costo: 3800, fas: 96, col: '#81e6d9' },
    { id: 27, tipo: 'Top', modello: 'McQueen Corset', costo: 1500, fas: 93, col: '#000000' },
    { id: 28, tipo: 'Scarpe', modello: 'Stella McCartney', costo: 600, fas: 86, col: '#4a5568' },
    { id: 29, tipo: 'Borsa', modello: 'Bottega Cassette', costo: 2500, fas: 94, col: '#48bb78' },
    { id: 30, tipo: 'Accessorio', modello: 'Bulgari Serpenti', costo: 7000, fas: 100, col: '#c53030' },
    { id: 31, tipo: 'Vestito', modello: 'Balmain Tuta', costo: 2300, fas: 92, col: '#000000' },
    { id: 32, tipo: 'Gonna', modello: 'Miu Miu Pelle', costo: 1100, fas: 88, col: '#319795' },
    { id: 33, tipo: 'Accessorio', modello: 'Cappello Jacquemus', costo: 300, fas: 78, col: '#f6ad55' },
    { id: 34, tipo: 'Scarpe', modello: 'Bottega Puddle', costo: 450, fas: 81, col: '#81e6d9' },
    { id: 35, tipo: 'Top', modello: 'Body Mugler', costo: 600, fas: 85, col: '#000000' },
    { id: 36, tipo: 'Borsa', modello: 'YSL Sac de Jour', costo: 2100, fas: 90, col: '#000000' },
    { id: 37, tipo: 'Accessorio', modello: 'Occhiali Balenciaga', costo: 350, fas: 80, col: '#1a202c' },
    { id: 38, tipo: 'Vestito', modello: 'Isabel Marant', costo: 800, fas: 84, col: '#d69e2e' },
    { id: 39, tipo: 'Scarpe', modello: 'Dr. Martens Lux', costo: 250, fas: 75, col: '#1a202c' },
    { id: 40, tipo: 'Accessorio', modello: 'Chloé Wallet', costo: 400, fas: 79, col: '#e2e8f0' },
    { id: 41, tipo: 'Top', modello: 'Off-White Tee', costo: 350, fas: 82, col: '#ffffff' },
    { id: 42, tipo: 'Gonna', modello: 'Ganni Jeans', costo: 250, fas: 76, col: '#4299e1' },
    { id: 43, tipo: 'Borsa', modello: 'Marc Jacobs Mini', costo: 400, fas: 81, col: '#e53e3e' },
    { id: 44, tipo: 'Accessorio', modello: 'MK Watch', costo: 300, fas: 74, col: '#fbbf24' },
    { id: 45, tipo: 'Vestito', modello: 'Zimmerman Maxi', costo: 1200, fas: 91, col: '#a0aec0' },
    { id: 46, tipo: 'Scarpe', modello: 'Castaner Espadrilles', costo: 150, fas: 70, col: '#d69e2e' },
    { id: 47, tipo: 'Accessorio', modello: 'Swarovski Set', costo: 250, fas: 77, col: '#81e6d9' },
    { id: 48, tipo: 'Borsa', modello: 'Jimmy Choo Clutch', costo: 900, fas: 88, col: '#a0aec0' },
    { id: 49, tipo: 'Top', modello: 'Blusa Etro', costo: 500, fas: 83, col: '#d69e2e' },
    { id: 50, tipo: 'Vestito', modello: 'Dior Alta Moda', costo: 5000, fas: 100, col: '#000000' }
];

async function generaCanvas(v) {
    const canvas = createCanvas(800, 400);
    const ctx = canvas.getContext('2d');
    let grad = ctx.createLinearGradient(0, 0, 800, 400);
    grad.addColorStop(0, '#1f2937');
    grad.addColorStop(1, '#000000');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 800, 400);
    ctx.fillStyle = v.col;
    ctx.shadowBlur = 40;
    ctx.shadowColor = 'rgba(255,255,255,0.4)';
    ctx.fillRect(60, 60, 280, 280);
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 40px Arial';
    ctx.fillText(v.modello, 400, 150);
    ctx.font = '26px Arial';
    ctx.fillStyle = '#a0aec0';
    ctx.fillText(`Categoria: ${v.tipo}`, 400, 200);
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 36px Arial';
    ctx.fillText(`Fascino: +${v.fas}`, 400, 280);
    return canvas.toBuffer('image/png');
}

let handler = async (m, { conn, args, usedPrefix, command }) => {
    let user = global.db.data.users[m.sender];
    if (!user) user = global.db.data.users[m.sender] = { euro: 10000, guardaroba: [], genere: null };

    if (command === 'avatar') {
        if (user.genere) return m.reply(`Il tuo avatar è già impostato come: ${user.genere === 'm' ? 'Uomo 🧔' : 'Donna 👩'}.`);
        return conn.sendMessage(m.chat, { 
            text: "Benvenuto nel tuo Atelier privato. Scegli il tuo stile:", 
            buttons: [
                { buttonId: '.setgenere m', buttonText: { displayText: 'Uomo 🧔' }, type: 1 },
                { buttonId: '.setgenere f', buttonText: { displayText: 'Donna 👩' }, type: 1 }
            ], footer: "Atelier Mode System v2.0" 
        }, { quoted: m });
    }

    if (command === 'setgenere') {
        let g = m.text.toLowerCase().includes('m') ? 'm' : 'f';
        user.genere = g;
        return m.reply(`Profilo salvato correttamente come: ${g === 'm' ? 'Uomo 🧔' : 'Donna 👩'}.`);
    }

    if (command === 'shopvestiti') {
        if (!user.genere) return m.reply("Prima imposta il tuo avatar con .avatar");
        let cat = user.genere === 'm' ? catalogoUomo : catalogoDonna;
        let txt = `--- BOUTIQUE ${user.genere.toUpperCase()} (50 CAPI) ---\n\n`;
        cat.forEach(v => txt += `${v.id}. ${v.modello} | ${v.fas} Fas | ${v.costo}€\n`);
        return m.reply(txt + "\n\nUsa .compravestito [ID] per acquistare.");
    }

    if (command === 'compravestito') {
        let cat = user.genere === 'm' ? catalogoUomo : catalogoDonna;
        let id = parseInt(args[0]);
        let v = cat.find(x => x.id === id);
        if (!v || user.euro < v.costo) return m.reply("Capo non trovato o fondi insufficienti.");
        user.euro -= v.costo;
        user.guardaroba.push(v);
        return m.reply(`Acquistato con successo: ${v.modello}!`);
    }

    if (command === 'armadio') {
        let v = user.guardaroba[args[0] ? parseInt(args[0]) - 1 : 0];
        if (!v) return m.reply("Il tuo armadio è vuoto. Vai nello shop!");
        let buffer = await generaCanvas(v);
        return conn.sendMessage(m.chat, { image: buffer, caption: `Outfit attivo: ${v.modello}\nFascino: +${v.fas}` }, { quoted: m });
    }
};

handler.command = ['avatar', 'setgenere', 'shopvestiti', 'compravestito', 'armadio'];
handler.tag = ["giochi"]
export default handler;
