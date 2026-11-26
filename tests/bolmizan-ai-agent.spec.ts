import { test, expect } from '@playwright/test';

test.describe('BolMizan Autonomous Merchant AI Agent Audit', () => {
  test('Full End-to-End Sakrand Merchant Workflow', async ({ page }) => {
    // 1. Open App & Wait for Ajrak Curtains + Bhali Kare Aaya
    await page.goto('http://localhost:4173', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2600); // Let Ajrak curtains open
    await page.screenshot({ path: 'tests/01_home_opened.png' });

    // 2. Customize Shop Name
    const shopInput = page.locator('input').first();
    await shopInput.fill('Sakrand Karyana & Khad Store');

    // 3. Create an UDHAAR entry (e.g., Ali 1500)
    await page.getByPlaceholder(/Naam aur Raqam/i).fill('Ali Khan 1500');
    await page.getByPlaceholder(/Customer Mobile/i).fill('03001234567');
    await page.getByRole('button', { name: 'UDHAAR', exact: true }).click();
    await expect(page.getByText('Ali Khan')).toBeVisible();
    await page.screenshot({ path: 'tests/02_udhaar_created.png' });

    // 4. Create a WASOOL (PAID) entry (e.g., Ahmed 2500)
    await page.getByPlaceholder(/Naam aur Raqam/i).fill('Ahmed Raza 2500');
    await page.getByRole('button', { name: 'WASOOL', exact: true }).click();
    await expect(page.getByText('Ahmed Raza')).toBeVisible();

    // 5. Test Search Bar
    await page.getByPlaceholder(/Customer ka naam/i).fill('Ali');
    await expect(page.getByText('Ali Khan')).toBeVisible();
    await page.getByPlaceholder(/Customer ka naam/i).fill('');

    // 6. Test Settle Udhaar ("Jama ✓")
    const jamaBtn = page.getByRole('button', { name: /Jama/i }).first();
    if (await jamaBtn.isVisible()) {
      await jamaBtn.click();
    }
    await page.screenshot({ path: 'tests/03_udhaar_settled.png' });

    // 7. Test One-Tap Backup Download
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('button', { name: 'BACKUP' }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('BolMizan_Khata_Backup');
    await page.screenshot({ path: 'tests/04_final_verified.png' });
  });
});
