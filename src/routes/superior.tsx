import { createFileRoute } from '@tanstack/react-router'
import { CategoryPage } from '@/components/pages'
export const Route = createFileRoute('/superior')({ head:()=>({meta:[{title:'superior — Matris'},{name:'description',content:'Aulas de Matemática para superior.'},{property:'og:title',content:'superior — Matris'},{property:'og:description',content:'Trilha organizada de Matemática.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}), component:()=> <CategoryPage slug="superior"/> })
