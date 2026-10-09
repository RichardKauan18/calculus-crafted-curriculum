import { createFileRoute } from '@tanstack/react-router'
import { LiveSearchPage } from '@/components/platform'

export const Route = createFileRoute('/pesquisa')({
  head: () => ({ meta: [{ title: 'Pesquisar aulas — Matris' }, { name: 'description', content: 'Pesquise aulas publicadas por título, matéria ou descrição.' }] }),
  component: LiveSearchPage,
})
