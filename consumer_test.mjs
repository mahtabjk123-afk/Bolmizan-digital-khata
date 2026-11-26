import { chromium } from 'playwright';

(async () => {
  console.log('=== BOLMIZAN AI: REAL CUSTOMER LIVE TEST STARTED ===');
  const browser = await chromium.launch({ headless: false, executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe', slowMo: 600 });
  const page = await browser.newPage({ viewport: { width: 412, height: 860 } });

  await page.goto('https://bolmizan-sakrand.surge.sh/', { waitUntil: 'networkidle' });
  console.log('1. Live Website Opened:', await page.title());

  // Dismiss welcome curtain if present
  const startBtn = page.locator('button').filter({ hasText: /shuru|start|open|enter|bolmizan/i }).first();
  if (await startBtn.isVisible().catch(() => false)) {
    await startBtn.click();
    console.log('2. Welcome Curtain Dismissed: PASS');
  }

  // Test 1: Mandi Auto-Math Entry (40 mann gandum 4150 udhaar)
  const input = page.locator('input[placeholder*="Haji Aslam"], input[placeholder*="Misal"]').first();
  await input.fill('Haji Aslam 03001234567 40 mann gandum 4150 udhaar');
  await page.locator('button').filter({ hasText: /^UDHAAR/i }).first().click();
  const bodyText1 = await page.innerText('body');
  console.log('3. Mandi Auto-Math (166,000) & Entry Save:', bodyText1.includes('166,000') ? 'PASS' : 'FAIL (Old version still live - run deploy command!)');

  // Test 2: Scam Shield Check
  const scamBtn = page.locator('button').filter({ hasText: /Scam\?/i }).first();
  if (await scamBtn.isVisible().catch(() => false)) {
    await scamBtn.click();
    await page.locator('textarea').first().fill('Mubarak ho Benazir 8171 lottery inaam click bit.ly');
    const bodyText2 = await page.innerText('body');
    console.log('4. Scam Shield Fraud Alert:', bodyText2.includes('RED ALERT') ? 'PASS' : 'FAIL');
    await page.locator('button').filter({ hasText: /Close/i }).first().click();
  } else {
    console.log('4. Scam Shield Button: NOT FOUND (Old deploy still active)');
  }

  // Test 3: Customer Search & Statement Button
  const searchBox = page.locator('input[placeholder*="dhoondein"]').first();
  await searchBox.fill('Haji Aslam');
  const hisabBtn = page.locator('button').filter({ hasText: /Hisab WA/i }).first();
  console.log('5. Customer Statement (Hisab WA) Button:', (await hisabBtn.isVisible().catch(() => false)) ? 'PASS' : 'CHECK');

  console.log('=== TEST COMPLETE: Closing browser in 4 seconds ===');
  await page.waitForTimeout(4000);
  await browser.close();
})();
