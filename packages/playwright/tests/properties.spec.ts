import { test, expect } from '@playwright/test';

test.describe('Properties Management', () => {
    // Generate unique data for each test run to avoid collisions
    const generatePropertyData = () => {
        const suffix = Math.floor(Math.random() * 1000000);
        return {
            title: `Villa-${suffix}`,
            description: 'Beautiful villa with sea view and private pool.',
            price: '150',
            address: `${suffix} Beach Side, Sunny Coast`,
            userEmail: `prop-tester-${suffix}@example.com`
        };
    };

    test.beforeEach(async ({ page }) => {
        const data = generatePropertyData();

        await page.goto('/auth/register');
        await page.locator('#register-full-name').fill('Property Tester');
        await page.locator('#register-email').fill(data.userEmail);
        await page.locator('#register-password').fill('password123');
        await page.locator('#register-confirm-password').fill('password123');
        await page.locator('#register-submit').click();

        await expect(page).toHaveURL(/.*\/properties/, { timeout: 30000 });
    });

    test('should create and display a new property', async ({ page }) => {
        const testProperty = generatePropertyData();

        await page.getByRole('button', { name: 'Add Property' }).click();

        await page.getByPlaceholder('Enter property title').fill(testProperty.title);
        await page.getByPlaceholder('Describe the property...').fill(testProperty.description);
        await page.getByPlaceholder('0.00').fill(testProperty.price);
        await page.getByPlaceholder('Enter full address').fill(testProperty.address);

        await page.getByRole('button', { name: 'Save Property' }).click();

        await expect(page.getByText('Property created successfully')).toBeVisible();

        const propertyCard = page.locator('div.bg-white').filter({ hasText: testProperty.title }).first();
        await expect(propertyCard).toBeVisible();
        await expect(propertyCard.getByText(`$${testProperty.price}`)).toBeVisible();
    });

    test('should validate required fields when creating property', async ({ page }) => {
        await page.getByRole('button', { name: 'Add Property' }).click();
        await page.getByRole('button', { name: 'Save Property' }).click();

        // Expect to stay on same screen if blocked by validation
        await expect(page.getByRole('heading', { name: 'Add New Property' })).toBeVisible();
    });

    test('should search for a property', async ({ page }) => {
        const testProperty = generatePropertyData();

        await page.getByRole('button', { name: 'Add Property' }).click();
        await page.getByPlaceholder('Enter property title').fill(testProperty.title);
        await page.getByPlaceholder('Describe the property...').fill(testProperty.description);
        await page.getByPlaceholder('0.00').fill(testProperty.price);
        await page.getByPlaceholder('Enter full address').fill(testProperty.address);
        await page.getByRole('button', { name: 'Save Property' }).click();

        await page.getByPlaceholder('Search properties...').fill(testProperty.title);
        await expect(page.getByText(testProperty.title)).toBeVisible();

        await page.getByPlaceholder('Search properties...').fill('NonExistentProperty-' + Date.now());
        await expect(page.getByText('No properties found')).toBeVisible();
    });
});
