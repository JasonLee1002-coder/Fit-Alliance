import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? ''
  return {
    name: '瘦身減肥競技場',
    short_name: '健身競技場',
    description: '一起變瘦，一起變強。AI 教練陪你減脂，群體力量讓你堅持。',
    start_url: base ? `${base}/` : '/',
    scope: base ? `${base}/` : '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#10B981',
    theme_color: '#10B981',
    lang: 'zh-TW',
    icons: [
      { src: `${base}/icon-192.png`, sizes: '192x192', type: 'image/png', purpose: 'any' as const },
      { src: `${base}/icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'any' as const },
      { src: `${base}/icon-512.png`, sizes: '512x512', type: 'image/png', purpose: 'maskable' as const },
    ],
  }
}
