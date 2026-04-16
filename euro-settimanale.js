const we = 5000;
const cooldown = 604800000; // 1 settimana

let handler = async (m, { conn }) => {
    if (!m.isGroup) return m.reply("❌ Questo comando può essere usato solo nei gruppi.");

    let user = global.db.data.users[m.sender] || {};
    user.weekly = user.weekly || 0;
    user.dailyActivity = user.dailyActivity || [];
    user.lastActivity = user.lastActivity || 0;
    const today = new Date().toDateString();
    if (today !== new Date(user.lastActivity).toDateString()) {
        user.dailyActivity.push(today);
        user.lastActivity = new Date().getTime();
        if (user.dailyActivity.length > 7) {
            user.dailyActivity.shift();
        }
    }
    const uniqueDays = new Set(user.dailyActivity).size;
    if (uniqueDays >= 7 && new Date() - user.weekly >= cooldown) {
        const bonuseuro = Math.floor(Math.random() * 2) + 2; // 2-3 euro extraw
        const bonusExp = Math.floor(Math.random() * 200) + 200; // 200-400 exp extra

        daiRegaloSettimanale(m, user, true, bonuseuro, bonusExp);
        user.dailyActivity = []; // Reset attività
        return;
    }
    if (new Date() - user.weekly >= cooldown) {
        daiRegaloSettimanale(m, user, false);
        return;
    }
    const tempoRimanente = msToTime((user.weekly + cooldown) - new Date());
    const giorniMancanti = 7 - uniqueDays;
    
    m.reply(`
╭━『 🎁 PREMIO SETTIMANALE 』
┃                          
┃ ⏱️ Prossimo: *${tempoRimanente}*
┃ 📅 Giorni di attività: *${uniqueDays}/7*
┃ *${giorniMancanti > 0 ? `🎯 Ancora ${giorniMancanti} giorni per il bonus!` : '✨ Bonus sbloccato!'}*
┃                          
╰━━━━━━━━━━━━━━━`);
}

handler.help = ['settimanale'];
handler.tags = ['euro'];
handler.command = ['settimanale', 'weekly'];

export default handler;
export function daiRegaloSettimanale(m, user, hasBonus = false, bonuseuro = 0, bonusExp = 0) {
    let euroReward = pickRandom([1, 2, 3]) + (hasBonus ? bonuseuro : 0);
    let expReward = pickRandom([100, 200, 300]) + (hasBonus ? bonusExp : 0);

    user.coin = (user.coin || 0) + we;
    user.euro = (user.euro || 0) + euroReward;
    user.exp = (user.exp || 0) + expReward;

    if (m) {
        m.reply(`
╭━『 🎁 PREMIO SETTIMANALE 』
┃                          
┃ 🎉 *${hasBonus ? 'PREMIO BONUS ATTIVITÀ!' : 'Premio settimanale!'}*
┃                          
┃ 🪙 *Monete* : *+${we.toLocaleString()}*
┃ 🌟 *euro* : *+${euroReward}*
┃ ✨ *Esperienza* : *+${expReward}*
┃                          
┃  *${hasBonus ? `┃ 🎯 Bonus per 7 giorni di attività!*
┃ 💫 euro extra: *+${bonuseuro}*
┃ 📈 Exp extra: *+${bonusExp}` : ''}*
╰━━━━━━━━━━━━`);
    }

    user.weekly = new Date() * 1;
}

function pickRandom(list) {
    return list[Math.floor(Math.random() * list.length)];
}

function msToTime(duration) {
    var days = Math.floor(duration / (1000 * 60 * 60 * 24));
    var hours = Math.floor((duration % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    var minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));

    return `${days} giorni ${hours} ore ${minutes} minuti`;
}