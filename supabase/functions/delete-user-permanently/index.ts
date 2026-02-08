import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// --- CRITICAL: CORS HEADERS FOR BROWSER PERMISSION ---
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { userId } = await req.json()

    if (!userId) {
      throw new Error("User ID is required")
    }

    // Initialize Supabase Admin with Service Role Key
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Purge 'profile-media' (Avatar & Cover)
    const { data: profileFiles } = await supabaseAdmin.storage.from('profile-media').list(userId)
    if (profileFiles && profileFiles.length > 0) {
      const paths = profileFiles.map(f => `${userId}/${f.name}`)
      await supabaseAdmin.storage.from('profile-media').remove(paths)
    }

    // 2. Purge 'resumes' (PDFs)
    const { data: resumeFiles } = await supabaseAdmin.storage.from('resumes').list(userId)
    if (resumeFiles && resumeFiles.length > 0) {
      const paths = resumeFiles.map(f => `${userId}/${f.name}`)
      await supabaseAdmin.storage.from('resumes').remove(paths)
    }

    // 3. Delete from Auth (Triggers cascade delete in public.profiles and jobs)
    const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(userId)
    
    if (authError) throw authError

    return new Response(JSON.stringify({ success: true, message: "User wiped" }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})