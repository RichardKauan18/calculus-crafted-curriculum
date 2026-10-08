import { createFileRoute } from '@tanstack/react-router'
import { LiveLevelPage } from '@/components/platform'
export const Route=createFileRoute('/pre-vestibular')({head:()=>({meta:[{title:'Pré-vestibular — Matris'}]}),component:()=> <LiveLevelPage level="pre-vestibular"/>})
