import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { createRequire } from 'module'

// Custom plugin to generate QR code
const qrcodePlugin = () => {
  return {
    name: 'qrcode-plugin',
    configureServer() {
      // Generate QR code after a delay to let server start
      setTimeout(() => {
        const url = 'http://192.168.0.50:5173/'
        console.log('\n📱 Scan this QR code to access the app on your mobile device:')
        console.log(`🔗 URL: ${url}\n`)

        try {
          const requireFunc = createRequire(import.meta.url)
          const qrcode = requireFunc('qrcode-terminal')
          qrcode.generate(url, { small: true })
        } catch {
          console.log('Note: QR code generation failed, but you can still access the URL above')
        }
      }, 1000)
    }
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), qrcodePlugin()],
})
