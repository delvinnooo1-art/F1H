import { DRIVERS_2026 } from './src/constants/f1Data.ts';
import { IMAGE_DATABASE_2026, getImage } from './src/services/imageSourceSystem.ts';
console.log("DB keys:", Object.keys(IMAGE_DATABASE_2026).filter(k => k === 'antonelli'));
console.log("getImage:", getImage('standing', 'antonelli'));
