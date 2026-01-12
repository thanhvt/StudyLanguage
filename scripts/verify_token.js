const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

// Load API .env
const apiEnvPath = path.join(__dirname, '../apps/api/.env');
if (fs.existsSync(apiEnvPath)) {
  const envConfig = dotenv.parse(fs.readFileSync(apiEnvPath));
  for (const k in envConfig) {
    process.env[k] = envConfig[k];
  }
} else {
  console.error('❌ Cannot find apps/api/.env');
  process.exit(1);
}

const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('--- Configuration ---');
console.log(`URL: ${supabaseUrl}`);
console.log(`Key: ${supabaseKey ? supabaseKey.substring(0, 10) + '...' : 'MISSING'}`);

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing config');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Token extracted from browser (replace this with the one passed via args or hardcoded during debug)
const token = process.argv[2];

if (!token) {
  console.error('❌ Please provide token as argument');
  process.exit(1);
}

console.log('\n--- Verifying Token ---');
console.log(`Token: ${token.substring(0, 20)}...`);

async function verify() {
  const { data, error } = await supabase.auth.getUser(token);

  if (error) {
    console.error('❌ Verification FAILED:');
    console.error(error);
  } else {
    console.log('✅ Verification SUCCESS!');
    console.log('User ID:', data.user.id);
    console.log('Email:', data.user.email);
    console.log('Role:', data.user.role);
  }
}

verify();
