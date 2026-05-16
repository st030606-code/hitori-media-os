import path from 'node:path'
import type {NextConfig} from 'next'

const nextConfig: NextConfig = {
  // Pin Turbopack root to this directory; otherwise Turbopack auto-detects an
  // ancestor `package-lock.json` (e.g. `~/package-lock.json`) and emits a
  // multi-lockfile warning on every build.
  turbopack: {
    root: path.resolve(__dirname),
  },
}

export default nextConfig
