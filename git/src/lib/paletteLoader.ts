export type Brand = 'unilin' | 'decolegno';
export type PaletteItem = { id: string; brand: Brand; code: string; name: string; hex?: string; textureUrl?: string };

function parseCsv(text: string): { code:string; name:string; hex?:string; textureUrl?:string }[] {
  const lines = text.trim().split(/\r?\n/);
  const [header, ...rows] = lines;
  const cols = header.split(',').map(s=>s.trim());
  const idx = (k:string)=> cols.findIndex(c=>c.toLowerCase()===k);
  const ci = idx('code'), ni = idx('name'), hi = idx('hex'), ti = idx('textureurl');
  return rows.filter(Boolean).map(r => {
    const parts = r.split(','); 
    return {
      code: (parts[ci]||'').trim(),
      name: (parts[ni]||'').trim(),
      hex: (parts[hi]||'').trim() || undefined,
      textureUrl: (parts[ti]||'').trim() || undefined,
    }
  }).filter(x=>x.code && x.name);
}

export async function loadCsvPalette(url: string, brand: Brand): Promise<PaletteItem[]> {
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) return [];
  const txt = await res.text();
  const rows = parseCsv(txt);
  return rows.map(r => ({
    id: `${brand}-${r.code.toLowerCase()}`,
    brand,
    code: r.code,
    name: r.name,
    hex: r.hex,
    textureUrl: r.textureUrl
  }));
}

export async function loadPalettes(): Promise<PaletteItem[]> {
  const [uni, dec] = await Promise.all([
    loadCsvPalette('/palettes/unilin.csv', 'unilin'),
    loadCsvPalette('/palettes/decolegno.csv', 'decolegno'),
  ]);
  return [...uni, ...dec];
}
