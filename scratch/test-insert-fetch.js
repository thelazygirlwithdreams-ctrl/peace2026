import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = "https://cczpmjjcrxudrhtrsadw.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNjenBtampjcnh1ZHJodHJzYWR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM1MTY2NDIsImV4cCI6MjA5OTA5MjY0Mn0.kvL3GpGizB9g8NEElTAR2BoZnOSX7I66LREDrHSgIXk";

const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

async function run() {
  const rand = Math.random().toString(36).substring(7);
  const fakeId = `TEST-${rand}`;
  
  console.log("Inserting a record...");
  const { error: insErr } = await supabase.from('registrations').insert({
    registration_id: fakeId,
    full_name: "Test User",
    date_of_birth: "2000-01-01",
    age: 26,
    category: "senior",
    mobile: "9999999999",
    church_name: "Test Church",
    competitions: ["bible_test"]
  });

  if (insErr) {
    console.error("Insert failed:", insErr.message);
  } else {
    console.log("Insert succeeded!");
  }

  console.log("Fetching all records...");
  const { data, error } = await supabase.from('registrations').select('*');
  console.log("Fetched:", data?.length ?? 0, "records");
  if (data && data.length > 0) {
    console.log("Records:", data.map(d => d.full_name));
  }
}

run();
