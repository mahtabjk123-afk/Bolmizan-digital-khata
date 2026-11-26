import { defineConfig } from '@playwright/test';
export default defineConfig({
  testDir: './tests',
  use: { headless: false, viewport: { width: 412, height: 915 } }, // Mobile Pixel 7 Screen Size
  webServer: {
    command: 'npm run preview',
    port: 4173,
    reuseExistingServer: true,
  },
});
