const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL, process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY);

async function createAdmin() {
  const email = 'admin@cekottarakkara.ac.in';
  const password = 'admin@12345';
  
  console.log(`Authenticating Admin User: ${email}...`);
  
  const { data: signInData, error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
  
  if (signInErr) {
      console.error('Failed to sign in:', signInErr.message);
      return;
  }
  
  console.log('Successfully signed in! User ID:', signInData.user.id);
  
  console.log('Upserting admin profile...');
  const { error: profileErr } = await supabase.from('profiles').upsert({
    id: signInData.user.id,
    name: 'System Admin',
    email: email,
    role: 'admin',
    designation: 'hod'
  });
  
  if (profileErr) {
    console.error('Failed to create/update admin profile:', profileErr.message);
  } else {
    console.log('SUCCESS! Admin profile created/updated. The user can now log in.');
  }
}

createAdmin();
