const {
  proto,
  generateWAMessage,
  areJidsSameUser,
  decryptPollVote,
} = (await import('@realvare/based')).default;

export async function all(m, chatUpdate) {
  if (m.isBaileys || !m.message) return;
  const btn = m.message.buttonsResponseMessage;
  const tpl = m.message.templateButtonReplyMessage;
  const lst = m.message.listResponseMessage;
  if (!(btn || tpl || lst)) return;
  const id = btn?.selectedButtonId || tpl?.selectedId || lst?.singleSelectReply?.selectedRowId || '';
  const text = btn?.selectedDisplayText || tpl?.selectedDisplayText || lst?.title || '';
  let isIdMessage = false, usedPrefix;
  for (const name in global.plugins) {
    const plugin = global.plugins[name];
    if (!plugin || plugin.disabled) continue;
    if (!opts['restrict'] && plugin.tags && plugin.tags.includes('admin')) continue;
    if (typeof plugin !== 'function' || !plugin.command) continue;

    const str2Regex = (str) => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
    const _prefix = plugin.customPrefix ? plugin.customPrefix : this.prefix ? this.prefix : global.prefix;
    const match = (_prefix instanceof RegExp
      ? [[_prefix.exec(id), _prefix]]
      : Array.isArray(_prefix)
        ? _prefix.map((p) => {
            const re = p instanceof RegExp ? p : new RegExp(str2Regex(p));
            return [re.exec(id), re];
          })
        : typeof _prefix === 'string'
          ? [[new RegExp(str2Regex(_prefix)).exec(id), new RegExp(str2Regex(_prefix))]]
          : [[[], new RegExp]]
    ).find((p) => p[1]);
    if ((usedPrefix = (match[0] || '')[0])) {
      let [command] = id.replace(usedPrefix, '').trim().split(/\s+/).filter(Boolean);
      command = (command || '').toLowerCase();
      const isId = plugin.command instanceof RegExp
        ? plugin.command.test(command)
        : Array.isArray(plugin.command)
          ? plugin.command.some((cmd) => cmd instanceof RegExp ? cmd.test(command) : cmd === command)
          : typeof plugin.command === 'string'
            ? plugin.command === command
            : false;
      if (!isId) continue;
      isIdMessage = true;
      break; // Appena trovato, esci dal ciclo per velocità
    }
  }
  try {
    const messages = await generateWAMessage(
      m.chat,
      { text: isIdMessage ? id : text, mentions: m.mentionedJid || [] },
      {
        userJid: this.user.id,
        quoted: m.quoted && m.quoted.fakeObj,
      }
    );
    messages.key.fromMe = areJidsSameUser(m.sender, this.user.id);
    messages.key.id = m.key.id;
    messages.pushName = m.name;
    if (m.isGroup) {
      messages.key.participant = messages.participant = m.sender;
    }
    const msg = {
      ...chatUpdate,
      messages: [proto.WebMessageInfo.fromObject(messages)].map((v) => (v.conn = this, v)),
      type: 'append',
    };
    this.ev.emit('messages.upsert', msg);
  } catch (e) {
    console.error('[TemplateResponse] Errore nell\'invio della risposta:', e?.message || e);
  }
}