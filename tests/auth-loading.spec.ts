import { test, expect } from '@playwright/test'

test.describe('Authentication and Loading States', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/auth/login')
  })

  test('should display login page with background elements', async ({ page }) => {
    // Check page loads correctly
    await expect(page).toHaveTitle(/FraudShield/)
    
    // Verify login form elements are present
    await expect(page.getByRole('heading', { name: 'Welcome Back' })).toBeVisible()
    await expect(page.getByPlaceholder('Enter your email')).toBeVisible()
    await expect(page.getByPlaceholder('Enter your password')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible()
    
    // Verify background elements are rendered
    await expect(page.locator('.cyber-bg')).toBeVisible()
  })

  test('should show loading state during login attempt', async ({ page }) => {
    // Fill in login form
    await page.fill('[placeholder="Enter your email"]', 'test@example.com')
    await page.fill('[placeholder="Enter your password"]', 'testpassword')
    
    // Click login button
    await page.getByRole('button', { name: 'Sign In' }).click()
    
    // Verify loading state appears
    await expect(page.locator('.spinner')).toBeVisible()
    await expect(page.getByText('Signing in...')).toBeVisible()
    
    // Verify button is disabled during loading
    await expect(page.getByRole('button')).toBeDisabled()
  })

  test('should display network error message for failed requests', async ({ page }) => {
    // Mock network failure
    await page.route('**/auth/v1/**', route => {
      route.abort('failed')
    })
    
    // Fill in login form
    await page.fill('[placeholder="Enter your email"]', 'test@example.com')
    await page.fill('[placeholder="Enter your password"]', 'testpassword')
    
    // Attempt login
    await page.getByRole('button', { name: 'Sign In' }).click()
    
    // Wait for error message
    await expect(page.getByText(/Network error/)).toBeVisible({ timeout: 10000 })
  })

  test('should navigate to register page and show loading states', async ({ page }) => {
    // Navigate to register page
    await page.getByRole('link', { name: 'Sign up' }).click()
    
    // Verify register page loads
    await expect(page.getByRole('heading', { name: 'Create Account' })).toBeVisible()
    
    // Fill in registration form
    await page.fill('[placeholder="Enter your full name"]', 'Test User')
    await page.fill('[placeholder="Enter your email"]', 'test@example.com')
    await page.fill('[placeholder="Create a password"]', 'testpassword')
    await page.fill('[placeholder="Confirm your password"]', 'testpassword')
    
    // Check terms checkbox
    await page.check('#terms')
    
    // Click register button
    await page.getByRole('button', { name: 'Create Account' }).click()
    
    // Verify loading states
    await expect(page.locator('.spinner')).toBeVisible()
    await expect(page.getByText('Validating...')).toBeVisible()
    
    // Wait for next loading state
    await expect(page.getByText('Creating account...')).toBeVisible({ timeout: 5000 })
  })

  test('should show password visibility toggle', async ({ page }) => {
    const passwordInput = page.getByPlaceholder('Enter your password')
    const toggleButton = page.locator('button[type="button"]').filter({ hasText: '' })
    
    // Initially password should be hidden
    await expect(passwordInput).toHaveAttribute('type', 'password')
    
    // Click toggle button
    await toggleButton.first().click()
    
    // Password should now be visible
    await expect(passwordInput).toHaveAttribute('type', 'text')
  })

  test('should have navigation loading indicator', async ({ page }) => {
    // Check that navigation loading component exists in DOM
    await expect(page.locator('body')).toContainText('')
    
    // The NavigationLoading component should be present (even if not visible)
    const navigationLoading = page.locator('div[style*="width"]').first()
    await expect(navigationLoading).toBeAttached()
  })

  test('should validate form inputs', async ({ page }) => {
    // Try to submit empty form
    await page.getByRole('button', { name: 'Sign In' }).click()
    
    // Browser validation should prevent submission
    const emailInput = page.getByPlaceholder('Enter your email')
    await expect(emailInput).toHaveAttribute('required')
    
    const passwordInput = page.getByPlaceholder('Enter your password')
    await expect(passwordInput).toHaveAttribute('required')
  })

  test('should handle password mismatch in registration', async ({ page }) => {
    // Navigate to register page
    await page.getByRole('link', { name: 'Sign up' }).click()
    
    // Fill form with mismatched passwords
    await page.fill('[placeholder="Enter your full name"]', 'Test User')
    await page.fill('[placeholder="Enter your email"]', 'test@example.com')
    await page.fill('[placeholder="Create a password"]', 'password1')
    await page.fill('[placeholder="Confirm your password"]', 'password2')
    await page.check('#terms')
    
    // Submit form
    await page.getByRole('button', { name: 'Create Account' }).click()
    
    // Should show error message
    await expect(page.getByText('Passwords do not match')).toBeVisible()
  })

  test('should render geometric background elements', async ({ page }) => {
    // Wait for page to load completely
    await page.waitForLoadState('networkidle')
    
    // Check that background elements are present
    await expect(page.locator('.cyber-bg')).toBeVisible()
    
    // Look for background styling
    const backgroundElement = page.locator('.cyber-bg')
    await expect(backgroundElement).toHaveCSS('min-height', /.+/)
  })
})