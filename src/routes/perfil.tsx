import { createFileRoute } from '@tanstack/react-router'
import { LiveProfilePage } from '@/components/platform'
export const Route=createFileRoute('/perfil')({head:()=>({meta:[{title:'Perfil — Matris'},{name:'description',content:'Acompanhe seu progresso de estudos.'}]}),component:LiveProfilePage})
