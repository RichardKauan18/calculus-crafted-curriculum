import { createClient } from "@supabase/supabase-js";

// The publishable key is intended for browser use. Environment variables override
// these project defaults when configured in a deployment environment.
const url = import.meta.env.VITE_SUPABASE_URL || "https://yegkfdspnmssrzooolou.supabase.co";
const key =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_j5i_XOVb2sPTjRmjYjnxAA_AWPchX_R";

export const hasSupabaseConfig = Boolean(url && key);

export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});
