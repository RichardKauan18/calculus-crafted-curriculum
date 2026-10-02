import { createFileRoute } from '@tanstack/react-router'
import { CategoryPage } from '@/components/pages'
export const Route = createFileRoute('/ensino-medio')({ head:()=>({meta:[{title:'ensino-medio — Matris'},{name:'description',content:'Aulas de Matemática para ensino-medio.'},{property:'og:title',content:'ensino-medio — Matris'},{property:'og:description',content:'Trilha organizada de Matemática.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}), component:()=> <CategoryPage slug="ensino-medio"/> })
