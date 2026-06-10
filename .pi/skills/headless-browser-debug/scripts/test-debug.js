#!/usr/bin/env node

/**
 * Test script to verify headless browser debugging functionality
 */

const puppeteer = require('puppeteer');

async function runTests() {
    console.log('🧪 Testing Headless Browser Debug Skill\n');

    // Test 1: Browser Launch
    console.log('Test 1: Launching browser...');
    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        console.log('✅ Browser launched successfully');
        
        // Test 2: Create page
        console.log('Test 2: Creating page...');
        const page = await browser.newPage();
        console.log('✅ Page created successfully');

        // Test 3: Set viewport
        console.log('Test 3: Setting viewport...');
        await page.setViewport({ width: 1920, height: 1080 });
        console.log('✅ Viewport set successfully');

        // Test 4: Navigate to a page
        console.log('Test 4: Navigating to example.com...');
        await page.goto('https://example.com', { 
            waitUntil: 'networkidle0',
            timeout: 10000
        });
        console.log('✅ Navigation successful');

        // Test 5: Capture console logs
        console.log('Test 5: Capturing console logs...');
        const logs = [];
        page.on('console', msg => logs.push(msg.text()));
        console.log('✅ Console logger attached');

        // Test 6: Capture page errors
        console.log('Test 6: Capturing page errors...');
        const errors = [];
        page.on('pageerror', error => errors.push(error.message));
        console.log('✅ Error logger attached');

        // Test 7: Capture network requests
        console.log('Test 7: Capturing network requests...');
        const requests = [];
        page.on('request', request => {
            requests.push({
                url: request.url(),
                method: request.method(),
                resourceType: request.resourceType()
            });
        });
        console.log(`✅ Captured ${requests.length} requests during navigation`);

        // Test 8: Get page content
        console.log('Test 8: Extracting page content...');
        const content = await page.evaluate(() => {
            return {
                title: document.title,
                textContent: document.body.textContent?.substring(0, 100),
                headingCount: document.querySelectorAll('h1').length
            };
        });
        console.log('✅ Content extracted:', content);

        // Test 9: Take screenshot
        console.log('Test 9: Taking screenshot...');
        const screenshotPath = './test-screenshot.png';
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`✅ Screenshot saved to ${screenshotPath}`);

        // Test 10: Evaluate JavaScript
        console.log('Test 10: Evaluating JavaScript...');
        const jsResult = await page.evaluate(() => {
            return {
                userAgent: navigator.userAgent,
                language: navigator.language,
                cookieCount: document.cookie.length
            };
        });
        console.log('✅ JavaScript evaluation successful:', jsResult);

        // Test 11: Inspect elements
        console.log('Test 11: Inspecting elements...');
        const elements = await page.$$('h1');
        console.log(`✅ Found ${elements.length} h1 elements`);

        // Test 12: Click and interact
        console.log('Test 12: Testing interactions...');
        await page.evaluate(() => {
            window.scrollTo(0, 100);
        });
        console.log('✅ Interaction successful');

        // Close browser
        await browser.close();
        console.log('✅ Browser closed successfully');

        console.log('\n' + '='.repeat(50));
        console.log('🎉 All tests passed successfully!');
        console.log('='.repeat(50));
        console.log('\n✅ The headless browser debug skill is working correctly!');
        console.log('\nYou can now use it with:');
        console.log('  /headless-browser-debug "debug http://your-site"');
        
    } catch (error) {
        console.error('\n❌ Test failed:', error.message);
        console.error('\nTroubleshooting:');
        console.error('1. Make sure Puppeteer is installed: npm install puppeteer');
        console.error('2. Check if Chromium is available: npx puppeteer browsers install chrome');
        console.error('3. Verify npm scripts are configured correctly');
        process.exit(1);
    }
}

runTests();
