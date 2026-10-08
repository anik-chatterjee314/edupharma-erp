const BASE = 'http://localhost:5000/api';

console.log('═══════════════════════════════════════');
console.log('   EDUPHARMA ERP — FULL FLOW TEST');
console.log('═══════════════════════════════════════\n');

// 1. Try login WITHOUT password setup (should fail with 403)
console.log('--- Step 1: Login before password setup ---');
const loginBefore = await fetch(`${BASE}/auth/login`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@edupharmaacademy.in', password: 'test123' })
});
const loginBeforeData = await loginBefore.json();
console.log('  Status:', loginBefore.status === 403 ? '✅ 403 (correct!)' : `❌ ${loginBefore.status}`);
console.log('  Message:', loginBeforeData.message);
console.log('  needsSetup:', loginBeforeData.needsSetup);

// 2. Setup password
console.log('\n--- Step 2: Set up admin password ---');
const setupResp = await fetch(`${BASE}/auth/setup-password`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@edupharmaacademy.in', password: 'Admin@123' })
});
const setupData = await setupResp.json();
console.log('  Status:', setupResp.status === 200 ? '✅ 200' : `❌ ${setupResp.status}`);
console.log('  Message:', setupData.message);

// 3. Try setup again (should fail — already set)
console.log('\n--- Step 3: Try setup again (should fail) ---');
const setupAgain = await fetch(`${BASE}/auth/setup-password`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@edupharmaacademy.in', password: 'Hack@123' })
});
const setupAgainData = await setupAgain.json();
console.log('  Status:', setupAgain.status === 400 ? '✅ 400 (blocked!)' : `❌ ${setupAgain.status}`);
console.log('  Message:', setupAgainData.message);

// 4. Login with correct password
console.log('\n--- Step 4: Login with new password ---');
const loginResp = await fetch(`${BASE}/auth/login`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@edupharmaacademy.in', password: 'Admin@123' })
});
const loginData = await loginResp.json();
console.log('  Status:', loginResp.status === 200 ? '✅ 200' : `❌ ${loginResp.status}`);
console.log('  Role:', loginData.user?.role);
const token = loginData.token;

// 5. All API endpoints
console.log('\n--- Step 5: API endpoints ---');
const endpoints = [
  ['Auth /me', '/auth/me'],
  ['Students', '/students'],
  ['Payments', '/payments'],
  ['Courses', '/settings/courses'],
  ['Batches', '/settings/batches'],
  ['Subjects', '/settings/subjects'],
  ['Tests', '/tests'],
  ['Health', '/health'],
];

for (const [name, path] of endpoints) {
  const r = await fetch(`${BASE}${path}`, { headers: { Authorization: `Bearer ${token}` } });
  const emoji = r.status === 200 ? '✅' : '❌';
  console.log(`  ${emoji} ${name}: ${r.status}`);
}

// 6. Frontend serving
console.log('\n--- Step 6: Frontend serving ---');
const rootResp = await fetch('http://localhost:5000/');
const loginPageResp = await fetch('http://localhost:5000/login');
const setupPageResp = await fetch('http://localhost:5000/setup-password');
console.log(`  Root (/): ${rootResp.status === 200 ? '✅' : '❌'} ${rootResp.status}`);
console.log(`  Login (/login): ${loginPageResp.status === 200 ? '✅' : '❌'} ${loginPageResp.status}`);
console.log(`  Setup (/setup-password): ${setupPageResp.status === 200 ? '✅' : '❌'} ${setupPageResp.status}`);

// 7. Change password
console.log('\n--- Step 7: Change password ---');
const cpResp = await fetch(`${BASE}/auth/change-password`, {
  method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
  body: JSON.stringify({ currentPassword: 'Admin@123', newPassword: 'Admin@123' })
});
const cpData = await cpResp.json();
console.log(`  ${cpResp.status === 200 ? '✅' : '❌'} ${cpResp.status}: ${cpData.message}`);

console.log('\n═══════════════════════════════════════');
console.log('   ALL TESTS COMPLETE 🎉');
console.log('═══════════════════════════════════════\n');
