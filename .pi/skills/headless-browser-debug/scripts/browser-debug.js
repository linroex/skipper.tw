#!/usr/bin/env node

/**
 * Headless Browser Debug Script
 * Uses Puppeteer to open browser and capture debugging information
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

// Parse command line arguments
const args = process.argv.slice(2);

function parseArgs(args) {
    const result = {
        url: '',
        action: 'debug',
        timeout: 30000,
        headful: false,
        viewport: null,
        screenshotPath: null
    };

    let i = 0;
    while (i < args.length) {
        if (args[i] === 'debug' || args[i] === 'open' || args[i] === 'screenshot' || 
            args[i] === 'content' || args[i] === 'errors' || args[i] === 'network' || 
            args[i] === 'eval' || args[i] === 'inspect') {
            result.action = args[i];
            if (args[i + 1] && !args[i + 1].startsWith('-')) {
                result.url = args[i + 1];
                i++;
            }
        } else if (args[i] === '--timeout' && args[i + 1]) {
            result.timeout = parseInt(args[i + 1], 10);
            i++;
        } else if (args[i] === '--headful') {
            result.headful = true;
        } else if (args[i] === '--viewport' && args[i + 1]) {
            result.viewport = args[i + 1];
            i++;
        } else if (args[i] === '--screenshot' && args[i + 1]) {
            result.screenshotPath = args[i + 1];
            i++;
        } else if (args[i] === '--wait' && args[i + 1]) {
            result.waitFor = args[i + 1];
            i++;
        } else if (args[i].startsWith('--') || args[i].startsWith('-')) {
            // Skip unknown flags
        } else {
            // Could be URL or selector for inspect
            if (!result.url) {
                result.url = args[i];
            } else if (!result.selector && (result.action === 'inspect' || result.action === 'eval')) {
                result.selector = args[i];
            }
        }
        i++;
    }

    return result;
}

async function captureConsoleLogs(page) {
    const logs = [];
    page.on('console', msg => {
        logs.push({
            type: msg.type(),
            text: msg.text(),
            location: msg.location()
        });
    });
    return logs;
}

async function captureErrors(page) {
    const errors = [];
    page.on('pageerror', error => {
        errors.push(error.toString());
    });
    return errors;
}

async function captureNetwork(page) {
    const requests = [];
    page.on('request', request => {
        requests.push({
            url: request.url(),
            method: request.method(),
            resourceType: request.resourceType()
        });
    });
    page.on('response', async response => {
        const req = requests.find(r => r.url === response.request().url());
        if (req) {
            req.status = response.status();
            req.statusText = response.statusText();
            try {
                req.size = (await response.buffer()).length;
            } catch (e) {
                req.size = 0;
            }
        }
    });
    page.on('requestfailed', request => {
        requests.find(r => r.url === request.url())?.failed = true;
    });
    return requests;
}

async function captureScreenshot(page, outputPath) {
    await page.screenshot({
        path: outputPath,
        fullPage: true
    });
    return outputPath;
}

async function extractContent(page) {
    return await page.evaluate(() => {
        return {
            title: document.title,
            textContent: document.body.textContent?.substring(0, 10000),
            metaDescription: document.querySelector('meta[name="description"]')?.content,
            links: Array.from(document.querySelectorAll('a')).map(a => ({
                text: a.textContent?.substring(0, 100),
                href: a.href
            })),
            headings: Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6')).map(h => ({
                level: h.tagName.toLowerCase(),
                text: h.textContent?.substring(0, 100)
            }))
        };
    });
}

async function inspectElement(page, selector) {
    const elements = await page.$$(selector);
    return elements.map((el, index) => ({
        index,
        selector,
        attributes: el.evaluate(el => {
            const attrs = {};
            Array.from(el.attributes).forEach(attr => {
                attrs[attr.name] = attr.value;
            });
            return attrs;
        }),
        textContent: el.evaluate(el => el.textContent?.substring(0, 200)),
        className: el.evaluate(el => el.className)
    }));
}

async function evaluateJS(page, expression) {
    return await page.evaluate(expression);
}

async function runDebug(url, timeout, headful, viewport, selector, waitFor) {
    console.log('🚀 Starting Headless Browser Debug');
    console.log('====================================\n');
    console.log(`📍 URL: ${url}`);
    console.log(`⏱ Timeout: ${timeout}ms`);
    console.log(`👁 Mode: ${headful ? 'Headful' : 'Headless'}`);
    console.log('====================================\n');

    const browser = await puppeteer.launch({
        headless: !headful,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // Set viewport if specified
    if (viewport) {
        const [width, height] = viewport.split('x').map(Number);
        await page.setViewport({ width, height });
    }

    // Attach event listeners
    const consoleLogs = await captureConsoleLogs(page);
    const pageErrors = await captureErrors(page);
    const networkRequests = await captureNetwork(page);

    // Navigate to page
    console.log(`🌐 Navigating to ${url}...`);
    await page.goto(url, {
        waitUntil: 'networkidle0',
        timeout
    });

    // Wait for element if specified
    if (waitFor) {
        console.log(`⏳ Waiting for: ${waitFor}...`);
        try {
            await page.waitForSelector(waitFor, { timeout: 10000 });
            console.log('✓ Element found');
        } catch (e) {
            console.log('✗ Element not found');
        }
    }

    // Take screenshot
    const screenshotPath = path.join(process.cwd(), 'debug-screenshot.png');
    await captureScreenshot(page, screenshotPath);
    console.log(`\n📸 Screenshot saved to: ${screenshotPath}`);

    // Extract content
    const content = await extractContent(page);

    // Close browser
    await browser.close();

    // Display results
    console.log('\n' + '='.repeat(50));
    console.log('📊 DEBUG REPORT');
    console.log('='.repeat(50));

    // Title and Meta
    console.log('\n📄 Page Information:');
    console.log(`   Title: ${content.title}`);
    if (content.metaDescription) {
        console.log(`   Description: ${content.metaDescription.substring(0, 100)}`);
    }

    // Console Logs
    console.log(`\n📝 Console Logs (${consoleLogs.length} total):`);
    const errorsOnly = consoleLogs.filter(log => log.type() === 'error' || log.type() === 'warning');
    if (errorsOnly.length > 0) {
        console.log('   ⚠️  Errors & Warnings:');
        errorsOnly.forEach(log => {
            console.log(`      [${log.type.toUpperCase()}] ${log.text}`);
        });
    }
    if (consoleLogs.length > 10) {
        console.log(`   ... and ${consoleLogs.length - 10} more logs`);
    } else if (consoleLogs.length === 0) {
        console.log('   ✓ No console logs');
    }

    // Page Errors
    if (pageErrors.length > 0) {
        console.log(`\n❌ Page Errors (${pageErrors.length}):`);
        pageErrors.forEach((error, i) => {
            console.log(`   ${i + 1}. ${error}`);
        });
    } else {
        console.log('\n✓ No page errors');
    }

    // Network Requests
    console.log(`\n🌐 Network Requests (${networkRequests.length} total):`);
    const failedRequests = networkRequests.filter(r => r.failed);
    const errorResponses = networkRequests.filter(r => r.status >= 400);
    
    if (failedRequests.length > 0) {
        console.log(`   ❌ Failed: ${failedRequests.length}`);
        failedRequests.forEach(r => console.log(`      - ${r.url}`));
    }
    if (errorResponses.length > 0) {
        console.log(`   ⚠️  Error responses (4xx/5xx): ${errorResponses.length}`);
        errorResponses.slice(0, 5).forEach(r => {
            console.log(`      - ${r.url} (${r.status})`);
        });
    }
    if (networkRequests.length > 20) {
        console.log(`   ... and ${networkRequests.length - 20} more requests`);
    }

    // Links Summary
    console.log(`\n🔗 Links found: ${content.links.length}`);

    // Headings
    if (content.headings.length > 0) {
        console.log('\n📑 Headings:');
        content.headings.forEach(h => {
            console.log(`   ${h.level.toUpperCase()}: ${h.text}`);
        });
    }

    console.log('\n' + '='.repeat(50));
    console.log('✅ Debug complete!');
    console.log('='.repeat(50));

    return {
        url,
        title: content.title,
        consoleLogs: consoleLogs.length,
        errors: pageErrors.length,
        networkRequests: networkRequests.length,
        screenshot: screenshotPath
    };
}

async function runAction(action, url, timeout, headful, viewport, selector, waitFor) {
    if (!url) {
        console.error('❌ Error: URL is required');
        console.error('\nUsage:');
        console.error('  node browser-debug.js "action" "url" [options]');
        console.error('\nActions:');
        console.error('  debug     - Full debugging report (default)');
        console.error('  open      - Open page with basic logs');
        console.error('  screenshot - Take a screenshot');
        console.error('  content   - Extract page content');
        console.error('  errors    - Show only errors');
        console.error('  network   - Show network activity');
        console.error('  eval      - Evaluate JavaScript');
        console.error('  inspect   - Inspect elements');
        process.exit(1);
    }

    switch (action) {
        case 'debug':
            return await runDebug(url, timeout, headful, viewport, selector, waitFor);
        
        case 'open':
            console.log(`🌐 Opening ${url}...`);
            const browser = await puppeteer.launch({
                headless: !headful,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page = await browser.newPage();
            if (viewport) {
                const [width, height] = viewport.split('x').map(Number);
                await page.setViewport({ width, height });
            }
            await page.goto(url, { waitUntil: 'networkidle0', timeout });
            await page.screenshot({ path: 'debug-open.png' });
            console.log('✅ Page opened and screenshot saved');
            await browser.close();
            break;

        case 'screenshot':
            const screenshotPath = selector || 'debug-screenshot.png';
            console.log(`📸 Taking screenshot...`);
            const browser2 = await puppeteer.launch({
                headless: !headful,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page2 = await browser2.newPage();
            if (viewport) {
                const [width, height] = viewport.split('x').map(Number);
                await page2.setViewport({ width, height });
            }
            await page2.goto(url, { waitUntil: 'networkidle0', timeout });
            await page2.screenshot({ path: screenshotPath, fullPage: true });
            console.log(`✅ Screenshot saved to: ${screenshotPath}`);
            await browser2.close();
            break;

        case 'content':
            console.log(`📄 Extracting content from ${url}...`);
            const browser3 = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page3 = await browser3.newPage();
            await page3.goto(url, { waitUntil: 'networkidle0', timeout });
            const content = await extractContent(page3);
            console.log(`Title: ${content.title}`);
            console.log(`\nText content (first 500 chars):`);
            console.log(content.textContent.substring(0, 500));
            await browser3.close();
            break;

        case 'errors':
            console.log(`🔍 Checking for errors in ${url}...`);
            const browser4 = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page4 = await browser4.newPage();
            const errors = await captureErrors(page4);
            await page4.goto(url, { waitUntil: 'networkidle0', timeout });
            if (errors.length > 0) {
                console.log(`❌ Found ${errors.length} error(s):`);
                errors.forEach((err, i) => console.log(`   ${i + 1}. ${err}`));
            } else {
                console.log('✓ No errors found');
            }
            await browser4.close();
            break;

        case 'network':
            console.log(`🌐 Monitoring network activity in ${url}...`);
            const browser5 = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page5 = await browser5.newPage();
            const requests = await captureNetwork(page5);
            await page5.goto(url, { waitUntil: 'networkidle0', timeout });
            console.log(`Total requests: ${requests.length}`);
            const failed = requests.filter(r => r.failed);
            if (failed.length > 0) {
                console.log(`Failed requests: ${failed.length}`);
                failed.forEach(r => console.log(`   - ${r.url}`));
            }
            await browser5.close();
            break;

        case 'eval':
            console.log(`💻 Evaluating JavaScript in ${url}...`);
            const browser6 = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page6 = await browser6.newPage();
            await page6.goto(url, { waitUntil: 'networkidle0', timeout });
            const result = await evaluateJS(page6, selector);
            console.log('Result:', JSON.stringify(result, null, 2));
            await browser6.close();
            break;

        case 'inspect':
            console.log(`🔍 Inspecting elements matching "${selector}" in ${url}...`);
            const browser7 = await puppeteer.launch({
                headless: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox']
            });
            const page7 = await browser7.newPage();
            await page7.goto(url, { waitUntil: 'networkidle0', timeout });
            const elements = await inspectElement(page7, selector);
            console.log(`Found ${elements.length} element(s):`);
            elements.slice(0, 10).forEach(el => {
                console.log(`\nElement ${el.index + 1}:`);
                console.log(`   Class: ${el.className}`);
                console.log(`   Text: ${el.textContent}`);
                console.log(`   Attributes:`, el.attributes);
            });
            await browser7.close();
            break;

        default:
            console.error(`❌ Unknown action: ${action}`);
            process.exit(1);
    }
}

// Run the script
async function main() {
    const config = parseArgs(args);
    await runAction(
        config.action,
        config.url,
        config.timeout,
        config.headful,
        config.viewport,
        config.selector,
        config.waitFor
    );
}

main().catch(error => {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
});
