# Icons & Splash (iOS/Android)

## Eenvoudigste manier (Capacitor Assets)
1) Installeer:
```bash
pnpm add -D @capacitor/assets
```
2) Plaats een vierkante bronafbeelding (minimaal 1024x1024) in `assets/icon.png`.
3) Genereer alle iconen & splash:
```bash
pnpm cap:open:ios   # (eenmalig platforms toevoegen/openen)
pnpm cap:open:android
npx capacitor-assets generate --ios --android
```
Dit vult de juiste mappen in Xcode/Android Studio.

## Handmatig (als alternatief)
- iOS: Xcode → Assets.xcassets → AppIcon + LaunchScreen (storyboard of assets).
- Android: `app/src/main/res/mipmap-*` voor icons, `drawable-*` voor splash.

## Tips
- Houd iconen zonder tekst (Apple/Google guidelines).
- Transparante PNG werkt, maar splash meestal **ontransparant** (effen achtergrond).
