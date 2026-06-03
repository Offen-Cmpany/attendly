const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL, process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);

async function debugProfiles() {
  console.log('--- DEBUG SCRIPT STARTED ---');
  
  const testEmail = `debug_${Date.now()}@test.com`;
  const password = 'Password123!';
  
  console.log(`1. Signing up dummy user: ${testEmail}`);
  const { data: signUpData, error: signUpErr } = await supabase.auth.signUp({
    email: testEmail,
    password: password,
  });

  if (signUpErr) {
    console.error('Signup failed (Email confirmations might be ON):', signUpErr.message);
    return;
  }
  
  console.log('Signup succeeded. User ID:', signUpData.user?.id);
  
  // Create profile for this user so RLS might let us read if there's any weird conditions
  const { error: profileErr } = await supabase.from('profiles').insert({
    id: signUpData.user.id,
    name: 'Debug User',
    email: testEmail,
    role: 'student',
    designation: 'pending_staff'
  });
  
  if (profileErr) {
    console.error('Failed to create profile for dummy user:', profileErr.message);
  } else {
    console.log('Profile created successfully for dummy user.');
  }

  console.log('\n2. Fetching all profiles from DB...');
  const { data: profiles, error: fetchErr } = await supabase.from('profiles').select('*');
  
  if (fetchErr) {
    console.error('Failed to fetch profiles:', fetchErr.message);
  } else {
    console.log(`Found ${profiles.length} profiles in database:`);
    profiles.forEach(p => {
      console.log(`- ${p.email} | Role: ${p.role} | Designation: ${p.designation} | Name: ${p.name}`);
    });
  }
  
  console.log('--- DEBUG SCRIPT FINISHED ---');
}

debugProfiles();
