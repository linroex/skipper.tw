# Advanced Usage Guide

## Network Interception

### Block Specific Resources
```javascript
const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();

// Block images
await page.setRequestInterception(true);
page.on('request', request => {
    if (request.resourceType() === 'image') {
        request.abort();
    } else {
        request.continue();
    }
});
```

### Mock API Responses
```javascript
await page.setRequestInterception(true);
page.on('request', request => {
    if (request.url().includes('/api/')) {
        request.respond({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({ mocked: true })
        });
    } else {
        request.continue();
    }
});
```

### Capture Network Timing
```javascript
const timing = {};
page.on('request', request => {
    timing[request.url()] = {
        start: Date.now(),
        url: request.url()
    };
});

page.on('response', response => {
    const url = response.request().url();
    if (timing[url]) {
        timing[url].end = Date.now();
        timing[url].duration = timing[url].end - timing[url].start;
        console.log(`${url}: ${timing[url].duration}ms`);
    }
});
```

## Authentication & Cookies

### Login with Cookies
```javascript
const page = await browser.newPage();
await page.setCookies([
    {
        name: 'session_id',
        value: 'your-session-token',
        domain: 'example.com',
        path: '/'
    }
]);
```

### Session Storage
```javascript
// Save session
const session = await browser.contexts()[0].cookies();
fs.writeFileSync('session.json', JSON.stringify(session));

// Load session
const session = JSON.parse(fs.readFileSync('session.json'));
await page.setCookies(session);
```

### Local Storage
```javascript
// Get local storage
const storage = await page.evaluate(() => JSON.stringify(localStorage));
console.log(storage);

// Set local storage
await page.evaluate((key, value) => {
    localStorage.setItem(key, value);
}, 'myKey', 'myValue');
```

## Page Interaction

### Click Elements
```javascript
// Click by selector
await page.click('.submit-button');

// Click with options
await page.click('.dropdown', {
    clicks: 2,
    delay: 100
});
```

### Form Filling
```javascript
await page.type('#username', 'testuser');
await page.type('#password', 'secret123', { delay: 50 });
await page.press('#password', 'Enter');
```

### Scroll to Element
```javascript
await page.evaluate(() => {
    window.scrollBy(0, 500);
});

// Scroll to specific element
await page.evaluate(() => {
    document.querySelector('.target').scrollIntoView();
});
```

## JavaScript Evaluation

### Get Page State
```javascript
const state = await page.evaluate(() => {
    return {
        title: document.title,
        url: window.location.href,
        userAgent: navigator.userAgent,
        language: navigator.language,
        cookieCount: document.cookie.length,
        elementCount: document.querySelectorAll('*').length
    };
});
```

### Execute Async Functions
```javascript
const result = await page.evaluate(async () => {
    const response = await fetch('/api/data');
    const data = await response.json();
    return data;
});
```

### Wait for Condition
```javascript
const isVisible = await page.evaluate(() => {
    return document.querySelector('.loading') === null;
});

// Wait for element to be visible
await page.waitForFunction(() => {
    const element = document.querySelector('.target');
    return element && element.offsetParent !== null;
});
```

## Screenshot Advanced

### Capture Specific Element
```javascript
const element = await page.$('.important-section');
if (element) {
    await element.screenshot({ path: 'element.png' });
}
```

### PDF Generation
```javascript
await page.pdf({
    path: 'page.pdf',
    format: 'A4',
    printBackground: true,
    margin: {
        top: '20px',
        right: '20px',
        bottom: '20px',
        left: '20px'
    }
});
```

### High DPI Screenshots
```javascript
await page.setViewport({
    width: 1920,
    height: 1080,
    deviceScaleFactor: 2 // Retina display
});
await page.screenshot({ path: 'hd-screenshot.png' });
```

## Performance Metrics

### Lighthouse-style Metrics
```javascript
const metrics = await page.metrics();
console.log('Metrics:', metrics);

// Page load timing
const timing = await page.evaluate(() => {
    const t = performance.timing;
    return {
        dns: t.domainLookupEnd - t.domainLookupStart,
        tcp: t.connectEnd - t.connectStart,
        ttfb: t.responseStart - t.requestStart,
        load: t.loadEventEnd - t.navigationStart
    };
});
```

### Resource Loading
```javascript
const resources = [];
page.on('requestfinished', request => {
    resources.push({
        url: request.url(),
        type: request.resourceType(),
        size: request.response()?.headers()['content-length']
    });
});
```

## Error Handling

### Comprehensive Error Capture
```javascript
const errors = [];
const warnings = [];

page.on('console', msg => {
    const type = msg.type();
    if (type === 'error') {
        errors.push(msg.text());
    } else if (type === 'warning') {
        warnings.push(msg.text());
    }
});

page.on('pageerror', error => {
    errors.push(error.message);
});

page.on('requestfailed', request => {
    console.log(`Failed: ${request.url()}`);
});

try {
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
} catch (error) {
    console.log('Navigation error:', error.message);
    console.log('Errors found:', errors.length);
    console.log('Warnings found:', warnings.length);
}
```

## Testing Patterns

### Component Testing
```javascript
// Test if component is rendered
const componentVisible = await page.evaluate(() => {
    return document.querySelector('[data-component="activity-card"]') !== null;
});
```

### Data Verification
```javascript
const dataCount = await page.evaluate(() => {
    return document.querySelectorAll('.activity-card').length;
});

if (dataCount !== expectedCount) {
    throw new Error(`Expected ${expectedCount} items, got ${dataCount}`);
}
```

### Visual Regression
```javascript
// Compare current screenshot with baseline
const currentScreenshot = await page.screenshot({ fullPage: true });
const baselineScreenshot = fs.readFileSync('baseline.png');

// Use pixelmatch for comparison
const { diff } = pixelmatch(baselineScreenshot, currentScreenshot, null, width, height);
console.log(`Difference: ${diff} pixels`);
```

## Debugging Tips

1. **Enable verbose logging:**
```javascript
page.on('console', msg => console.log('CONSOLE:', msg.text()));
page.on('request', req => console.log('REQUEST:', req.url()));
page.on('response', res => console.log('RESPONSE:', res.status(), res.url()));
```

2. **Step-by-step navigation:**
```javascript
await page.goto(url);
await page.waitForSelector('header');
await page.click('.nav-link');
await page.waitForSelector('.content');
```

3. **Slow down execution:**
```javascript
await page.waitFor(1000); // Wait 1 second
```

## Best Practices

1. **Always use proper timeouts** to prevent hanging
2. **Close browser properly** with `await browser.close()`
3. **Handle errors gracefully** with try-catch blocks
4. **Use selectors wisely** - prefer data attributes over class names
5. **Clean up resources** - screenshots, temporary files
6. **Log important actions** for debugging
7. **Use environment variables** for sensitive data

## Common Patterns

### Retry Logic
```javascript
async function retry(action, retries = 3) {
    for (let i = 0; i < retries; i++) {
        try {
            return await action();
        } catch (error) {
            if (i === retries - 1) throw error;
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
        }
    }
}
```

### Timeout Wrapper
```javascript
function withTimeout(promise, ms) {
    const timeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), ms);
    });
    return Promise.race([promise, timeout]);
}
```

---

*For more examples, check the Puppeteer documentation: https://pptr.dev/*
