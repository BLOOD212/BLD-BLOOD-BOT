const roles = {
  'Trainee': 0,
  'Grade 5': 10,
  'Grade 4': 20,
  'Grade 3': 30,
  'Grade 2': 40,
  'Semi-grade 1': 50,
  'Grade 1': 60,
  'Elite Grade': 70,
  '?': 80,
  '???': 100
}

let handler = m => m

handler.before = async function (m, { conn }) {
  let user = global.db.data.users[m.sender]
  let level = user.level
  let role = (Object.entries(roles)
    .sort((a, b) => b[1] - a[1])
    .find(([, minLevel]) => level >= minLevel) || Object.entries(roles)[0])[0]
  user.role = role
  return true
}

export { roles }