import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
    const getUserData = (prefix = 'user') => {
        const suffix = Math.floor(Math.random() * 1000000);
        return {
            name: `${prefix}-${suffix}`,
            email: `${prefix}-${suffix}@example.com`,
            password: 'password123',
        };
    };

    test('should register a new user', async ({ page }) => {

        const testUser = getUserData('reg');
        await page.goto('/auth/register');

        await page.getByLabel('Full Name').fill(testUser.name);
        await page.getByLabel('Email', { exact: true }).fill(testUser.email);
        await page.getByLabel('Password', { exact: true }).fill(testUser.password);
        await page.getByLabel('Confirm Password').fill(testUser.password);

        await page.locator('#register-submit').click();

        await expect(page).toHaveURL(/.*\/properties/, { timeout: 30000 });

        // Using a more precise locator to avoid collision with the email text in the sidebar
        const userNameLocator = page.locator('p', { hasText: testUser.name }).first();
        await expect(userNameLocator).toBeVisible({ timeout: 15000 });
        // Double check it's the specific element for name (not including email)
        await expect(userNameLocator).toHaveClass(/text-slate-900/);
    });

    test('should login with created user', async ({ page }) => {
        const testUser = getUserData('login');

        await page.goto('/auth/register');
        await page.getByPlaceholder('John Doe').fill(testUser.name);
        await page.getByPlaceholder('you@example.com').fill(testUser.email);
        await page.locator('input[type="password"]').first().fill(testUser.password);
        await page.locator('input[type="password"]').last().fill(testUser.password);
        await page.getByRole('button', { name: 'Create account' }).click();

        await expect(page).toHaveURL(/.*\/properties/, { timeout: 30000 });

        await page.goto('/auth/login');

        await page.getByPlaceholder('you@example.com').fill(testUser.email);
        await page.getByPlaceholder('••••••••').fill(testUser.password);

        await page.getByRole('button', { name: 'Sign in' }).click();

        await expect(page).toHaveURL(/.*\/properties/, { timeout: 30000 });
        await expect(page.getByRole('heading', { name: 'Properties Management' })).toBeVisible({ timeout: 15000 });

        // Precise locator for user name in sidebar
        const userNameLocator = page.locator('p', { hasText: testUser.name }).first();
        await expect(userNameLocator).toBeVisible({ timeout: 15000 });
    });
});
