import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://cczpmjjcrxudrhtrsadw.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjenBtampjcnh1ZHJodHJzYWR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1MTY2NDIsImV4cCI6MjA5OTA5MjY0Mn0.kvL3GpGizB9g8NEElTAR2BoZnOSX7I66LREDrHSgIXk";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  // Test signing in with the sahana account
  const email = "sahana@peace2026.app";
  const password = "Sahana#Peace2026-Admin!";
  
  console.log("Testing sign in...");
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  console.log("Sign in result:", data?.session ? "SUCCESS - got session" : "No session");
  console.log("Sign in error:", error?.message || "None");
  
  if (data?.session) {
    console.log("User ID:", data.session.user.id);
    // Check roles
    const { data: roles } = await supabase.from('user_roles').select('role').eq('user_id', data.session.user.id);
    console.log("User roles:", roles);
    
    // Check registrations count
    const { data: regs, error: regsErr } = await supabase.from('registrations').select('id, full_name, mobile, created_at').order('created_at', { ascending: false });
    console.log("Registrations error:", regsErr?.message || "None");
    console.log("Registrations count:", regs?.length ?? 0);
    if (regs && regs.length > 0) {
      console.log("Latest registration:", regs[0]);
    }
  }
}

run();
