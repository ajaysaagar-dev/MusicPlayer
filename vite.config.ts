import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import electron from 'vite-plugin-electron'
import renderer from 'vite-plugin-electron-renderer'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // Only load Electron plugins if we are in Electron mode
    ...(process.env.ELECTRON ? [
      electron([
        {
          entry: 'electron/main.ts',
          vite: {
            build: {
              rollupOptions: {
                output: {
                  format: 'cjs',
                  entryFileNames: '[name].js'
                }
              }
            }
          }
        },
        {
          entry: 'electron/preload.ts',
          onUpdate(args) {
            args.reload()
          },
          vite: {
            build: {
              rollupOptions: {
                output: {
                  format: 'cjs',
                  entryFileNames: '[name].js'
                }
              }
            }
          }
        },
      ]),
      renderer(),
    ] : []),
  ],
})
