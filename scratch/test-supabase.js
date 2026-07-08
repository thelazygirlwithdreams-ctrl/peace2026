import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://cczpmjjcrxudrhtrsadw.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjenBtampjcnh1ZHJodHJzYWR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1MTY2NDIsImV4cCI6MjA5OTA5MjY0Mn0.kvL3GpGizB9g8NEElTAR2BoZnOSX7I66LREDrHSgIXk";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function run() {
  console.log("Fetching app_settings...");
  const { data, error } = await supabase.from('app_settings').select('*');
  console.log("Settings:", data, "Error:", error);

  console.log("Testing auth signUp...");
  const email = "sahana@peace2026.app";
  const password = "Sahana#Peace2026-Admin!";
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
  });
  console.log("Signup data:", authData);
  console.log("Signup error:", authError);
}

run();
