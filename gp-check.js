import { createCanvas } from 'canvas'

let handler = async (m, { conn }) => {
    if (!m.quoted) return m.reply('❗ Rispondi a un messaggio per analizzare il dispositivo usato')

    const msgID = m.quoted.id || m.quoted.key?.id
    const senderJid = m.quoted.sender || 'sconosciuto'

    let device = 'Dispositivo sconosciuto'

    // Identificazione dispositivo
    if (!msgID) {
        device = 'Impossibile rilevare il dispositivo'
    } else if (/^[a-zA-Z]+-[a-fA-F0-9]+$/.test(msgID)) {
        device = 'Messaggio da bot'
    } else if (msgID.startsWith('false_') || msgID.startsWith('true_')) {
        device = 'WhatsApp Web'
    } else if (
        msgID.startsWith('3EB0') &&
        /^[A-Z0-9]+$/.test(msgID)
    ) {
        device = 'WhatsApp Web o bot'
    } else if (msgID.includes(':')) {
        device = 'WhatsApp Desktop'
    } else if (/^[A-F0-9]{32}$/i.test(msgID)) {
        device = 'Android'
    } else if (
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(msgID)
    ) {
        device = 'iOS'
    } else if (
        /^[A-Z0-9]{20,25}$/i.test(msgID) &&
        !msgID.startsWith('3EB0')
    ) {
        device = 'iOS'
    } else if (msgID.startsWith('3EB0')) {
        device = 'Android (vecchio schema)'
    } else {
        console.log('[ANALISI] Nuovo ID non riconosciuto:', msgID)
    }

    // 🌟 Canvas minimal
    const canvas = createCanvas(600, 200)
    const ctx = canvas.getContext('2d')

    // Sfondo
    ctx.fillStyle = '#1a1a1a'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Titolo
    ctx.fillStyle = '#ffffff'
    ctx.font = 'bold 32px Sans'
    ctx.textAlign = 'center'
    ctx.fillText('ANALISI UTENTE', canvas.width / 2, 50)

    // Numero utente
    ctx.font = '28px Sans'
    ctx.fillStyle = '#ffffff'
    ctx.textAlign = 'left'
    ctx.fillText(`Numero: ${senderJid}`, 50, 120)

    // Tipo di dispositivo
    ctx.fillText(`Dispositivo: ${device}`, 50, 160)

    // Invia immagine su WhatsApp
    await conn.sendMessage(
        m.chat,
        { image: canvas.toBuffer(), caption: 'Analisi completata' },
        { quoted: m }
    )
}

handler.command = /^(check|device|dispositivo)$/i
handler.group = true
handler.admin = true
handler.botAdmin = false

export default handler