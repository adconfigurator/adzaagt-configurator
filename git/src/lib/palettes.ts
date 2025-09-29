export type Brand = 'unilin' | 'decolegno';
export type PaletteItem = { id: string; brand: Brand; code: string; name: string; hex?: string; textureUrl?: string; price?: number };

export const UNILIN_PALETTE: PaletteItem[] = [
  { id: 'unilin-u190', brand: 'unilin', code: 'U190', name: 'Wit', hex: '#f5f5f5' },
  { id: 'unilin-u705', brand: 'unilin', code: 'U705', name: 'Lichtgrijs', hex: '#d9d9d9' },
];

export const DECOLEGNO_PALETTE: PaletteItem[] = [
  { id: 'decolegno-lr25', brand: 'decolegno', code: 'LR25', name: 'Eik licht', hex: '#a37a41' },
  { id: 'decolegno-nh21', brand: 'decolegno', code: 'NH21', name: 'Noten', hex: '#7a5034' },
];

export const ALL_PALETTE: PaletteItem[] = [...UNILIN_PALETTE, ...DECOLEGNO_PALETTE];
