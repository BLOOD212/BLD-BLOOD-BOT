export async function before(m, { isOwner, isRowner, isMods}) {
    if (m.fromMe) return !0;
    if (m.isGroup) return !1;
    if (!m.message) return !0;
    if (m.text.includes('sasso') || m.text.includes('carta') || m.text.includes('forbici')) return !0; 
    const varebot = global.db.data.settings[this.user.jid] || {};
    if (varebot.antiprivato && !isOwner && !isRowner && !isMods) {
      await this.updateBlockStatus(m.chat, 'block');
    }
    return !1;
}