import { test, expect } from '@playwright/test';

test.describe('Bookings Management', () => {
    // Generate unique data for each test run to avoid collisions
    const generateTestData = () => {
        const randomSuffix = Math.floor(Math.random() * 1000000);
        return {
            suffix: randomSuffix,
            propertyTitle: `Villa-${randomSuffix}`,
            userEmail: `book-${randomSuffix}@example.com`
        };
    };

    let testData = generateTestData();

    test.beforeEach(async ({ page }) => {
        testData = generateTestData();

        // Register
        await page.goto('/auth/register');
        await page.locator('#register-full-name').fill('Booking Tester');
        await page.locator('#register-email').fill(testData.userEmail);
        await page.locator('#register-password').fill('password123');
        await page.locator('#register-confirm-password').fill('password123');
        await page.locator('#register-submit').click();

        await expect(page).toHaveURL(/.*\/properties/, { timeout: 30000 });

        // Create a property
        await page.getByRole('button', { name: 'Add Property' }).click();
        await page.getByPlaceholder('Enter property title').fill(testData.propertyTitle);
        await page.getByPlaceholder('Describe the property...').fill('A nice place for booking tests.');
        await page.getByPlaceholder('0.00').fill('100');
        await page.getByPlaceholder('Enter full address').fill('123 Booking St');
        await page.getByRole('button', { name: 'Save Property' }).click();
        await expect(page.getByText('Property created successfully')).toBeVisible();
    });

    test('should create a new booking', async ({ page }) => {
        await page.goto('/bookings');
        await expect(page.getByRole('heading', { name: 'Bookings Management' })).toBeVisible();
        await page.getByRole('button', { name: 'Create Booking' }).click();

        const select = page.locator('select#property');
        let propertyValue: string | null = null;
        await expect(async () => {
            const option = select.locator('option').filter({ hasText: testData.propertyTitle });
            if (await option.count() === 0) throw new Error('Property not found');
            propertyValue = await option.getAttribute('value');
        }).toPass({ timeout: 15000 });

        await select.selectOption(propertyValue!);

        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);
        const startDate = today.toISOString().split('T')[0]!;
        const endDate = tomorrow.toISOString().split('T')[0]!;

        await page.locator('#startDate').fill(startDate);
        await page.locator('#endDate').fill(endDate);

        await page.locator('form').getByRole('button', { name: 'Create Booking' }).click();

        await expect(page.getByText('Booking created successfully')).toBeVisible({ timeout: 30000 });

        const bookingRow = page.locator('tr').filter({ hasText: testData.propertyTitle });
        await expect(bookingRow).toBeVisible({ timeout: 20000 });
        await expect(bookingRow.getByText(/Pending/i)).toBeVisible();

        const firstCell = bookingRow.locator('td').first();
        const firstCellText = await firstCell.innerText();
        expect(firstCellText).not.toBe('N/A');
    });

    test('should validate date range when creating booking', async ({ page }) => {
        await page.goto('/bookings');
        await page.getByRole('button', { name: 'Create Booking' }).click();

        // Fill end date EARLIER than start date
        await page.locator('#startDate').fill('2025-10-10');
        await page.locator('#endDate').fill('2025-10-01');

        // The button should be disabled for invalid date ranges
        const submitBtn = page.locator('form').getByRole('button', { name: 'Create Booking' });
        await expect(submitBtn).toBeDisabled();
    });
});
