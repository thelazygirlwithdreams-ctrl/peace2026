import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://cczpmjjcrxudrhtrsadw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjenBtampjcnh1ZHJodHJzYWR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1MTY2NDIsImV4cCI6MjA5OTA5MjY0Mn0.kvL3GpGizB9g8NEElTAR2BoZnOSX7I66LREDrHSgIXk";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function run() {
  console.log("Fetching registrations as anonymous user...");
  const { data, error } = await supabase.from('registrations').select('*').limit(5);
  
  if (error) {
    console.error("Fetch failed:", error.message);
  } else {
    console.log("Fetch succeeded! Found:", data.length, "records");
    if (data.length > 0) console.log("First record:", data[0].full_name);
  }
}

run();
