import { createFileRoute } from '@tanstack/react-router'
import { LiveHomePage } from '@/components/platform'
export const Route=createFileRoute('/')({head:()=>({meta:[{title:'Matris — Matemática simples, clara e objetiva'},{name:'description',content:'Aulas gravadas de Matemática do Fundamental aos concursos militares.'}]}),component:LiveHomePage})
