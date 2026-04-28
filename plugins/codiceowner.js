//Codice di owner-sistema.js

import os from 'os';
import { execSync } from 'child_process';

const formatBytes = (bytes, decimals = 2) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

const getDiskSpace = () => {
    try {
        const stdout = execSync('df -h | grep -E "^/dev/root|^/dev/sda1"').toString();
        const [ , size, used, available, usePercent ] = stdout.split(/\s+/);
        return { size, used, available, usePercent };
    } catch (error) {
        console.error('❌ Errore nel recupero dello spazio su disco:', error);
        return null;
    }
};

const handler = async (m, { conn }) => {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const _muptime = process.uptime() * 1000;
    const muptime = clockString(_muptime);
    const hostname = os.hostname();
    const platform = os.platform();
    const arch = os.arch();
    const nodeUsage = process.memoryUsage();
    const diskSpace = getDiskSpace();

    const message = `✅ *STATO DEL SISTEMA*

🚩 *Host ⪼* ${hostname}
🏆 *Sistema Operativo ⪼* ${platform}
💫 *Architettura ⪼* ${arch}
🥷 *RAM Totale ⪼* ${formatBytes(totalMem)}
🚀 *RAM Libera ⪼* ${formatBytes(freeMem)}
⌛ *RAM Usata ⪼* ${formatBytes(usedMem)}
🕒 *Uptime ⪼* ${muptime}

🪴 *Memoria Node.js:* 
→ RSS: ${formatBytes(nodeUsage.rss)}
→ Heap Totale: ${formatBytes(nodeUsage.heapTotal)}
→ Heap Usata: ${formatBytes(nodeUsage.heapUsed)}
→ Externa: ${formatBytes(nodeUsage.external)}
→ ArrayBuffer: ${formatBytes(nodeUsage.arrayBuffers)}
${diskSpace ? `

☁️ *Spazio su Disco:*
→ Totale: ${diskSpace.size}
→ Usato: ${diskSpace.used}
→ Disponibile: ${diskSpace.available}
→ Percentuale di Uso: ${diskSpace.usePercent}` : '❌ Errore nel recupero dello spazio su disco.'}
`;

    await conn.reply(m.chat, message.trim(), m);
};

handler.help = ['𝐬𝐢𝐬𝐭𝐞𝐦𝐚'];
handler.tags = ['owner'];
handler.owner = true;
handler.command = ['system', 'sistema'];


export default handler;

function clockString(ms) {
    let h = isNaN(ms) ? '--' : Math.floor(ms / 3600000);
    let m = isNaN(ms) ? '--' : Math.floor(ms / 60000) % 60;
    let s = isNaN(ms) ? '--' : Math.floor(ms / 1000) % 60;
    return [h, m, s].map(v => v.toString().padStart(2, 0)).join(':');
}