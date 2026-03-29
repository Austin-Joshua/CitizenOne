const { test, expect } = require('@playwright/test');

test.describe('Public shell', () => {
  test('landing page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Auth & protected routes', () => {
  test.describe.configure({ mode: 'serial' });

  test('unauthenticated /app/dashboard redirects to sign-in', async ({ page }) => {
    await page.goto('/app/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('signup via API, sign-in via UI, open profile and subscription', async ({ page, request }) => {
    const suffix = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
    const email = `e2e_${suffix}@citizenone-e2e.test`;
    const password = 'E2E_Test_Pass_1!';
    const name = 'E2E Smoke User';

    const signupRes = await request.post('/api/auth/signup', {
      data: { name, email, password, role: 'citizen', plan: 'free' },
    });
    expect(signupRes.ok(), await signupRes.text()).toBeTruthy();

    await page.goto('/login');
    await page.getByRole('button', { name: 'Continue' }).click();
    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[type="password"]').fill(password);
    await page.getByRole('button', { name: 'Sign in securely' }).click();

    await expect(page).toHaveURL(/\/app\/dashboard/, { timeout: 30_000 });

    await page.goto('/app/profile');
    await expect(page).toHaveURL(/\/app\/profile/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

    await page.goto('/app/subscription');
    await expect(page).toHaveURL(/\/app\/subscription/);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  });
});
