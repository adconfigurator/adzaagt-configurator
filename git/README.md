# Adzaagt Configurator – Losstaande App (Web + iOS/Android)

## Snel starten
```bash
pnpm install
pnpm dev
# open http://localhost:3000/configurator
```

Plak je configuratorcomponent uit de canvas in:
```
src/components/MaatkastConfiguratorPOC.tsx
```

## Build (web)
```bash
pnpm build
pnpm start
# of statisch exporteren
pnpm export
```

## Capacitor (iOS/Android)
```bash
pnpm exec cap add ios
pnpm exec cap add android
pnpm run export        # maakt 'out/'
pnpm run cap:copy
pnpm run cap:open:ios
pnpm run cap:open:android
```

ENV voor lead e-mails (optioneel, als je /api/lead gebruikt):
```
SMTP_HOST=...
SMTP_PORT=587
SMTP_USER=...
SMTP_PASS=...
MAIL_FROM=Adzaagt <noreply@adzaagt.nl>
MAIL_TO=productie@adzaagt.nl
```

Meer details vind je in de implementatiehandleiding (canvas).


## Extra
- Zie `.env.example` voor SMTP voorbeelden.
- Zie `docs/Store-Checklist.md` voor App Store / Play Store stappen.
