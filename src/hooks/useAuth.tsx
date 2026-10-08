import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase, hasSupabaseConfig } from '@/lib/supabase'

export type Profile = { id:string; name:string; role:'student'|'teacher'; created_at:string }
type AuthContextValue = {
  session: Session|null; user: User|null; profile: Profile|null; loading:boolean; isTeacher:boolean
  signIn:(email:string,password:string)=>Promise<string|null>
  signUp:(email:string,password:string,name:string)=>Promise<string|null>
  signOut:()=>Promise<void>
}
const AuthContext=createContext<AuthContextValue|null>(null)

export function AuthProvider({children}:{children:ReactNode}){
  const [session,setSession]=useState<Session|null>(null)
  const [profile,setProfile]=useState<Profile|null>(null)
  const [loading,setLoading]=useState(true)

  useEffect(()=>{
    if(!hasSupabaseConfig){setLoading(false);return}
    let mounted=true
    supabase.auth.getSession().then(({data})=>{
      if(!mounted)return
      setSession(data.session)
      if(data.session) supabase.from('profiles').select('id,name,role,created_at').eq('id',data.session.user.id).maybeSingle().then(({data:p})=>{if(mounted)setProfile(p as Profile|null)})
      setLoading(false)
    })
    const {data:{subscription}}=supabase.auth.onAuthStateChange((_event,next)=>{
      setSession(next)
      if(next) supabase.from('profiles').select('id,name,role,created_at').eq('id',next.user.id).maybeSingle().then(({data:p})=>setProfile(p as Profile|null))
      else setProfile(null)
    })
    return ()=>{mounted=false;subscription.unsubscribe()}
  },[])

  const signIn=async(email:string,password:string)=>{
    if(!hasSupabaseConfig)return 'Supabase ainda não foi configurado.'
    const {error}=await supabase.auth.signInWithPassword({email,password})
    return error ? mapAuthError(error.message) : null
  }
  const signUp=async(email:string,password:string,name:string)=>{
    if(!hasSupabaseConfig)return 'Supabase ainda não foi configurado.'
    const {error}=await supabase.auth.signUp({email,password,options:{data:{name}}})
    return error ? mapAuthError(error.message) : null
  }
  const signOut=async()=>{if(hasSupabaseConfig)await supabase.auth.signOut();setSession(null);setProfile(null)}
  return <AuthContext.Provider value={{session,user:session?.user??null,profile,loading,isTeacher:profile?.role==='teacher',signIn,signUp,signOut}}>{children}</AuthContext.Provider>
}
export function useAuth(){const value=useContext(AuthContext);if(!value)throw new Error('useAuth must be used inside AuthProvider');return value}
function mapAuthError(message:string){if(message.includes('Invalid login credentials'))return 'E-mail ou senha incorretos.';if(message.includes('already registered'))return 'Este e-mail já está cadastrado.';if(message.includes('Password should be at least'))return 'A senha deve ter pelo menos 6 caracteres.';return message}
