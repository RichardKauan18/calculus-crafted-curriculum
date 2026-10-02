import { createFileRoute } from '@tanstack/react-router'
import { CategoryPage } from '@/components/pages'
export const Route = createFileRoute('/fundamental')({ head:()=>({meta:[{title:'fundamental — Matris'},{name:'description',content:'Aulas de Matemática para fundamental.'},{property:'og:title',content:'fundamental — Matris'},{property:'og:description',content:'Trilha organizada de Matemática.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}), component:()=> <CategoryPage slug="fundamental"/> })
