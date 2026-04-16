let handler = async (m, { conn, command, text }) => {
  const message = `*QUESTO COMANDO RICORDA AD ASIA DI FAR CONOSCERE A ME E BOB LA BRASILIANA E CHE GLIELO SBATTIAMO OVUNQUE ALLA NOSTRA MAMACITA DEVE GRIDARE OIA PAPIII MAS FORTE (ho già il cazzo di fuori al pensiero, bob si sta segando)*.`;
  // manda il messaggio nella chat dove il comando è stato usato, citandolo
  await conn.sendMessage(m.chat, { text: message }, { quoted: m });
};

handler.help = ['brasiliana'];
handler.tags = ['giochi'];
handler.command = /^brasiliana$/i;

export default handler;