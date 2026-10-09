import {useCallback,useEffect,useState} from 'react'
import {supabase,hasSupabaseConfig} from '@/lib/supabase'

export type PlatformLesson={id:string;title:string;subject:string;duration:string;video_id:string;level:string;concurso_id:string|null;description:string;created_at:string;updated_at:string}
export type Concurso={id:string;name:string;full_name:string;category:string;subjects:string[];description:string;created_at:string}
export type Rating={id:string;lesson_id:string;user_id:string;rating:number;created_at:string}
export type Progress={id:string;lesson_id:string;user_id:string;status:'watching'|'half'|'completed';updated_at:string}
export type Comment={id:string;lesson_id:string;user_id:string;user_name:string;text:string;reply:string|null;replied_by:string|null;replied_at:string|null;created_at:string;lesson_title?:string}

export function useLessons(level?:string,search=''){
 const [lessons,setLessons]=useState<PlatformLesson[]>([]);const [loading,setLoading]=useState(true);const [error,setError]=useState<string|null>(null)
 const load=useCallback(async()=>{
  if(!hasSupabaseConfig){setLessons([]);setError(null);setLoading(false);return}
  setLoading(true);setError(null)
  try{
   const q=supabase.from('lessons').select('*').order('created_at',{ascending:true})
   const result=level?await q.eq('level',level):await q
   if(result.error){setLessons([]);setError('Não foi possível carregar as aulas. Verifique sua conexão e tente novamente.');return}
   let list=(result.data??[]) as PlatformLesson[]
   if(search.trim()){const s=search.trim().toLocaleLowerCase('pt-BR');list=list.filter(l=>[l.title,l.subject,l.description].join(' ').toLocaleLowerCase('pt-BR').includes(s))}
   setLessons(list)
  }catch{
   setLessons([])
   setError('Ocorreu uma falha ao carregar as aulas. Tente novamente.')
  }finally{setLoading(false)}
 },[level,search])
 useEffect(()=>{void load()},[load]);return{lessons,loading,error,refetch:load}
}
export function useConcursos(){const[items,setItems]=useState<Concurso[]>([]);const[loading,setLoading]=useState(true);const[error,setError]=useState<string|null>(null);const load=useCallback(async()=>{if(!hasSupabaseConfig){setItems([]);setError(null);setLoading(false);return};setLoading(true);setError(null);try{const result=await supabase.from('concursos').select('*').order('name');if(result.error){setItems([]);setError('Não foi possível carregar os concursos. Tente novamente.');return}setItems((result.data??[]) as Concurso[])}catch{setItems([]);setError('Ocorreu uma falha ao carregar os concursos. Tente novamente.')}finally{setLoading(false)}},[]);useEffect(()=>{void load()},[load]);return{concursos:items,loading,error,refetch:load}}
export function useLesson(id:string|undefined){const[lesson,setLesson]=useState<PlatformLesson|null>(null);const[loading,setLoading]=useState(Boolean(id));const[error,setError]=useState<string|null>(null);const load=useCallback(async()=>{if(!id||!hasSupabaseConfig){setLesson(null);setError(null);setLoading(false);return}setLoading(true);setError(null);try{const result=await supabase.from('lessons').select('*').eq('id',id).maybeSingle();if(result.error){setLesson(null);setError('Não foi possível carregar esta aula. Tente novamente.');return}setLesson(result.data as PlatformLesson|null)}catch{setLesson(null);setError('Ocorreu uma falha ao carregar esta aula. Tente novamente.')}finally{setLoading(false)}},[id]);useEffect(()=>{void load()},[load]);return{lesson,loading,error,refetch:load}}
export function useRatings(lessonId:string|undefined){
 const [ratings,setRatings]=useState<Rating[]>([])
 const [loading,setLoading]=useState(Boolean(lessonId&&hasSupabaseConfig))
 const [error,setError]=useState<string|null>(null)
 const load=useCallback(async()=>{
  if(!lessonId||!hasSupabaseConfig){setRatings([]);setError(null);setLoading(false);return}
  setLoading(true);setError(null)
  try{
   const result=await supabase.from('ratings').select('*').eq('lesson_id',lessonId)
   if(result.error){setRatings([]);setError('Não foi possível carregar as avaliações. Tente novamente.');return}
   setRatings((result.data??[]) as Rating[])
  }catch{setRatings([]);setError('Ocorreu uma falha ao carregar as avaliações. Tente novamente.')}
  finally{setLoading(false)}
 },[lessonId])
 useEffect(()=>{void load()},[load])
 const avg=ratings.length?ratings.reduce((sum,rating)=>sum+rating.rating,0)/ratings.length:0
 return {ratings,avg,count:ratings.length,loading,error,refetch:load}
}
export function useMyProgress(lessonId:string|undefined,userId:string|undefined){
 const [progress,setProgress]=useState<Progress|null>(null)
 const [loading,setLoading]=useState(Boolean(lessonId&&userId&&hasSupabaseConfig))
 const [error,setError]=useState<string|null>(null)
 const load=useCallback(async()=>{
  if(!lessonId||!userId||!hasSupabaseConfig){setProgress(null);setError(null);setLoading(false);return}
  setLoading(true);setError(null)
  try{
   const result=await supabase.from('lesson_progress').select('*').eq('lesson_id',lessonId).eq('user_id',userId).maybeSingle()
   if(result.error){setProgress(null);setError('Não foi possível carregar o progresso desta aula.');return}
   setProgress(result.data as Progress|null)
  }catch{setProgress(null);setError('Ocorreu uma falha ao carregar o progresso desta aula.')}
  finally{setLoading(false)}
 },[lessonId,userId])
 useEffect(()=>{void load()},[load])
 return {progress,loading,error,refetch:load}
}
export function useProgressSummary(userId:string|undefined){
 const [items,setItems]=useState<Progress[]>([])
 const [loading,setLoading]=useState(Boolean(userId&&hasSupabaseConfig))
 const [error,setError]=useState<string|null>(null)
 const load=useCallback(async()=>{
  if(!userId||!hasSupabaseConfig){setItems([]);setError(null);setLoading(false);return}
  setLoading(true);setError(null)
  try{
   const result=await supabase.from('lesson_progress').select('id,lesson_id,user_id,status,updated_at').eq('user_id',userId)
   if(result.error){setItems([]);setError('Não foi possível carregar seu progresso. Tente novamente.');return}
   setItems((result.data??[]) as Progress[])
  }catch{setItems([]);setError('Ocorreu uma falha ao carregar seu progresso. Tente novamente.')}
  finally{setLoading(false)}
 },[userId])
 useEffect(()=>{void load()},[load])
 return {items,loading,error,refetch:load,completedCount:items.filter(item=>item.status==='completed').length,inProgressCount:items.filter(item=>item.status==='watching'||item.status==='half').length}
}

export async function saveProgress(lessonId:string,status:Progress['status']){return supabase.from('lesson_progress').upsert({lesson_id:lessonId,status,updated_at:new Date().toISOString()},{onConflict:'lesson_id,user_id'})}
export async function saveRating(lessonId:string,rating:number){return supabase.from('ratings').upsert({lesson_id:lessonId,rating},{onConflict:'lesson_id,user_id'})}
export function useComments(lessonId:string|undefined){const[comments,setComments]=useState<Comment[]>([]);const[loading,setLoading]=useState(Boolean(lessonId));const load=useCallback(async()=>{if(!lessonId||!hasSupabaseConfig){setLoading(false);return};const{data}=await supabase.from('comments').select('*, lessons(title)').eq('lesson_id',lessonId).order('created_at',{ascending:false});setComments(((data??[]) as (Comment & {lessons?:{title:string}|null})[]).map(c=>({...c,lesson_title:c.lessons?.title??''})));setLoading(false)},[lessonId]);useEffect(()=>{load()},[load]);return{comments,loading,refetch:load}}
export async function addComment(lessonId:string,userName:string,text:string){return supabase.from('comments').insert({lesson_id:lessonId,user_name:userName,text})}
export async function replyToComment(id:string,reply:string){return supabase.rpc('reply_to_comment',{p_comment_id:id,p_reply:reply})}
export function useStudyGoal(userId:string|undefined){const[goal,setGoal]=useState<{lessons_per_week:number}|null>(null);const load=useCallback(async()=>{if(!userId||!hasSupabaseConfig)return;const{data}=await supabase.from('study_goals').select('lessons_per_week').eq('user_id',userId).maybeSingle();setGoal(data as {lessons_per_week:number}|null)},[userId]);useEffect(()=>{load()},[load]);const update=async(n:number)=>{const result=await supabase.from('study_goals').upsert({lessons_per_week:n,updated_at:new Date().toISOString()},{onConflict:'user_id'});if(!result.error)await load();return result};return{goal,update,refetch:load}}
