import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Finanzas La Viña',
    short_name: 'Finanzas',
    description: 'Sistema de gestión financiera de La Viña',
    start_url: '/',
    display: 'standalone',
    background_color: '#0a0a0a',
    theme_color: '#0a0a0a',
    icons: [
      {
        src: '/logo_vina_png.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/logo_vina_png.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  }
}
