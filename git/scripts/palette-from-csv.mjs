import fs from 'node:fs';

const [,,brand, csvPath, outPath] = process.argv;
if (!brand || !csvPath || !outPath) {
  console.error('Gebruik: node scripts/palette-from-csv.mjs <unilin|decolegno> <input.csv> <output.ts>');
  process.exit(1);
}
const csv = fs.readFileSync(csvPath, 'utf8').trim().split(/\r?\n/);
const items = csv.filter(Boolean).map(line => {
  const [code='', name='', hex='', textureUrl=''] = line.split(',').map(s=>s.trim());
  const id = `${brand}-${code.toLowerCase()}`.replace(/[^a-z0-9-]/g,'');
  return { id, brand, code, name, hex: hex||undefined, textureUrl: textureUrl||undefined };
});
const varName = brand === 'unilin' ? 'UNILIN_PALETTE' : 'DECOLEGNO_PALETTE';
const ts = `export const ${varName} = ${JSON.stringify(items, null, 2)}\n`;
fs.writeFileSync(outPath, ts);
console.log('OK ->', outPath);
