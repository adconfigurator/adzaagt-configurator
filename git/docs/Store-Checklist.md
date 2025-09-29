# Store Checklist – iOS & Android

## iOS (App Store)
- Apple Developer Program (paid)
- App name, subtitle, description, keywords
- 1024×1024 app icon source
- Screenshots (6.7" / 5.5")
- Privacy policy URL
- Xcode: set Team, Bundle ID `nl.adzaagt.configurator`
- Capabilities: none required (WebView only)
- Archive → Distribute to App Store Connect
- In App Store Connect: fill compliance, content rights
- Submit for review

## Android (Play Store)
- Play Console account
- App listing (title, short description, full description)
- Icons: foreground/background (adaptive)
- Feature graphic (1024×500)
- Screenshots (phone/tablet)
- Privacy policy URL
- Android Studio: Build → Generate Signed Bundle (AAB)
- Upload AAB, create release, roll out to production

## Versioning & Updates
- Bump version/build in iOS (Xcode) and Android (Gradle)
- Hosted mode (Capacitor server.url) allows content updates without app updates
