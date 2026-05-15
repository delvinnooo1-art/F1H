const fs = require('fs');

let fileContent = fs.readFileSync('src/constants/f1Data.ts', 'utf-8');

fileContent = fileContent.replace(/https:\/\/media\.formula1\.com\/image\/upload\/[^\/]+\/v1\/content\/dam\/fom-website\/manual\/Circuit%20Images\/([^\.]+)\.jpg/g, (match, p1) => `https://cdn.racehub.live/2026/tracks/${p1.toLowerCase().replace(/_/g, '-')}.jpg`);
fileContent = fileContent.replace(/https:\/\/media\.formula1\.com\/content\/dam\/fom-website\/2018-redesign-assets\/Circuit%20maps%2016x9\/([^\.]+)\.png[^\"]*/g, (match, p1) => `https://cdn.racehub.live/2026/maps/${p1.toLowerCase().replace(/_/g, '-')}.png`);
fileContent = fileContent.replace(/https:\/\/media\.formula1\.com\/image\/upload\/[^\/]+\/v1\/content\/dam\/fom-website\/drivers\/[A-Z]\/[A-Z0-9_]+\/([a-z0-9]+)\.png/g, (match, p1) => `https://cdn.racehub.live/2026/drivers/${p1}.png`);
fileContent = fileContent.replace(/https:\/\/media\.formula1\.com\/image\/upload\/f_auto,q_auto\/v1\/content\/dam\/fom-website\/teams\/2026\/([a-z0-9-]+)\.png/g, (match, p1) => `https://cdn.racehub.live/2026/teams/car_${p1}.png`);
fileContent = fileContent.replace(/https:\/\/media\.formula1\.com\/content\/dam\/fom-website\/teams\/2026\/([a-z0-9-]+)-logo\.png/g, (match, p1) => `https://cdn.racehub.live/2026/teams/logo_${p1}.png`);
fileContent = fileContent.replace(/https:\/\/media\.formula1\.com\/[^"]+/g, match => {
  if (match.includes('driver')) return `https://cdn.racehub.live/2026/drivers/placeholder.png`;
  if (match.includes('team')) return `https://cdn.racehub.live/2026/teams/placeholder.png`;
  return `https://cdn.racehub.live/2026/tracks/placeholder.jpg`;
});

fs.writeFileSync('src/constants/f1Data.ts', fileContent);
