import { createFileRoute } from '@tanstack/react-router'
import { LiveConcursosPage } from '@/components/platform'
export const Route=createFileRoute('/concursos/')({head:()=>({meta:[{title:'Concursos — Matris'},{name:'description',content:'Preparação por concursos militares.'}]}),component:LiveConcursosPage})
