import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://cczpmjjcrxudrhtrsadw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjenBtampjcnh1ZHJodHJzYWR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1MTY2NDIsImV4cCI6MjA5OTA5MjY0Mn0.kvL3GpGizB9g8NEElTAR2BoZnOSX7I66LREDrHSgIXk";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function run() {
  console.log("Creating a new dummy user to test...");
  const rand = Math.random().toString(36).substring(7);
  const email = `test_${rand}@peace2026.app`;
  const password = `Test12345#Peace2026!`;

  const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
    email,
    password
  });
  
  if (signUpError) {
    console.error("Sign up failed:", signUpError.message);
    return;
  }
  console.log("Created user:", signUpData.user?.id);

  // Try to call claim_first_admin
  const { data: rpcData, error: rpcError } = await supabase.rpc('claim_first_admin');
  console.log("claim_first_admin result:", rpcData, "error:", rpcError?.message);

  // Check roles
  const { data: roles, error: rolesErr } = await supabase.from('user_roles').select('*');
  console.log("Roles table:", roles, "error:", rolesErr?.message);
}

run();
