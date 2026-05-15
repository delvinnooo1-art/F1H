const fs = require('fs');
let content = fs.readFileSync('src/constants/f1Data.ts', 'utf-8');

let startIndex = content.indexOf(`\n  "0": {\n`);
let endIndex = content.indexOf(`\n};\n\nexport const TEAMS_2026`);
console.log(startIndex, endIndex);

if (startIndex !== -1 && endIndex !== -1) {
  let driversText = content.substring(startIndex, endIndex);
  console.log("Found drivers length:", driversText.length);
  // Remove from TRACK_DATABASE
  content = content.substring(0, startIndex) + content.substring(endIndex);
  
  // Append to DRIVERS_2026
  content = content.replace(/};\s*$/, ',' + driversText + '\n};');
  
  fs.writeFileSync('src/constants/f1Data.ts', content);
  console.log("Done");
} else {
  console.log("Could not find start/end.");
}
