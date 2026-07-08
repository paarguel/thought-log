import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.urbanpyx.thinkingerrors',
  appName: 'Thought Record',
  // The static export is bundled into the app and served from disk.
  // No server block: the app is fully offline and never talks to a network.
  webDir: 'out',
};

export default config;
