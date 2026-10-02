import { createFileRoute } from '@tanstack/react-router'
import { AdminDashboard } from '@/components/admin-pages'

export const Route = createFileRoute('/professor/')({
  head: () => ({
    meta: [
      { title: 'Painel do professor — Matris' },
      { name: 'description', content: 'Visão geral demonstrativa da plataforma.' },
      { property: 'og:title', content: 'Painel do professor — Matris' },
      { property: 'og:description', content: 'Visão geral demonstrativa da plataforma.' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
    ],
  }),
  component: AdminDashboard,
})