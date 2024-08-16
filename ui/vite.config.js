import { defineConfig } from 'vite'
import { resolve } from 'path'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    global: true,
    environment: "jsdom",
    setupFiles: "./setupTest.js"
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'index.js'),
      formats: ['es']
    }
  }
});
