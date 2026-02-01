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

        await page.locator('#register-full-name').fill(testUser.name);
        await page.locator('#register-email').fill(testUser.email);
        await page.locator('#register-password').fill(testUser.password);
        await page.locator('#register-confirm-password').fill(testUser.password);

        await page.locator('#register-submit').click();

        await expect(page).toHaveURL(/.*\/properties/, { timeout: 30000 });
        const userNameLocator = page.locator('p', { hasText: testUser.name }).first();
        await expect(userNameLocator).toBeVisible({ timeout: 15000 });
    });

    test('should login with created user', async ({ page }) => {
        const testUser = getUserData('login');

        // Setup: Register first
        await page.goto('/auth/register');
        await page.locator('#register-full-name').fill(testUser.name);
        await page.locator('#register-email').fill(testUser.email);
        await page.locator('#register-password').fill(testUser.password);
        await page.locator('#register-confirm-password').fill(testUser.password);
        await page.locator('#register-submit').click();
        await expect(page).toHaveURL(/.*\/properties/, { timeout: 30000 });

        // Test Login
        await page.goto('/auth/login');
        await page.locator('#login-email').fill(testUser.email);
        await page.locator('#login-password').fill(testUser.password);
        await page.locator('#login-submit').click();

        await expect(page).toHaveURL(/.*\/properties/, { timeout: 30000 });
        const userNameLocator = page.locator('p', { hasText: testUser.name }).first();
        await expect(userNameLocator).toBeVisible();
    });

    test('should show error for invalid login', async ({ page }) => {
        await page.goto('/auth/login');
        await page.locator('#login-email').fill('wrong@example.com');
        await page.locator('#login-password').fill('wrongpassword');
        await page.locator('#login-submit').click();

        await expect(page.getByText(/Invalid credentials|failed/i)).toBeVisible();
        await expect(page).toHaveURL(/.*\/auth\/login/);
    });

    test('should validate registration password length', async ({ page }) => {
        await page.goto('/auth/register');
        await page.locator('#register-password').fill('123');

        // Browser validation check or custom UI error
        const submitBtn = page.locator('#register-submit');
        await submitBtn.click();

        // Should stay on page if blocked by browser validation or show error
        await expect(page).toHaveURL(/.*\/auth\/register/);
    });
});
