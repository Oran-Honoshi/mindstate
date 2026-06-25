import { defineConfig } from '@playwright/test'

export default defineConfig({
  testMatch: '*.spec.ts',
  use: { headless: true },
  timeout: 30000,
  workers: 1,
})
