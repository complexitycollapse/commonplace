import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  "./ui/vite.config.js",
  "./test-app/vite.config.js",
  "./core/vite.config.js",
  "./document-model/vite.config.js",
  "./html/vite.config.js",
  "./utils/vite.config.js",
  "./interpreter/vite.config.js"
])
