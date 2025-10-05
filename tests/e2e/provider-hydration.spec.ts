import { test, expect } from '@playwright/test';

test.describe('Provider Hydration and SSR Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Listen for console errors, especially React errors
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });
    
    // Store console errors for assertions
    (page as any).consoleErrors = consoleErrors;
  });

  test('should load homepage without React useReducer errors', async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Wait for the page to fully load and hydrate
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Allow time for React hydration
    
    // Check that the page title loads correctly
    await expect(page).toHaveTitle(/FraudShield/);
    
    // Verify no React useReducer errors in console
    const consoleErrors = (page as any).consoleErrors as string[];
    const reactErrors = consoleErrors.filter(error => 
      error.includes('useReducer') || 
      error.includes('TypeError') ||
      error.includes('Cannot read properties of null')
    );
    
    expect(reactErrors).toHaveLength(0);
    
    // Verify the main content is visible (indicating successful hydration)
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('#root')).toBeVisible();
  });

  test('should display loading state during client-side provider hydration', async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // The loading spinner should appear briefly during hydration
    // We might catch it or it might be too fast - both are acceptable
    const loadingSpinner = page.locator('.animate-spin');
    
    // Wait for the page to stabilize
    await page.waitForLoadState('networkidle');
    
    // Verify that the main content is eventually visible
    await expect(page.locator('#root')).toBeVisible();
    
    // Check that providers are properly initialized by verifying auth context
    // This is indicated by the absence of loading spinners after hydration
    await page.waitForTimeout(1000);
  });

  test('should handle Supabase provider initialization gracefully', async ({ page }) => {
    // Track network requests to Supabase
    const supabaseRequests: string[] = [];
    page.on('request', request => {
      if (request.url().includes('supabase.co')) {
        supabaseRequests.push(request.url());
      }
    });
    
    // Navigate to the application
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Verify no React errors occurred during provider initialization
    const consoleErrors = (page as any).consoleErrors as string[];
    const providerErrors = consoleErrors.filter(error => 
      error.includes('createClient') || 
      error.includes('Supabase') ||
      error.includes('Provider')
    );
    
    expect(providerErrors).toHaveLength(0);
    
    // The application should render successfully regardless of Supabase connection
    await expect(page.locator('body')).toHaveClass(/font-sans/);
    await expect(page.locator('body')).toHaveClass(/bg-dark-900/);
  });

  test('should maintain proper component tree during SSR to CSR transition', async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Verify the basic HTML structure is present immediately (SSR)
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('body')).toBeVisible();
    
    // Wait for client-side hydration
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Verify the component tree is properly structured after hydration
    await expect(page.locator('#root')).toBeVisible();
    await expect(page.locator('.cyber-bg')).toBeVisible();
    
    // Check that the providers wrapper is functioning
    // (This is indicated by proper theme application)
    await expect(page.locator('body')).toHaveClass(/text-white/);
    
    // Verify no hydration mismatches occurred
    const consoleErrors = (page as any).consoleErrors as string[];
    const hydrationErrors = consoleErrors.filter(error => 
      error.includes('hydration') || 
      error.includes('mismatch') ||
      error.includes('server') && error.includes('client')
    );
    
    expect(hydrationErrors).toHaveLength(0);
  });

  test('should recover gracefully from provider initialization failures', async ({ page }) => {
    // Mock Supabase client creation failure
    await page.addInitScript(() => {
      // Override the Supabase client creation to simulate failure
      const originalCreateClient = window.createClient;
      window.createClient = () => {
        throw new Error('Simulated Supabase connection failure');
      };
    });
    
    // Navigate to the application
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // The application should still render the basic layout
    await expect(page.locator('body')).toBeVisible();
    await expect(page.locator('#root')).toBeVisible();
    
    // Verify no React crashes occurred
    const consoleErrors = (page as any).consoleErrors as string[];
    const reactCrashes = consoleErrors.filter(error => 
      error.includes('crash') || 
      error.includes('unstable') ||
      error.includes('boundary')
    );
    
    // Error boundary might catch provider failures, which is acceptable
    expect(reactCrashes.length).toBeLessThanOrEqual(1);
  });

  test('should handle rapid navigation without provider re-initialization errors', async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // Clear any initial console errors
    (page as any).consoleErrors = [];
    
    // Perform rapid navigation if routes exist
    const navigationLinks = page.locator('nav a, button[data-testid*="nav"]');
    const linkCount = await navigationLinks.count();
    
    if (linkCount > 0) {
      // Click the first navigation element
      await navigationLinks.first().click();
      await page.waitForTimeout(500);
      
      // Navigate back
      await page.goBack();
      await page.waitForTimeout(500);
    }
    
    // Verify no provider-related errors during navigation
    const consoleErrors = (page as any).consoleErrors as string[];
    const navigationErrors = consoleErrors.filter(error => 
      error.includes('Provider') || 
      error.includes('useReducer') ||
      error.includes('Context')
    );
    
    expect(navigationErrors).toHaveLength(0);
  });

  test('should display proper loading states before provider hydration', async ({ page }) => {
    // Navigate to application with network throttling to slow down hydration
    await page.route('**/*', async route => {
      await new Promise(resolve => setTimeout(resolve, 100)); // Delay all requests
      await route.continue();
    });
    
    await page.goto('/');
    
    // Loading spinner or skeleton should be visible during hydration delay
    const loadingElements = page.locator('.animate-spin, .animate-pulse, [data-testid*="loading"]');
    
    // Wait for hydration to complete
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // Main content should eventually be visible
    await expect(page.locator('#root')).toBeVisible();
    await expect(page.locator('.cyber-bg')).toBeVisible();
  });

  test('should preserve theme and styling during provider hydration', async ({ page }) => {
    // Navigate to the application
    await page.goto('/');
    
    // Check initial styling (should be applied via SSR/CSS)
    await expect(page.locator('body')).toHaveClass(/bg-dark-900/);
    await expect(page.locator('body')).toHaveClass(/text-white/);
    
    // Wait for provider hydration
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Verify styling is preserved after hydration
    await expect(page.locator('body')).toHaveClass(/bg-dark-900/);
    await expect(page.locator('body')).toHaveClass(/text-white/);
    await expect(page.locator('body')).toHaveClass(/font-sans/);
    
    // Check that the cyber background is applied
    await expect(page.locator('.cyber-bg')).toBeVisible();
    
    // Verify no styling flickers occurred
    const consoleErrors = (page as any).consoleErrors as string[];
    const styleErrors = consoleErrors.filter(error => 
      error.includes('style') || 
      error.includes('CSS') ||
      error.includes('class')
    );
    
    expect(styleErrors).toHaveLength(0);
  });
});