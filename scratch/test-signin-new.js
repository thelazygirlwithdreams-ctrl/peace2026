import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://cczpmjjcrxudrhtrsadw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjenBtampjcnh1ZHJodHJzYWR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1MTY2NDIsImV4cCI6MjA5OTA5MjY0Mn0.kvL3GpGizB9g8NEElTAR2BoZnOSX7I66LREDrHSgIXk";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function run() {
  const email = `test_ea100f55-be99-4795-8df9-4f1a11173e27@peace2026.app`; // From earlier
  const password = `Test12345#Peace2026!`;

  console.log("Trying to sign in with the new user...");
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  
  if (error) {
    console.error("Sign in failed:", error.message);
  } else {
    console.log("Sign in succeeded! Session:", data.session ? "YES" : "NO");
  }
}

run();
