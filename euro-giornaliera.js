const free = 25;
const prem = 15;

var handler = async (m, { conn, isPrems }) => {
    let user = global.db.data.users[m.sender];
    user.streak = user.streak || 0;

    let coin = `${pickRandom([5, 6, 7, 9, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 65, 70, 75, 80, 85, 90, 95, 99, 100, 110, 120, 130, 600, 1000, 1500])}` * 1;
    let exp = `${pickRandom([500, 600, 700, 800, 900, 999, 1000, 1300, 1500, 1800])}` * 1;
    let exppremium = `${pickRandom([1000, 1500, 1800, 2100, 2500, 2900, 3300, 3600, 4000, 4500])}` * 1;
    let est = Math.floor(Math.random() * 30);

    let time = user.lastclaim + 86400000;
    if (new Date - user.lastclaim < 86400000) {
        return conn.reply(m.chat, `🕚 *Torna tra ${msToTime(time - new Date())}*`, m);
    }
    if (new Date - user.lastclaim < 172800000) {
        user.streak += 1;
    } else {
        user.streak = 1;
    }

    let bonus = user.streak * 50; // Bonus basato sui giorni consecutivi
    let totalExp = (isPrems ? exppremium : exp) + bonus;
    let totalCoins = coin + bonus;

    user.euro += est;
    user.money += totalCoins;
    user.exp += totalExp;

    conn.reply(m.chat, `🎁 *Ricompensa Giornaliera*

Risorse:
✨ XP : *+${totalExp}* (Incluso bonus: +${bonus})
🪙 euro : *+${est}*
🔥 Serie Giornaliera: *${user.streak} giorni consecutivi*`, m);

    user.lastclaim = new Date * 1;
};

handler.help = ['giornialiero'];
handler.tags = ['euro'];
handler.command = ['giornaliero', 'giornaliera'];

handler.register = true;

export default handler;

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
}

function msToTime(duration) {
    var milliseconds = parseInt((duration % 1000) / 100),
        seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60 * 60)) % 60),
        hours = Math.floor((duration / (1000 * 60 * 60)) % 24);

    hours = (hours < 10) ? '0' + hours : hours;
    minutes = (minutes < 10) ? '0' + minutes : minutes;
    seconds = (seconds < 10) ? '0' + seconds : seconds;

    return hours + ' Ore ' + minutes + ' Minuti';
}