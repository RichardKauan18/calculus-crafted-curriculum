import { createFileRoute } from '@tanstack/react-router'
import { CategoryPage } from '@/components/pages'
export const Route = createFileRoute('/pre-vestibular')({ head:()=>({meta:[{title:'pre-vestibular — Matris'},{name:'description',content:'Aulas de Matemática para pre-vestibular.'},{property:'og:title',content:'pre-vestibular — Matris'},{property:'og:description',content:'Trilha organizada de Matemática.'},{property:'og:type',content:'website'},{name:'twitter:card',content:'summary_large_image'}]}), component:()=> <CategoryPage slug="pre-vestibular"/> })
