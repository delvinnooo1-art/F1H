const fs = require('fs');

let content = fs.readFileSync('src/constants/f1Data.ts', 'utf-8');

const extraDrivers = {
  "11": { id: "sergio_perez", firstName: "Sergio", lastName: "Perez", team: "RED BULL", color: "#3671C6" },
  "22": { id: "yuki_tsunoda", firstName: "Yuki", lastName: "Tsunoda", team: "RB", color: "#6692FF" },
  "23": { id: "alexander_albon", firstName: "Alexander", lastName: "Albon", team: "WILLIAMS", color: "#00A0DE" },
  "18": { id: "lance_stroll", firstName: "Lance", lastName: "Stroll", team: "ASTON MARTIN", color: "#229977" },
  "31": { id: "esteban_ocon", firstName: "Esteban", lastName: "Ocon", team: "HAAS", color: "#FFFFFF" },
  "27": { id: "nico_hulkenberg", firstName: "Nico", lastName: "Hulkenberg", team: "SAUBER", color: "#52E252" },
  "20": { id: "kevin_magnussen", firstName: "Kevin", lastName: "Magnussen", team: "HAAS", color: "#FFFFFF" },
  "77": { id: "valtteri_bottas", firstName: "Valtteri", lastName: "Bottas", team: "SAUBER", color: "#52E252" },
  "24": { id: "zhou_guanyu", firstName: "Zhou", lastName: "Guanyu", team: "SAUBER", color: "#52E252" },
  "2": { id: "logan_sargeant", firstName: "Logan", lastName: "Sargeant", team: "WILLIAMS", color: "#00A0DE" },
  "3": { id: "daniel_ricciardo", firstName: "Daniel", lastName: "Ricciardo", team: "RB", color: "#6692FF" },
  "5": { id: "jack_doohan", firstName: "Jack", lastName: "Doohan", team: "ALPINE", color: "#0093CC" },
  "0": { id: "gabriel_bortoleto", firstName: "Gabriel", lastName: "Bortoleto", team: "SAUBER", color: "#52E252" }
};

let toAppend = '';
for (const [num, d] of Object.entries(extraDrivers)) {
  if (!content.includes(`"${num}": {`)) {
    toAppend += `
  "${num}": {
    id: "${d.id}",
    firstName: "${d.firstName}",
    lastName: "${d.lastName}",
    team: "${d.team}",
    color: "${d.color}",
    image: "https://cdn.racehub.live/2026/drivers/placeholder.png",
    suit: "https://cdn.racehub.live/2026/drivers/placeholder.png",
    helmet: ""
  },`;
  }
}

if (toAppend) {
  content = content.replace(/};\s*export const TEAMS_2026/, (match) => toAppend + '\n' + match);
  fs.writeFileSync('src/constants/f1Data.ts', content);
}
