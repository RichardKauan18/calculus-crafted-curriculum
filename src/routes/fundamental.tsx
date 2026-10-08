import { createFileRoute } from '@tanstack/react-router'
import { LiveLevelPage } from '@/components/platform'
export const Route=createFileRoute('/fundamental')({head:()=>({meta:[{title:'Fundamental — Matris'}]}),component:()=> <LiveLevelPage level="fundamental"/>})
