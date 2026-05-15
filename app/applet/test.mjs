import fs from 'fs';

const fileContent = fs.readFileSync('src/constants/f1Data.ts', 'utf-8');
const drivers = fileContent.match(/lastName: "([^"]+)"/g);
console.log(drivers);
