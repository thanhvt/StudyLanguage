const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

console.log('--- Verifying Environment Variables ---');

// 1. Check API .env
const apiEnvPath = path.join(__dirname, '../apps/api/.env');
console.log(`\nChecking API .env at: ${apiEnvPath}`);
if (fs.existsSync(apiEnvPath)) {
  const apiConfig = dotenv.parse(fs.readFileSync(apiEnvPath));
  const hasUrl = !!apiConfig.SUPABASE_URL || !!apiConfig.NEXT_PUBLIC_SUPABASE_URL;
  const hasKey = !!apiConfig.SUPABASE_SERVICE_ROLE_KEY;
  const hasOpenAI = !!apiConfig.OPENAI_API_KEY;
  
  console.log(`- SUPABASE_URL: ${hasUrl ? 'OK (' + (apiConfig.SUPABASE_URL || apiConfig.NEXT_PUBLIC_SUPABASE_URL).substring(0, 20) + '...)' : 'MISSING'}`);
  console.log(`- SUPABASE_SERVICE_ROLE_KEY: ${hasKey ? 'OK (Starts with ' + apiConfig.SUPABASE_SERVICE_ROLE_KEY.substring(0, 10) + '...)' : 'MISSING'}`);
  console.log(`- OPENAI_API_KEY: ${hasOpenAI ? 'OK (Starts with ' + apiConfig.OPENAI_API_KEY.substring(0, 10) + '...)' : 'MISSING'}`);
} else {
  console.error('❌ apps/api/.env NOT FOUND');
}

// 2. Check Web .env / .env.local
const webEnvPath = path.join(__dirname, '../apps/web/.env.local');
const webEnvPath2 = path.join(__dirname, '../apps/web/.env');

console.log(`\nChecking Web .env at: ${webEnvPath} (or .env)`);
let webConfig = {};
if (fs.existsSync(webEnvPath)) {
  console.log('Found .env.local');
  webConfig = dotenv.parse(fs.readFileSync(webEnvPath));
} else if (fs.existsSync(webEnvPath2)) {
  console.log('Found .env');
  webConfig = dotenv.parse(fs.readFileSync(webEnvPath2));
} else {
  console.error('❌ apps/web/.env* NOT FOUND');
}

const hasWebUrl = !!webConfig.NEXT_PUBLIC_SUPABASE_URL;
const hasWebKey = !!webConfig.NEXT_PUBLIC_SUPABASE_ANON_KEY;

console.log(`- NEXT_PUBLIC_SUPABASE_URL: ${hasWebUrl ? 'OK (' + webConfig.NEXT_PUBLIC_SUPABASE_URL.substring(0, 20) + '...)' : 'MISSING'}`);
console.log(`- NEXT_PUBLIC_SUPABASE_ANON_KEY: ${hasWebKey ? 'OK' : 'MISSING'}`);

// 3. Compare
if (fs.existsSync(apiEnvPath) && (fs.existsSync(webEnvPath) || fs.existsSync(webEnvPath2))) {
  const apiEnv = dotenv.parse(fs.readFileSync(apiEnvPath));
  const apiUrl = apiEnv.SUPABASE_URL || apiEnv.NEXT_PUBLIC_SUPABASE_URL;
  const webUrl = webConfig.NEXT_PUBLIC_SUPABASE_URL;

  console.log('\n--- Comparision ---');
  if (apiUrl === webUrl) {
    console.log('✅ Supabase URLs match.');
  } else {
    console.error('❌ URL MISMATCH!');
    console.error(`API: ${apiUrl}`);
    console.error(`Web: ${webUrl}`);
  }
}
