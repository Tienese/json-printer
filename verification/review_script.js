const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

async function runReview() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  const takeScreenshot = async (name) => {
    const filePath = path.join(process.cwd(), 'verification', `${name}.png`);
    await page.screenshot({ path: filePath });
    console.log(`Screenshot saved: ${filePath}`);
  };

  try {
    console.log('Navigating to Home...');
    await page.goto('http://localhost:5173/');
    await page.waitForLoadState('networkidle');
    await takeScreenshot('01-home-desktop');

    console.log('Navigating to Worksheet Dashboard...');
    // Navigate via hash to be sure
    await page.goto('http://localhost:5173/#worksheet');
    // Wait for the dashboard to load (look for "My Worksheets")
    await page.waitForSelector('text=My Worksheets', { timeout: 10000 });
    await takeScreenshot('04-dashboard');

    console.log('Clicking Blank Worksheet...');
    // Click the card that contains "Blank Worksheet"
    // We target the text "Blank Worksheet" and click it
    const blankCard = page.getByText('Blank Worksheet');
    await blankCard.click();

    // Wait for editor to load
    console.log('Waiting for Editor...');
    await page.waitForURL(/worksheet\/edit/);
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Give it a moment to render
    await takeScreenshot('05-editor-initial');

    // Try to add a question item if possible
    // We'll look for "Add Item" or similar buttons in the sidebar
    // Based on memory, there might be a "Questions" or "Items" panel.
    // Let's dump the page text or ARIA roles if we can't find it, but let's guess "Add"

    // We will just try to take a screenshot of the empty editor first.
    // If there is an "Add" button visible, we click it.
    // Try to find a button with "Add" or a plus icon.
    // Maybe "Text" or "Question".

    // Let's try to click "Text" tool if available in a sidebar
    // Assuming there is a sidebar with tools.

  } catch (error) {
    console.error('Error during review:', error);
    // Take a failure screenshot
    await page.screenshot({ path: path.join(process.cwd(), 'verification', 'error-state.png') });
  } finally {
    await browser.close();
  }
}

runReview();
