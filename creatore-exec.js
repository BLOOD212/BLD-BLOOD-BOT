/*import syntaxerror from 'syntax-error'
import { format } from 'util'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { createRequire } from 'module'

const __dirname = dirname(fileURLToPath(import.meta.url))
const require = createRequire(__dirname)

let handler = async (m, context) => {
  let { conn, usedPrefix, noPrefix, args, groupMetadata } = context
  let risultato
  let erroreSintassi = ''
  let codice = (/^=/.test(usedPrefix) ? 'return ' : '') + noPrefix.trim()
  let esperienzaOriginale = m.exp * 1

  try {
    let contatoreOutput = 10
    let moduloVirtuale = { exports: {} }
    let funzione = new (async () => {}).constructor(
      'print', 'm', 'handler', 'require', 'conn',
      'Array', 'process', 'args', 'groupMetadata',
      'module', 'exports', 'context',
      codice
    )

    risultato = await funzione.call(
      conn,
      (...args) => {
        if (--contatoreOutput < 1) return
        console.log(...args)
        return conn.reply(m.chat, format(...args), m)
      },
      m,
      handler,
      require,
      conn,
      CustomArray,
      process,
      args,
      groupMetadata,
      moduloVirtuale,
      moduloVirtuale.exports,
      context
    )

  } catch (e) {
    const errore = syntaxerror(codice, 'Codice dinamico', {
      allowReturnOutsideFunction: true,
      allowAwaitOutsideFunction: true,
      sourceType: 'module'
    })
    if (errore) erroreSintassi = '```' + errore + '```\n\n'
    risultato = e
  } finally {
    conn.reply(m.chat, erroreSintassi + format(risultato), m)
    m.exp = esperienzaOriginale
  }
}

handler.help = ['> codice', '=> codice']
handler.tags = ['creatore']
handler.customPrefix = /^=?>\s?/
handler.command = /(?:)/i
handler.rowner = true
export default handler

class CustomArray extends Array {
  constructor(...args) {
    return typeof args[0] === 'number'
      ? super(Math.min(args[0], 10000))
      : super(...args)
  }
}*/