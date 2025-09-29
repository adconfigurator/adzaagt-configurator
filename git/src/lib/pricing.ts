export const RATE = {
  front_m2: 85,
  carcass_m2: 45,
  shelf: 20,
  drawer: 60,
  rod: 25,
};

export function areaModel({ breedte, hoogte, diepte, bays }: { breedte: number; hoogte: number; diepte: number; bays: number }) {
  const b = breedte / 100; const h = hoogte / 100; const d = diepte / 100;
  const front_m2 = b * h;
  const carcass_m2 = 2*h*d + 2*b*d + b*h;
  return { front_m2, carcass_m2 };
}
