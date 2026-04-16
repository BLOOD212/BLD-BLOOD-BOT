import axios from 'axios'
import fs from 'fs'

let handler = async (m, { conn, args, participants, isOwner }) => {
    const browserlessKey = global.APIKeys['browserless']
    if (!browserlessKey) return m.reply('❌ API Key per Browserless mancante.')

    const formatNumber = (num) => isFinite(num) ? num.toLocaleString('it-IT') : '0'

    let users = Object.entries(global.db.data.users)
        .map(([key, value]) => ({ ...value, jid: key }))
        .filter(user => user.registered)

    let sortedEuro = [...users].sort((a, b) => (b.euro || 0) - (a.euro || 0))
    let sortedExp = [...users].sort((a, b) => (b.exp || 0) - (a.exp || 0))
    let sortedLevel = [...users].sort((a, b) => (b.level || 0) - (a.level || 0))

    let playerPos = {
        euro: sortedEuro.findIndex(u => u.jid === m.sender) + 1,
        exp: sortedExp.findIndex(u => u.jid === m.sender) + 1,
        level: sortedLevel.findIndex(u => u.jid === m.sender) + 1
    }

    let len = 5

    const imageBuffer = fs.readFileSync('media/benvenuto-addio.jpg')
    const base64Image = imageBuffer.toString('base64')

    const sections = [
        { title: 'Euro', icon: '💰', users: sortedEuro.slice(0, len), key: 'euro' },
        { title: 'Exp', icon: '⭐', users: sortedExp.slice(0, len), key: 'exp' },
        { title: 'Livelli', icon: '📈', users: sortedLevel.slice(0, len), key: 'level' }
    ]

    const renderColumn = async (section) => {
        let rows = ''
        for (let i = 0; i < section.users.length; i++) {
            const user = section.users[i]
            let pp;
            try { 
                pp = await conn.profilePictureUrl(user.jid, 'image') 
            } catch { 
                pp = 'https://i.ibb.co/BKHtdBNp/default-avatar-profile-icon-1280x1280.jpg' 
            }
            const name = (user.name || user.jid.split('@')[0]).substring(0, 10)
            const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}°`
            
            rows += `
            <div class="user-row">
                <div class="rank">${medal}</div>
                <img src="${pp}" class="avatar">
                <div class="info">
                    <div class="name">${name}</div>
                    <div class="value">${formatNumber(user[section.key])}</div>
                </div>
            </div>`
        }
        return `
        <div class="column">
            <div class="column-title">${section.icon} ${section.title}</div>
            ${rows}
        </div>`
    }

    let columnsHtml = ''
    for (const s of sections) { columnsHtml += await renderColumn(s) }

    const html = `
    <html>
    <head>
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap');
            body { 
                background-image: url('data:image/jpeg;base64,${base64Image}'); background-size: cover; background-repeat: no-repeat; background-position: center; background-color: #0a0a0f; color: #f8fafc; font-family: 'Plus Jakarta Sans', sans-serif;
                padding: 30px; width: 900px; margin: 0;
            }
            .header { text-align: center; margin-bottom: 20px; }
            .header h1 { font-size: 32px; margin: 0; color: #6366f1; text-transform: uppercase; letter-spacing: 2px; }
            
            .user-stats-bar {
                position: relative;
                display: flex;
                justify-content: center;
                gap: 20px;
                border-radius: 15px;
                padding: 12px;
                margin-bottom: 25px;
            }
            .user-stats-bar::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(99, 102, 241, 0.1);
                border: 1px solid rgba(99, 102, 241, 0.3);
                border-radius: 15px;
                filter: blur(8px) saturate(180%);
                z-index: -1;
            }
            .stat-box { text-align: center; padding: 0 15px; border-right: 1px solid rgba(255,255,255,0.1); }
            .stat-box:last-child { border-right: none; }
            .stat-label { font-size: 10px; color: #94a3b8; text-transform: uppercase; font-weight: 800; }
            .stat-rank { font-size: 18px; color: #f59e0b; font-weight: 800; }

            .main-container { 
                display: flex; 
                justify-content: space-between; 
                gap: 15px; 
            }
            
            .column { 
                flex: 1; 
                background: #1a1a24; 
                border-radius: 20px; 
                padding: 15px; 
                border: 1px solid #2d2d3a;
            }
            
            .column-title { 
                text-align: center; 
                font-size: 18px; 
                font-weight: 800; 
                margin-bottom: 15px; 
                padding-bottom: 10px; 
                border-bottom: 1px solid #2d2d3a; 
                color: #94a3b8;
            }
            
            .user-row { 
                display: flex; 
                align-items: center; 
                padding: 8px; 
                margin-bottom: 8px;
                background: rgba(255,255,255,0.02);
                border-radius: 12px;
            }
            
            .rank { width: 30px; font-weight: 800; font-size: 14px; text-align: center; }
            .avatar { width: 35px; height: 35px; border-radius: 50%; margin: 0 10px; border: 1px solid #6366f1; }
            .info { display: flex; flex-direction: column; overflow: hidden; }
            .name { font-weight: 600; font-size: 13px; white-space: nowrap; color: #fff; }
            .value { font-weight: 800; color: #22c55e; font-size: 11px; }
            
            .footer { text-align: center; color: #475569; font-size: 12px; margin-top: 20px; font-weight: 600; }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🏆 TOP 5 CLASSIFICA</h1>
        </div>

        <div class="user-stats-bar">
            <div style="align-self: center; font-weight: 800; color: #fff; margin-right: 10px;">LE TUE POSIZIONI:</div>
            <div class="stat-box">
                <div class="stat-label">💰 Euro</div>
                <div class="stat-rank">#${playerPos.euro}</div>
            </div>
            <div class="stat-box">
                <div class="stat-label">⭐ Exp</div>
                <div class="stat-rank">#${playerPos.exp}</div>
            </div>
            <div class="stat-box">
                <div class="stat-label">📈 Livello</div>
                <div class="stat-rank">#${playerPos.level}</div>
            </div>
        </div>

        <div class="main-container">
            ${columnsHtml}
        </div>

        <div class="footer">${isOwner ? '*BLOODBOT*' : '*BLOODBOT*'}</div>
    </body>
    </html>`

    try {
        const responseImg = await axios.post(`https://chrome.browserless.io/screenshot?token=${browserlessKey}`, {
            html,
            options: { type: 'jpeg', quality: 90 },
            viewport: { width: 960, height: 650 }
        }, { responseType: 'arraybuffer' })

        const caption = `🏆 *CLASSIFICA GENERALE TOP 5*

📍 *LE TUE POSIZIONI:*
• 💰 *Euro:* ${playerPos.euro}/${users.length}
• ⭐ *Exp:* ${playerPos.exp}/${users.length}
• 📈 *Livello:* ${playerPos.level}/${users.length}

${isOwner ? '> vare ✧ bot' : '> vare ❀ bot'}`

        await conn.sendMessage(m.chat, {
            image: Buffer.from(responseImg.data),
            caption: caption,
            mentions: [m.sender]
        }, { quoted: m })
    } catch (e) {
        console.error(e)
        m.reply('❌ Errore nella generazione della classifica.')
    }
}

handler.help = ['classifica']
handler.tags = ['main']
handler.command = ['leaderboard', 'lb', 'classifica']
handler.register = true

export default handler
