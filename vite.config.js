import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  assetsInclude: ['**/*.glb', '**/*.gltf', '**/*.fbx'],
  server: {
    watch: {
      ignored: ['**/*.glb', '**/*.gltf', '**/*.fbx', '**/public/models/**'],
    },
  },
})