const fs = require('fs');

const fixFile = (path) => {
  let content = fs.readFileSync(path, 'utf-8');
  content = content.replace(/https:\/\/media\.formula1\.com[^"]+/g, '/placeholders/global_fallback.jpg');
  fs.writeFileSync(path, content);
};

fixFile('src/services/circuitAssets.ts');
fixFile('src/services/imageIntelligence.ts');
fixFile('src/services/assetManager.ts');
fixFile('src/services/imageSourceSystem.ts');
