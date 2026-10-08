const resp = await fetch('http://localhost:5000/login');
console.log('/login:', resp.status);
console.log('headers:', Object.fromEntries(resp.headers.entries()));
const body = await resp.text();
console.log('body preview:', body.substring(0, 100));
