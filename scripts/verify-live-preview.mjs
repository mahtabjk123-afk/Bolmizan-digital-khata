const BASE_URL = 'http://127.0.0.1:3000';

async function auditLivePreview() {
  console.log(`Auditing live BolMizan server at ${BASE_URL}...\n`);
  try {
    const res = await fetch(BASE_URL);
    const html = await res.text();
    console.log('1. HTTP Status       :', res.status === 200 ? '200 OK (LIVE)' : `FAIL (${res.status})`);
    console.log('2. HTML Bundle Size  :', `${html.length} bytes`);
    console.log('3. PWA Manifest Link :', html.includes('manifest.json') ? 'VERIFIED' : 'MISSING');
    console.log('4. Root Mount Node   :', html.includes('id="root"') ? 'VERIFIED' : 'MISSING');
  } catch (err) {
    console.error('Server offline! Pehle "npm run dev" chalayein.', err.message);
  }
}

auditLivePreview();
