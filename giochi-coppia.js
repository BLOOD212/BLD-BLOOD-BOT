import fs from 'fs'
import axios from 'axios'
import React from 'react'
import { renderToString } from 'react-dom/server'

// URL per l'avatar di fallback
const DEFAULT_AVATAR_URL = 'https://i.ibb.co/BKHtdBNp/default-avatar-profile-icon-1280x1280.jpg'

// Nuova carta a tema romantico con immagini del profilo
const createCoupleCard = (props) => {
  const { name1, name2, percentage, avatar1, avatar2 } = props
  const heartColor = percentage >= 50 ? '#FF6B81' : '#9CA3AF'
  const isHighPercentage = percentage > 80;

  return React.createElement('div', {
    style: {
      fontFamily: 'Inter, Arial, sans-serif',
      width: '800px',
      height: '450px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #2a0845 0%, #6441a5 100%)',
      color: '#fff',
      padding: '30px',
      boxSizing: 'border-box',
      position: 'relative',
      overflow: 'hidden'
    }
  },
    // Effetto particelle/stelle
    React.createElement('div', {
        style: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10"><circle cx="1" cy="1" r="1" fill="rgba(255,255,255,0.2)" /><circle cx="5" cy="5" r="1" fill="rgba(255,255,255,0.1)" /><circle cx="9" cy="9" r="1" fill="rgba(255,255,255,0.3)" /></svg>')`,
            backgroundSize: '10px 10px',
            opacity: 0.5,
            zIndex: 1
        }
    }),

    React.createElement('div', {
      style: {
        width: '100%',
        maxWidth: '760px',
        borderRadius: '20px',
        padding: '30px',
        background: 'rgba(255, 255, 255, 0.08)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        boxShadow: '0 20px 50px rgba(0,0,0,0.6)',
        display: 'flex',
        gap: '24px',
        alignItems: 'center',
        zIndex: 2
      }
    },
      // Profilo Nome 1
      React.createElement('div', {
        style: {
          flex: '0 0 140px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px'
        }
      },
        React.createElement('div', {
          style: {
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'linear-gradient(180deg, #5a4b8e, #3a2e5d)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(255, 255, 255, 0.2), inset 0 0 15px rgba(0,0,0,0.5)',
            overflow: 'hidden'
          }
        },
            // Immagine del profilo
            React.createElement('img', {
                src: avatar1,
                style: {
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '50%'
                }
            })
        ),
        React.createElement('div', { style: { fontSize: '18px', fontWeight: 'bold', textShadow: '0 0 5px rgba(0,0,0,0.2)' } }, name1)
      ),

      // Contenuto centrale
      React.createElement('div', {
        style: {
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center'
        }
      },
        React.createElement('div', {
          style: {
            fontSize: '48px',
            fontWeight: '900',
            background: 'linear-gradient(45deg, #FFD166, #FF99AA)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '2px',
            textShadow: '0 0 10px rgba(255, 107, 129, 0.5)',
            marginBottom: '10px'
          }
        }, `${name1} ❤ ${name2}`),

        React.createElement('p', {
          style: { margin: 0, color: '#e0e0e0', fontSize: '15px' }
        },
            percentage > 90 ? 'Un legame destinato a durare per sempre!' :
            percentage > 60 ? 'Un’affinità romantica e inaspettata!' :
            percentage > 30 ? 'C\'è una scintilla, ma serve un po\' di magia...' :
            'Il destino ha in serbo altri piani...'
        ),

        // Barra di progressione a tema
        React.createElement('div', {
          style: {
            marginTop: '25px',
            width: '100%',
            height: '25px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '12px',
            boxShadow: 'inset 0 0 5px rgba(0,0,0,0.5)',
            overflow: 'hidden',
            position: 'relative'
          }
        },
          React.createElement('div', {
            style: {
              width: `${Math.max(0, Math.min(100, percentage))}%`,
              height: '100%',
              background: `linear-gradient(90deg, ${isHighPercentage ? '#ff66b2' : '#9CA3AF'}, ${isHighPercentage ? '#ff0066' : '#9CA3AF'})`,
              transition: 'width .6s ease, box-shadow .6s ease',
              borderRadius: '12px',
              boxShadow: isHighPercentage ? '0 0 15px #ff0066' : 'none'
            }
          }),
          React.createElement('div', {
            style: {
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontWeight: '800',
              fontSize: '20px',
              color: 'rgba(255, 255, 255, 0.9)',
              textShadow: '0 0 8px rgba(0,0,0,0.8)'
            }
          }, `${percentage}%`)
        ),

      ),

      // Profilo Nome 2
      React.createElement('div', {
        style: {
          flex: '0 0 140px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px'
        }
      },
        React.createElement('div', {
          style: {
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            background: 'linear-gradient(180deg, #5a4b8e, #3a2e5d)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(255, 255, 255, 0.2), inset 0 0 15px rgba(0,0,0,0.5)',
            overflow: 'hidden'
          }
        },
            // Immagine del profilo
            React.createElement('img', {
                src: avatar2,
                style: {
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    borderRadius: '50%'
                }
            })
        ),
        React.createElement('div', { style: { fontSize: '18px', fontWeight: 'bold', textShadow: '0 0 5px rgba(0,0,0,0.2)' } }, name2)
      )
    )
  )
}

export const generateCoupleImage = async ({ name1, name2, percentage, avatar1, avatar2 }) => {
  const screenshotoneKey = global.APIKeys?.screenshotone_default
  if (!screenshotoneKey) {
    console.warn('ScreenshotOne API key mancante, uso html2canvas locale')
    throw new Error('API key ScreenshotOne non configurata. Aggiungi global.APIKeys.screenshotone nel config.js')
  }

  try {
    const reactElement = createCoupleCard({ name1, name2, percentage, avatar1, avatar2 })
    const htmlContent = renderToString(reactElement)
    const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8">
      <style>body{margin:0;padding:0;font-family:Inter,Arial,sans-serif;background:transparent}</style>
      </head><body>${htmlContent}</body></html>`

    const url = `https://api.screenshotone.com/take?access_key=${encodeURIComponent(screenshotoneKey)}&html=${encodeURIComponent(fullHtml)}&viewport_width=800&viewport_height=450&format=png&full_page=true&device_scale_factor=2`

    const response = await axios.get(url, { 
      responseType: 'arraybuffer',
      timeout: 25000,
      validateStatus: status => status === 200
    })

    const contentType = (response.headers['content-type'] || '').toLowerCase()
    if (contentType.includes('json')) {
      const errorText = Buffer.from(response.data).toString('utf8')
      let parsed = {}
      try { parsed = JSON.parse(errorText) } catch(e) {}
      throw new Error(parsed.error_message || parsed.message || 'Errore API sconosciuto')
    }

    return response.data
  } catch (error) {
    console.error('Errore generateCoupleImage:', error?.response?.data ? 
      Buffer.from(error.response.data).toString('utf8') : error.message)
    throw new Error(`Errore generazione immagine: ${error.message}`)
  }
}

var handler = async (m, { conn, command, text, usedPrefix }) => {
  let loveText = ''
  let partner2Jid = null
  
  try {
    const senderName = await (async () => {
      try { return await conn.getName(m.sender) } catch { return (m.pushName || m.sender.split('@')[0]) }
    })()

    let name1 = senderName
    let name2 = null

    if (m.quoted && m.quoted.sender) {
      partner2Jid = m.quoted.sender
      try { name2 = await conn.getName(partner2Jid) } catch { name2 = partner2Jid.split('@')[0] }
    }

    if (!name2 && Array.isArray(m.mentionedJid) && m.mentionedJid.length) {
      partner2Jid = m.mentionedJid[0]
      try { name2 = await conn.getName(partner2Jid) } catch { name2 = partner2Jid.split('@')[0] }
    }

    if (!text && !name2) return conn.reply(m.chat, '✨ *Scrivi il nome della persona, menziona o rispondi a un messaggio*', m)

    if (text && !name2) {
      const parts = text.trim().split(/\s+/)
      if (parts.length === 1) {
        name2 = parts[0]
      } else {
        name1 = parts.shift()
        name2 = parts.join(' ')
      }
    }

    if (!name2) name2 = 'Amico/a'

    // Recupera gli URL delle foto profilo con fallback
    const avatar1 = await conn.profilePictureUrl(m.sender, 'image').catch(() => DEFAULT_AVATAR_URL)
    const avatar2 = await conn.profilePictureUrl(partner2Jid || m.chat, 'image').catch(() => DEFAULT_AVATAR_URL)

    let percentage = Math.floor(Math.random() * 101)

    if (percentage < 50) {
      loveText = `💔 C'è un piccolo intoppo! Sembra che *${name1}* e *${name2}* abbiano solo il *${percentage}%* di affinità. Ma l'amore è un mistero...`
    } else if (percentage < 100) {
      loveText = `❤️ Wow, *${name1}* e *${name2}*! Il vostro amore brilla al *${percentage}%*. Un vero colpo di fulmine!`
    } else {
      loveText = `✨ Un legame magico! *${name1}* e *${name2}* sono anime gemelle, compatibili al *${percentage}%*! Il destino vi unisce.`
    }

    const imageBuffer = await generateCoupleImage({ name1, name2, percentage, avatar1, avatar2 })
    
    const buttons = [
      { buttonId: `${usedPrefix}coppia ${name1} ${name2}`, buttonText: { displayText: 'Ricalcola' }, type: 1 }
    ]

    await conn.sendMessage(m.chat, {
      image: imageBuffer,
      caption: loveText,
      footer: 'vare ✧ bot',
      buttons,
      mentions: conn.parseMention(loveText)
    }, { quoted: m })

    if (percentage === 100) {
      m.reply(`💍 *WOW! ${name1} e ${name2} sono compatibili al 100%!* Volete sposarvi?`, null, { mentions: conn.parseMention(`@${m.sender.split('@')[0]} @${(partner2Jid)?.split('@')[0] || ''}`) })
      
      let filter = msg => {
        let txt = (msg.text || '').toLowerCase()
        return (txt === 'si' || txt === 'sì') && (msg.sender == m.sender || msg.sender == partner2Jid)
      }
      let timeout = 60000
      let collected = []

      await conn.reply(m.chat, `*${name1}* e *${name2}*, rispondete "sì" per accettare il matrimonio! (60s)`, m)

      while (collected.length < 2) {
        let res = await conn.awaitMessage(m.chat, filter, timeout).catch(() => null)
        if (!res) break
        if (!collected.includes(res.sender)) collected.push(res.sender)
      }

      if (collected.length === 2) {
        let file = './sposi.json'
        let sposi = []
        if (fs.existsSync(file)) {
          try { sposi = JSON.parse(fs.readFileSync(file)) } catch { sposi = [] }
        }
        sposi.push({ partner1: name1, partner2: name2, date: new Date().toISOString() })
        fs.writeFileSync(file, JSON.stringify(sposi, null, 2))
        return conn.reply(m.chat, `💞 *Congratulazioni! ${name1} e ${name2} sono ora ufficialmente sposati!*`, m)
      } else {
        return conn.reply(m.chat, `💔 Matrimonio annullato: non entrambi hanno accettato.`, m)
      }
    }
  } catch (e) {
    console.error('Errore invio immagine coppia:', e)
    return conn.reply(m.chat, `Errore generazione immagine: ${e.message}\n\n${loveText}`, m)
  }
}

handler.help = ['coppia']
handler.tags = ['giochi']
handler.command = /^(ship|love|amore|coppia)$/i
handler.register = true

export default handler