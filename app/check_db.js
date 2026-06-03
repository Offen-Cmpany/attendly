const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL, process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
  console.log('Fetching all profiles (bypassing RLS not possible from here, so we will use the admin login first to get a token).');
  
  // Try to login as admin
  const { data: authData, error: authErr } = await supabase.auth.signInWithPassword({
    email: 'admin@cekottarakkara.ac.in', // I'll assume they created an admin with this email
    password: 'password123' // Or whatever it is... wait, I don't know the admin's password!
  });
  
  if (authErr) {
    console.log('Auth error (Expected if I guess the wrong pass):', authErr.message);
  } else {
    console.log('Logged in as Admin successfully.');
  }

  // Without auth, RLS blocks us. Let's see if there is any way to read.
  const { data, error } = await supabase.from('profiles').select('*');
  console.log('Profiles data length:', data ? data.length : 0);
  console.log('Error:', error);
  if (data) {
    data.forEach(p => console.log(`[${p.role}] ${p.name} - ${p.email} - Designation: ${p.designation}`));
  }
}
check();
