
'use client';
import { useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, useTexture } from "@react-three/drei";
import { jsPDF } from "jspdf";
import { ALL_PALETTE, PaletteItem } from "@/lib/palettes";
import { loadPalettes } from "@/lib/paletteLoader";
import { CheckCircle, Eye, FileDown, Send } from "lucide-react";

type Selections = Record<string, any>;
type BayConfig = { shelves: number; drawers: number; rod: boolean };

const clamp = (v:number, min:number, max:number)=>Math.max(min, Math.min(max, v));

// --------- 3D materials ----------
function MaterialMat({ decorId }: { decorId?: string }) {
  const decor = (typeof window!=="undefined" && (window as any).__ADZ_PALETTE__ ? (window as any).__ADZ_PALETTE__ : ALL_PALETTE).find((p:any) => p.id === (decorId ?? "unilin-u190"));
  const tex = useTexture(decor?.textureUrl || "");
  // @ts-ignore
  if (decor?.textureUrl && tex && tex.wrapS !== undefined) {
    // @ts-ignore
    tex.wrapS = tex.wrapT = 1000; // RepeatWrapping
    // @ts-ignore
    tex.repeat.set(2, 2);
    return <meshStandardMaterial map={tex} roughness={0.6} metalness={0.05} />;
  }
  const color = decor?.hex ?? "#cccccc";
  return <meshStandardMaterial color={color} roughness={0.7} metalness={0.05} />;
}

function WardrobeMesh({ b, h, d, decor, bays }: { b: number; h: number; d: number; decor?: string; bays?: BayConfig[] }) {
  // Units: 1 = 10 cm
  const sx = Math.max(1, b / 10);
  const sy = Math.max(1, h / 10);
  const sz = Math.max(1, d / 10);

  const maxPerBay = 80;
  const bayCount = bays?.length ?? Math.max(1, Math.ceil(b / maxPerBay));
  const widthsCm: number[] = Array.from({ length: bayCount }, (_, i) =>
    i === bayCount - 1 ? b - (bayCount - 1) * maxPerBay : Math.min(maxPerBay, b >= maxPerBay ? maxPerBay : b)
  );
  const widths = widthsCm.map(w => Math.max(1, w / 10));
  const doorGap = 0.02;

  return (
    <group>
      {/* Carcass */}
      <mesh position={[0, sy / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[sx, sy, sz]} />
        <MaterialMat decorId={decor} />
      </mesh>

      {/* Doors */}
      {widths.reduce((acc: JSX.Element[], w, i) => {
        const prev = widths.slice(0, i).reduce((s, v) => s + v, 0);
        const x = -sx / 2 + prev + w / 2;
        const hingeOffset = (i % 2 === 0 ? -1 : 1) * (w / 2 - doorGap);
        acc.push(
          <group key={`door-${i}`} position={[x, sy / 2, sz / 2 + 0.02]}>
            <mesh>
              <boxGeometry args={[w - doorGap, sy, 0.02]} />
              <MaterialMat decorId={decor} />
            </mesh>
            <mesh position={[hingeOffset * 0.8, 0, 0.02]}>
              <boxGeometry args={[0.06, 0.4, 0.04]} />
              <meshStandardMaterial color="#777" />
            </mesh>
          </group>
        );
        return acc;
      }, [])}

      {/* Dividers */}
      {widths.slice(0, -1).reduce((acc: JSX.Element[], w, i) => {
        const prev = widths.slice(0, i + 1).reduce((s, v) => s + v, 0);
        const x = -sx / 2 + prev;
        acc.push(
          <mesh key={`div-${i}`} position={[x, sy / 2, 0]}>
            <boxGeometry args={[0.02, sy * 0.98, sz * 0.98]} />
            <meshStandardMaterial color="#e6e6e6" />
          </mesh>
        );
        return acc;
      }, [])}

      {/* Interior */}
      {widths.map((w, bay) => {
        const prev = widths.slice(0, bay).reduce((s, v) => s + v, 0);
        const cx = -sx / 2 + prev + w / 2;
        const cfg = bays?.[bay];
        const items: JSX.Element[] = [];
        const shelves = cfg?.shelves ?? 3;
        const drawers = cfg?.drawers ?? 0;
        const rod = cfg?.rod ?? true;

        for (let s = 1; s <= shelves; s++) {
          const y = (sy * 0.1) + (s * (sy * 0.8) / (shelves + 1));
          items.push(
            <mesh key={`sh-${bay}-${s}`} position={[cx, y, 0]}>
              <boxGeometry args={[w * 0.95, 0.02, sz * 0.9]} />
              <meshStandardMaterial color="#efefef" />
            </mesh>
          );
        }
        for (let d_i = 0; d_i < drawers; d_i++) {
          const y = sy * 0.08 + d_i * 0.14;
          items.push(
            <mesh key={`dr-${bay}-${d_i}`} position={[cx, y, sz * 0.05 - sz/2 + 0.1]}>
              <boxGeometry args={[w * 0.9, 0.12, sz * 0.4]} />
              <meshStandardMaterial color="#dedede" />
            </mesh>
          );
        }
        if (rod) {
          items.push(
            <mesh key={`rod-${bay}`} position={[cx, sy * 0.75, 0]}>
              <cylinderGeometry args={[0.02, 0.02, w * 0.9, 12]} />
              <meshStandardMaterial color="#9aa0a6" />
            </mesh>
          );
        }
        return items;
      })}

      {/* Floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
        <planeGeometry args={[Math.max(12, sx * 1.6), Math.max(12, sz * 1.6)]} />
        <meshStandardMaterial color="#e9ecef" />
      </mesh>
    </group>
  );
}

// -------- UI bits (no shadcn) --------
function DecorPicker({ value, onChange, palette }: { value?: string; onChange: (id: string) => void, palette: PaletteItem[] }) {
  const [q, setQ] = useState("");
  const [brand, setBrand] = useState<"all"|"unilin"|"decolegno">("all");
  const data = useMemo(() =>
    palette.filter(p =>
      (brand==="all" || p.brand===brand) &&
      (p.name.toLowerCase().includes(q.toLowerCase()) || p.code.toLowerCase().includes(q.toLowerCase()))
    ), [q, brand]);
  return (
    <div className="space-y-2">
      <div className="font-medium">Decor/Kleur</div>
      <div className="flex gap-2">
        <input placeholder="Zoek op naam of code" value={q} onChange={e=>setQ(e.target.value)} className="border rounded-lg p-2 flex-1"/>
        <select value={brand} onChange={e=>setBrand(e.target.value as any)} className="border rounded-lg p-2">
          <option value="all">Alle</option>
          <option value="unilin">Unilin Evola</option>
          <option value="decolegno">DecoLegno</option>
        </select>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-64 overflow-auto">
        {data.map(item => (
          <button key={item.id} onClick={()=>onChange(item.id)}
            className={`text-left rounded-xl border p-2 hover:bg-gray-50 ${value===item.id ? "ring-2 ring-black" : ""}`}>
            <div className="h-12 w-full rounded mb-2" style={{background: item.hex || "#ccc"}}/>
            <div className="text-sm font-medium truncate">{item.name}</div>
            <div className="text-xs text-gray-500">{item.brand==="unilin" ? "Unilin" : "DecoLegno"} • {item.code}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function BaysConfigurator({ cfg, setCfg, totalWidth }: { cfg: Selections; setCfg: any; totalWidth: number }) {
  const maxPerBay = 80;
  const defaultCount = Math.max(1, Math.ceil(totalWidth / maxPerBay));
  const bays: BayConfig[] = (cfg._bays as any) ?? Array.from({ length: defaultCount }, () => ({ shelves: 3, drawers: 0, rod: true }));
  const setBay = (i: number, next: Partial<BayConfig>) => {
    const copy = bays.map((b, idx) => idx === i ? { ...b, ...next } : b);
    setCfg((c:Selections) => ({ ...c, _bays: copy }));
  };
  const setCount = (n: number) => {
    const cur = bays;
    const next = Array.from({ length: n }, (_, i) => cur[i] ?? { shelves: 3, drawers: 0, rod: true });
    setCfg((c:Selections) => ({ ...c, _bays: next }));
  };
  return (
    <div className="space-y-2">
      <div className="font-medium">Interieur per vak</div>
      <div className="flex items-center gap-2">
        <span className="text-sm">Aantal vakken</span>
        <input type="number" className="border rounded-lg p-2 w-24" value={bays.length}
          onChange={e=>setCount(Math.max(1, Math.min(10, Number(e.target.value)||defaultCount)))} />
        <span className="text-xs text-gray-500">Max 80 cm per vak (aanbevolen: {defaultCount})</span>
      </div>
      <div className="grid md:grid-cols-2 gap-2">
        {bays.map((b, i)=>(
          <div key={i} className="border rounded-xl p-3 space-y-2">
            <div className="font-medium">Vak {i+1}</div>
            <div className="flex items-center gap-2">
              <label className="w-24 text-sm">Planken</label>
              <input type="number" className="border rounded-lg p-2 w-24" value={b.shelves}
                onChange={e=>setBay(i,{ shelves: Math.max(0, Number(e.target.value)||0) })}/>
            </div>
            <div className="flex items-center gap-2">
              <label className="w-24 text-sm">Lades</label>
              <input type="number" className="border rounded-lg p-2 w-24" value={b.drawers}
                onChange={e=>setBay(i,{ drawers: Math.max(0, Number(e.target.value)||0) })}/>
            </div>
            <div className="flex items-center gap-2">
              <label className="w-24 text-sm">Roede</label>
              <input type="checkbox" checked={b.rod} onChange={e=>setBay(i,{ rod: e.target.checked })}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// -------- Pricing --------
function calcPrice(bTot:number, h:number, d:number, baysCfg:BayConfig[]|undefined) {
  const basePerCm = 900/100; // €9 per cm
  const maxPerBay = 80;
  const bayCount = baysCfg?.length ?? Math.max(1, Math.ceil(bTot / maxPerBay));
  const widths:number[] = Array.from({length: bayCount}, (_, i) => i===bayCount-1 ? bTot - (bayCount-1)*maxPerBay : Math.min(maxPerBay, bTot>=maxPerBay?maxPerBay:bTot));

  let total = 0;
  const lines:{label:string;price:number}[] = [];

  widths.forEach((wb, idx)=>{
    let price = wb * basePerCm;
    if (h > 240) {
      const extraH = Math.min(h, 275) - 240;
      price += extraH * 2 * (wb / 100);
    }
    if (d > 55) {
      const extraD = d - 55;
      price += extraD * 10 * (wb / 100);
    }
    total += price;
    lines.push({ label: `Vak ${idx+1} (${Math.round(wb)} cm)`, price: Math.round(price) });
  });

  // interior items
  const shelfPrice = 20, drawerPrice=60, rodPrice=25;
  (baysCfg ?? []).forEach((b, i)=>{
    if (b.shelves) { lines.push({ label: `Vak ${i+1}: ${b.shelves} planken`, price: b.shelves*shelfPrice }); total += b.shelves*shelfPrice; }
    if (b.drawers) { lines.push({ label: `Vak ${i+1}: ${b.drawers} lades`, price: b.drawers*drawerPrice }); total += b.drawers*drawerPrice; }
    if (b.rod) { lines.push({ label: `Vak ${i+1}: roede`, price: rodPrice }); total += rodPrice; }
  });

  return { total: Math.round(total), lines };
}

// -------- PDF --------
function makePdf(cfg:Selections, price:{total:number;lines:{label:string;price:number}[]}){
  const doc = new jsPDF();
  const now = new Date();
  doc.setFontSize(16);
  doc.text("Adzaagt – Offerte maatkast", 14, 18);
  doc.setFontSize(10);
  doc.text(`Datum: ${now.toLocaleDateString()}`, 14, 26);

  let y = 36;
  doc.setFontSize(12);
  doc.text("Configuratie", 14, y); y+=6;
  const basic = [
    `Breedte: ${cfg.breedte} cm`,
    `Hoogte: ${cfg.hoogte} cm`,
    `Diepte: ${cfg.diepte} cm`,
    `Vakken: ${(cfg._bays?.length ?? Math.ceil(cfg.breedte/80))}`,
    `Decor: ${ALL_PALETTE.find(p=>p.id===cfg.decor)?.name || cfg.decor}`
  ];
  basic.forEach(line => { doc.text(line, 14, y); y+=6; });

  y+=4;
  doc.setFontSize(12);
  doc.text("Prijsopbouw", 14, y); y+=6;
  doc.setFontSize(10);
  price.lines.forEach(row => {
    doc.text(row.label, 14, y);
    doc.text(`€ ${row.price}`, 180, y, { align: "right" });
    y+=6;
    if (y>270) { doc.addPage(); y=20; }
  });
  y+=4;
  doc.setFontSize(12);
  doc.text(`Totaal: € ${price.total}`, 14, y);

  doc.save("offerte.pdf");
}

// -------- Lead submit (with offline fallback) --------
async function submitLead(payload:any){
  try {
    const res = await fetch("/api/lead", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(payload) });
    if (!res.ok) throw new Error("Failed");
    return true;
  } catch (e) {
    // fallback: download JSON
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type:"application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `lead-${Date.now()}.json`; a.click();
    URL.revokeObjectURL(url);
    return false;
  }
}

// -------- Main Component --------
export default function MaatkastConfiguratorPOC(){
  const [cfg, setCfg] = useState<Selections>({
    breedte: 180, hoogte: 240, diepte: 55,
    decor: "unilin-u190", collectie: "unilin",
    _bays: undefined as undefined | BayConfig[],
    grepen: "g1", softclose: "ja"
  });
  const errors = useMemo(()=>{
    const e:string[] = [];
    const b = Number(cfg.breedte), h = Number(cfg.hoogte), d = Number(cfg.diepte);
    if (b < 100 || b > 400) e.push("Breedte (totaal) moet tussen 100 en 400 cm liggen.");
    if (h < 180 || h > 275) e.push("Hoogte moet tussen 180 en 275 cm liggen (max 275 cm).");
    if (d < 40 || d > 80) e.push("Diepte moet tussen 40 en 80 cm liggen.");
    const requiredBays = Math.max(1, Math.ceil(b / 80));
    if (b > 80 && (!Array.isArray(cfg._bays) || cfg._bays.length < requiredBays)) {
      e.push("Maximale breedte per vak is 80 cm. Verhoog het aantal vakken in 'Interieur per vak'.");
    }
    if (cfg.grepen === "g3" && cfg.softclose === "nee") e.push("Greeploos vereist soft-close.");
    return e;
  }, [cfg]);

  const price = useMemo(()=>calcPrice(Number(cfg.breedte), Number(cfg.hoogte), Number(cfg.diepte), cfg._bays), [cfg]);
  // runtime palettes from CSV (fallback to built-in if empty)
  const [runtimePalette, setRuntimePalette] = useState<PaletteItem[] | null>(null);
  const palette = useMemo(()=> (runtimePalette && runtimePalette.length>0) ? runtimePalette : ALL_PALETTE, [runtimePalette]);
  // load from /public/palettes on mount
  useState(()=>{ (async()=>{ try { const p = await loadPalettes(); setRuntimePalette(p); } catch(e){} })(); });


  const onLead = async () => {
    const ok = await submitLead({ name, email, phone, notes, total: price.total, cfg });
    setLeadStatus(ok ? "sent" : "downloaded");
  };

  // lead form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [leadStatus, setLeadStatus] = useState<"idle"|"sent"|"downloaded">("idle");

  // derive bays for 3D
  const bays:BayConfig[]|undefined = cfg._bays ?? undefined;


  // expose palette for MaterialMat
  if (typeof window !== 'undefined') { (window as any).__ADZ_PALETTE__ = palette; }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <header className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Adzaagt – Maatkast Configurator</h1>
        <div className="text-xs text-gray-500">Max hoogte 275 cm • Max 80 cm per vak</div>
      </header>

      <section className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="border rounded-xl p-4 space-y-3">
            <div className="font-medium">Maten</div>
            <div className="grid grid-cols-3 gap-3">
              <label className="text-sm">Breedte (cm)
                <input type="number" className="mt-1 border rounded-lg p-2 w-full"
                  value={cfg.breedte}
                  onChange={e=>setCfg(c=>({...c, breedte: clamp(Number(e.target.value)||180, 100, 400)}))}/>
              </label>
              <label className="text-sm">Hoogte (cm)
                <input type="number" className="mt-1 border rounded-lg p-2 w-full"
                  value={cfg.hoogte}
                  onChange={e=>setCfg(c=>({...c, hoogte: clamp(Number(e.target.value)||240, 180, 275)}))}/>
              </label>
              <label className="text-sm">Diepte (cm)
                <input type="number" className="mt-1 border rounded-lg p-2 w-full"
                  value={cfg.diepte}
                  onChange={e=>setCfg(c=>({...c, diepte: clamp(Number(e.target.value)||55, 40, 80)}))}/>
              </label>
            </div>
          </div>

          <div className="border rounded-xl p-4 space-y-3">
            <DecorPicker
              value={cfg.decor}
              onChange={(id)=>setCfg(c=>({...c, decor:id, collectie: id.startsWith("decolegno") ? "decolegno" : "unilin"}))}
              palette={palette}
            />
          </div>

          <div className="border rounded-xl p-4 space-y-3">
            <BaysConfigurator cfg={cfg} setCfg={setCfg} totalWidth={Number(cfg.breedte)} />
          </div>

          {errors.length > 0 && (
            <div className="border rounded-xl p-4 bg-amber-50 text-amber-900 text-sm">
              <div className="font-medium mb-2">Let op</div>
              <ul className="list-disc ml-5 space-y-1">{errors.map((e,i)=>(<li key={i}>{e}</li>))}</ul>
            </div>
          )}

          <div className="border rounded-xl p-4 space-y-2">
            <div className="font-medium">Prijsopbouw</div>
            <ul className="text-sm space-y-1">
              {price.lines.map((l,i)=>(
                <li key={i} className="flex justify-between"><span>{l.label}</span><span>€ {l.price}</span></li>
              ))}
            </ul>
            <div className="flex justify-between font-semibold pt-2 border-t">
              <span>Totaal</span><span>€ {price.total}</span>
            </div>

            <div className="flex gap-2 pt-2">
              <button onClick={()=>makePdf(cfg, price)} className="inline-flex items-center gap-2 border rounded-lg px-3 py-2 hover:bg-gray-50">
                <FileDown size={16}/> Offerte PDF
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border overflow-hidden">
            <div className="flex items-center justify-between p-3">
              <div className="flex items-center gap-2 text-sm"><Eye className="h-4 w-4"/>3D Preview (draaideuren)</div>
              <div className="text-xs text-gray-500">Schaal 1u ≈ 10 cm</div>
            </div>
            <div className="h-80">
              <Canvas shadows camera={{ position: [8, 8, 10], fov: 45 }}>
                <ambientLight intensity={0.6} />
                <directionalLight position={[6, 10, 6]} intensity={0.8} castShadow />
                <WardrobeMesh b={Number(cfg.breedte)} h={Number(cfg.hoogte)} d={Number(cfg.diepte)} decor={String(cfg.decor)} bays={bays} />
                <Environment preset="warehouse" />
                <OrbitControls enablePan enableRotate enableZoom />
              </Canvas>
            </div>
          </div>

          <div className="border rounded-xl p-4 space-y-3">
            <div className="font-medium">Offerte aanvragen</div>
            <div className="grid md:grid-cols-2 gap-3">
              <label className="text-sm">Naam
                <input className="mt-1 border rounded-lg p-2 w-full" value={name} onChange={e=>setName(e.target.value)} />
              </label>
              <label className="text-sm">E-mail
                <input className="mt-1 border rounded-lg p-2 w-full" value={email} onChange={e=>setEmail(e.target.value)} />
              </label>
              <label className="text-sm md:col-span-2">Telefoon
                <input className="mt-1 border rounded-lg p-2 w-full" value={phone} onChange={e=>setPhone(e.target.value)} />
              </label>
              <label className="text-sm md:col-span-2">Opmerkingen
                <textarea className="mt-1 border rounded-lg p-2 w-full" rows={3} value={notes} onChange={e=>setNotes(e.target.value)} />
              </label>
            </div>
            <button onClick={onLead} className="inline-flex items-center gap-2 border rounded-lg px-3 py-2 hover:bg-gray-50">
              <Send size={16}/> Verstuur offerte-aanvraag
            </button>
            {leadStatus!=="idle" && (
              <div className={`flex items-center gap-2 text-sm pt-2 ${leadStatus==="sent" ? "text-green-700" : "text-blue-700"}`}>
                <CheckCircle size={16}/>
                {leadStatus==="sent" ? "Verzonden! Check je inbox." : "Geen mail ingesteld — JSON gedownload als fallback."}
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
