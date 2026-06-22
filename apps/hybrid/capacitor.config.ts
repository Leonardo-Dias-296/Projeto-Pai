import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.autocontrol.app',
  appName: 'AutoControl',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
  },
};

export default config;
