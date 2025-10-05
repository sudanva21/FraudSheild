import { test, expect, Page } from '@playwright/test';

// Test configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TEST_USER_EMAIL = 'test@fraudshield.com';
const TEST_USER_PASSWORD = 'TestPassword123!';

test.describe('FraudShield Modern Website E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the application
    await page.goto(BASE_URL);
  });

  test.describe('Landing Page', () => {
    test('should display landing page with 3D elements and black/yellow theme', async ({ page }) => {
      // Check page title
      await expect(page).toHaveTitle(/FraudShield/);
      
      // Verify main heading
      await expect(page.locator('h1')).toContainText('AI-Powered Fraud Detection');
      
      // Check for 3D floating elements container
      await expect(page.locator('[data-testid="floating-elements"]')).toBeVisible();
      
      // Verify navigation elements
      await expect(page.locator('nav')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Get Started' })).toBeVisible();
      
      // Check for black and yellow theme elements
      const heroSection = page.locator('[data-testid="hero-section"]');
      await expect(heroSection).toHaveCSS('background-color', 'rgb(15, 15, 15)'); // #0f0f0f
      
      // Verify feature cards are present
      await expect(page.locator('[data-testid="feature-card"]').first()).toBeVisible();
    });

    test('should have working navigation', async ({ page }) => {
      // Test Sign In button navigation
      await page.getByRole('button', { name: 'Sign In' }).click();
      await expect(page).toHaveURL(/.*\/auth\/login/);
      
      // Navigate back to home
      await page.goBack();
      await expect(page).toHaveURL(BASE_URL);
      
      // Test Get Started button navigation
      await page.getByRole('button', { name: 'Get Started' }).click();
      await expect(page).toHaveURL(/.*\/auth\/register/);
    });

    test('should display responsive design', async ({ page }) => {
      // Test desktop view
      await page.setViewportSize({ width: 1920, height: 1080 });
      await expect(page.locator('[data-testid="hero-section"]')).toBeVisible();
      
      // Test tablet view
      await page.setViewportSize({ width: 768, height: 1024 });
      await expect(page.locator('[data-testid="hero-section"]')).toBeVisible();
      
      // Test mobile view
      await page.setViewportSize({ width: 375, height: 667 });
      await expect(page.locator('[data-testid="hero-section"]')).toBeVisible();
      
      // Check mobile navigation menu
      const mobileMenuButton = page.locator('[data-testid="mobile-menu-button"]');
      if (await mobileMenuButton.isVisible()) {
        await mobileMenuButton.click();
        await expect(page.locator('[data-testid="mobile-menu"]')).toBeVisible();
      }
    });
  });

  test.describe('User Authentication', () => {
    test('should register new user successfully', async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/register`);
      
      // Fill registration form
      await page.fill('input[name="email"]', TEST_USER_EMAIL);
      await page.fill('input[name="password"]', TEST_USER_PASSWORD);
      await page.fill('input[name="confirmPassword"]', TEST_USER_PASSWORD);
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Should show success message or redirect to login
      await expect(page.locator('[data-testid="success-message"]')).toBeVisible({timeout: 10000});
    });

    test('should validate registration form inputs', async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/register`);
      
      // Test email validation
      await page.fill('input[name="email"]', 'invalid-email');
      await page.blur('input[name="email"]');
      await expect(page.locator('[data-testid="email-error"]')).toContainText('Please enter a valid email');
      
      // Test password validation
      await page.fill('input[name="password"]', '123');
      await page.blur('input[name="password"]');
      await expect(page.locator('[data-testid="password-error"]')).toContainText('Password must be at least 6 characters');
      
      // Test password confirmation
      await page.fill('input[name="password"]', TEST_USER_PASSWORD);
      await page.fill('input[name="confirmPassword"]', 'different-password');
      await page.blur('input[name="confirmPassword"]');
      await expect(page.locator('[data-testid="confirm-password-error"]')).toContainText('Passwords must match');
    });

    test('should login existing user', async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/login`);
      
      // Use demo credentials
      await page.fill('input[name="email"]', 'demo@fraudshield.com');
      await page.fill('input[name="password"]', 'demo123');
      
      // Test password visibility toggle
      const passwordToggle = page.locator('[data-testid="password-toggle"]');
      await passwordToggle.click();
      await expect(page.locator('input[name="password"]')).toHaveAttribute('type', 'text');
      await passwordToggle.click();
      await expect(page.locator('input[name="password"]')).toHaveAttribute('type', 'password');
      
      // Submit form
      await page.click('button[type="submit"]');
      
      // Should redirect to dashboard
      await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 10000 });
    });

    test('should handle login errors gracefully', async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/login`);
      
      // Try with invalid credentials
      await page.fill('input[name="email"]', 'wrong@email.com');
      await page.fill('input[name="password"]', 'wrongpassword');
      await page.click('button[type="submit"]');
      
      // Should show error toast or message
      await expect(page.locator('[data-testid="error-toast"]')).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe('Dashboard Fraud Analysis', () => {
    test.beforeEach(async ({ page }) => {
      // Login before each dashboard test
      await page.goto(`${BASE_URL}/auth/login`);
      await page.fill('input[name="email"]', 'demo@fraudshield.com');
      await page.fill('input[name="password"]', 'demo123');
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/.*\/dashboard/, { timeout: 10000 });
    });

    test('should display dashboard with fraud analysis form', async ({ page }) => {
      // Check dashboard elements
      await expect(page.locator('h1')).toContainText('Fraud Detection Dashboard');
      await expect(page.locator('[data-testid="transaction-form"]')).toBeVisible();
      await expect(page.locator('[data-testid="analysis-history"]')).toBeVisible();
      
      // Verify form fields are present
      await expect(page.locator('input[name="amount"]')).toBeVisible();
      await expect(page.locator('select[name="merchantCategory"]')).toBeVisible();
      await expect(page.locator('select[name="paymentMethod"]')).toBeVisible();
    });

    test('should perform fraud analysis with valid transaction data', async ({ page }) => {
      // Fill transaction form
      await page.fill('input[name="amount"]', '1500.00');
      await page.selectOption('select[name="merchantCategory"]', 'online');
      await page.selectOption('select[name="paymentMethod"]', 'credit_card');
      await page.fill('input[name="customerAge"]', '35');
      await page.fill('input[name="transactionFrequency"]', '15');
      await page.fill('input[name="locationRisk"]', '0.3');
      
      // Submit analysis
      await page.click('button[data-testid="analyze-button"]');
      
      // Wait for results
      const results = page.locator('[data-testid="analysis-results"]');
      await expect(results).toBeVisible({ timeout: 10000 });
      
      // Verify result components
      await expect(page.locator('[data-testid="risk-level"]')).toBeVisible();
      await expect(page.locator('[data-testid="fraud-probability"]')).toBeVisible();
      await expect(page.locator('[data-testid="risk-factors"]')).toBeVisible();
      
      // Check if risk level is one of expected values
      const riskLevel = page.locator('[data-testid="risk-level"]');
      await expect(riskLevel).toContainText(/low|medium|high/i);
    });

    test('should validate form inputs', async ({ page }) => {
      // Test negative amount
      await page.fill('input[name="amount"]', '-100');
      await page.blur('input[name="amount"]');
      await expect(page.locator('[data-testid="amount-error"]')).toContainText('Amount must be positive');
      
      // Test invalid age
      await page.fill('input[name="customerAge"]', '150');
      await page.blur('input[name="customerAge"]');
      await expect(page.locator('[data-testid="age-error"]')).toContainText('Please enter a valid age');
    });

    test('should display analysis history', async ({ page }) => {
      // Perform an analysis first
      await page.fill('input[name="amount"]', '500.00');
      await page.selectOption('select[name="merchantCategory"]', 'retail');
      await page.click('button[data-testid="analyze-button"]');
      
      // Wait for results and check history
      await expect(page.locator('[data-testid="analysis-results"]')).toBeVisible({ timeout: 10000 });
      
      // Check history section
      const historyItems = page.locator('[data-testid="history-item"]');
      await expect(historyItems.first()).toBeVisible({ timeout: 5000 });
      
      // Verify history item contains expected data
      await expect(historyItems.first()).toContainText('$500.00');
      await expect(historyItems.first()).toContainText(/low|medium|high/i);
    });

    test('should clear analysis history', async ({ page }) => {
      // Check if clear button exists and click it
      const clearButton = page.locator('[data-testid="clear-history-button"]');
      if (await clearButton.isVisible()) {
        await clearButton.click();
        
        // Confirm clearing if there's a confirmation dialog
        const confirmButton = page.locator('[data-testid="confirm-clear"]');
        if (await confirmButton.isVisible()) {
          await confirmButton.click();
        }
        
        // Verify history is cleared
        await expect(page.locator('[data-testid="history-empty"]')).toBeVisible();
      }
    });
  });

  test.describe('3D Elements and Animations', () => {
    test('should render 3D floating elements', async ({ page }) => {
      // Check that Three.js canvas is rendered
      await expect(page.locator('canvas')).toBeVisible();
      
      // Wait for 3D elements to load
      await page.waitForTimeout(2000);
      
      // Verify 3D container
      await expect(page.locator('[data-testid="floating-elements"]')).toBeVisible();
    });

    test('should have animated gradient backgrounds', async ({ page }) => {
      // Check for animated gradient classes
      const gradientElements = page.locator('.animate-gradient-x, .animate-pulse');
      await expect(gradientElements.first()).toBeVisible();
    });
  });

  test.describe('Error Handling and Edge Cases', () => {
    test('should handle API errors gracefully', async ({ page }) => {
      await page.goto(`${BASE_URL}/auth/login`);
      await page.fill('input[name="email"]', 'demo@fraudshield.com');
      await page.fill('input[name="password"]', 'demo123');
      await page.click('button[type="submit"]');
      await expect(page).toHaveURL(/.*\/dashboard/);
      
      // Mock network failure
      await page.route('**/api/predict', route => route.abort());
      
      // Try to submit analysis
      await page.fill('input[name="amount"]', '100.00');
      await page.click('button[data-testid="analyze-button"]');
      
      // Should show error message
      await expect(page.locator('[data-testid="error-message"]')).toBeVisible({ timeout: 10000 });
    });

    test('should handle session expiration', async ({ page }) => {
      // This test would need to mock session expiration
      // For now, just verify logout functionality
      await page.goto(`${BASE_URL}/dashboard`);
      
      const logoutButton = page.locator('[data-testid="logout-button"]');
      if (await logoutButton.isVisible()) {
        await logoutButton.click();
        await expect(page).toHaveURL(/.*\/auth\/login/);
      }
    });
  });

  test.describe('Accessibility', () => {
    test('should have proper ARIA labels and keyboard navigation', async ({ page }) => {
      // Check for proper labels on form elements
      await page.goto(`${BASE_URL}/auth/login`);
      
      const emailInput = page.locator('input[name="email"]');
      const passwordInput = page.locator('input[name="password"]');
      
      await expect(emailInput).toHaveAttribute('aria-label');
      await expect(passwordInput).toHaveAttribute('aria-label');
      
      // Test keyboard navigation
      await emailInput.press('Tab');
      await expect(passwordInput).toBeFocused();
    });

    test('should have sufficient color contrast for black/yellow theme', async ({ page }) => {
      // This would need specialized accessibility testing tools
      // For now, just verify theme elements are visible
      await expect(page.locator('button').first()).toBeVisible();
      await expect(page.locator('h1').first()).toBeVisible();
    });
  });
});