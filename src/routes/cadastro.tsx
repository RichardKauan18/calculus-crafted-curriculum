import { createFileRoute } from '@tanstack/react-router'
import { LiveAuthPage } from '@/components/platform'
export const Route=createFileRoute('/cadastro')({head:()=>({meta:[{title:'Criar conta — Matris'},{name:'description',content:'Crie sua conta e acompanhe seu progresso.'}]}),component:()=> <LiveAuthPage signup/>})
