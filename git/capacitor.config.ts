import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'nl.adzaagt.configurator',
  appName: 'Adzaagt Configurator',
  webDir: 'out',
  // Hosted mode (laad live URL – geen app-update nodig voor content):
  // server: { url: 'https://configurator.adzaagt.nl', cleartext: false },
};

export default config;
