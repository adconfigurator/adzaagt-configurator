# Vercel Deployment – Hosting Preset (v8)

## 1) Repo importeren
- Maak een GitHub-repo (bijv. `adzaagt-configurator`).
- Commit en push de inhoud van deze map naar `main`.

## 2) Vercel Project
- Ga naar https://vercel.com → **Add New → Project** → importeer de repo.
- Framework: **Next.js** (wordt automatisch gedetecteerd).
- Laat build-settings op default.

## 3) Environment Variables (Production)
Voeg in **Settings → Environment Variables** toe:
```
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=<JOUW_SENDGRID_API_KEY>
MAIL_FROM=Adzaagt <noreply@adzaagt.nl>
MAIL_TO=productie@adzaagt.nl
```
> Je kunt later ook **Preview** en **Development** env’s instellen, maar Production is genoeg om mail te ontvangen.

## 4) Deploy
- Klik **Deploy**. Na de build is de site live op een *.vercel.app URL.
- De configurator staat op **/configurator**.

## 5) Eigen (sub)domein koppelen
- Vercel **Settings → Domains → Add**: `configurator.adzaagt.nl`
- Volg de DNS-instructie van Vercel: maak een **CNAME** naar de getoonde alias.
- Wacht tot “Verified” → domein is actief met HTTPS.

## 6) Test
- Open `https://configurator.adzaagt.nl/configurator`
- Test: maten aanpassen, 3D, kleurenlijst, PDF, lead-form (krijg je een mail?)
- Geen SMTP? Dan downloadt de app **automatisch een JSON** bij lead-submit.

## 7) Updates plaatsen
- Push naar `main` → Vercel deployt automatisch.
- Palettes aanpassen? Vervang CSV’s in `public/palettes/` en push.

## 8) (Optioneel) Embedden in je hoofdsite
Plaats deze snippet in een pagina van je bestaande site:
```html
<iframe src="https://configurator.adzaagt.nl/configurator"
        style="width:100%;height:90vh;border:0"
        title="Adzaagt Configurator"></iframe>
```

## Veelvoorkomende vragen
**E-mail komt niet aan** → Check SMTP_* env vars en domain reputation; probeer MAIL_TO tijdelijk op je eigen adres.
**Witte pagina** → Controleer dat je naar `/configurator` gaat (niet `/`).
**Kleuren niet zichtbaar** → CSV’s staan in `public/palettes/`. Herlaad; in productie kan caching ~1 min duren.
