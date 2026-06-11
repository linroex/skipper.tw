---
name: headless-browser-debug
description: Debug websites using Headless Chrome browser. Launch browser, capture console logs, errors, network requests, take screenshots, and inspect page content. Use for testing web pages, debugging JavaScript errors, or verifying page rendering.
---

# Headless Browser Debug

## Overview

This skill provides a **Headless Chrome Browser** powered by Puppeteer for debugging websites. It allows you to:

- Open web pages in a headless browser
- Capture console logs and error messages
- Monitor network requests and responses
- Take screenshots for visual inspection
- Inspect page content and DOM structure
- Run JavaScript in the browser context

Use this when you need to test your website, debug JavaScript errors, or verify how pages render.

## Setup

### Full Mode (Recommended)

Requires Puppeteer and Chromium for complete debugging features.

```bash
# Install dependencies
npm install puppeteer
npx puppeteer browsers install chrome

# Install system dependencies (Debian/Ubuntu)
# Ubuntu 24.04+ uses *t64 package names; older releases use the fallback names.
apt-get update && (apt-get install -y \
    libatk1.0-0t64 libatk-bridge2.0-0t64 libcups2t64 \
    libdrm2 libgbm1 libxkbcommon0 libxcomposite1 \
    libxdamage1 libxext6 libxfixes3 libxrandr2 \
    libpango-1.0-0 libcairo2 libasound2t64 libatspi2.0-0t64 \
    libnss3 libx11-xcb1 libxcb-dri3-0 libxss1 libgtk-3-0t64 \
  || apt-get install -y \
    libatk1.0-0 libatk-bridge2.0-0 libcups2 \
    libdrm2 libgbm1 libxkbcommon0 libxcomposite1 \
    libxdamage1 libxext6 libxfixes3 libxrandr2 \
    libpango-1.0-0 libcairo2 libasound2 libatspi2.0-0 \
    libnss3 libx11-xcb1 libxcb-dri3-0 libxss1 libgtk-3-0)

# Verify setup
node scripts/test-debug.js
```

### Fallback Mode (No Browser Required)

If you can't install Chromium, use the web-check script:

```bash
# Basic checks without browser
node scripts/web-check.js http://localhost:5173 check
node scripts/web-check.js http://localhost:5173 errors
node scripts/web-check.js http://localhost:5173 content
```

See [DEPENDENCIES.md](references/DEPENDENCIES.md) for detailed setup instructions.

## Usage

### Basic Commands

All commands use the `/headless-browser-debug` command with arguments:

```bash
/headless-browser-debug "action: command"
```

### Available Actions

#### 1. Open URL and Debug
```bash
/headless-browser-debug "open https://example.com"
```
Opens a page and captures all console logs, errors, and network activity.

#### 2. Take Screenshot
```bash
/headless-browser-debug "screenshot https://example.com"
```
Opens a page and captures a full-page screenshot.

#### 3. Extract Page Content
```bash
/headless-browser-debug "content https://example.com"
```
Extracts and displays the page's text content and title.

#### 4. Check Console Errors
```bash
/headless-browser-debug "errors https://example.com"
```
Only shows console errors and warnings from the page.

#### 5. Monitor Network Requests
```bash
/headless-browser-debug "network https://example.com"
```
Shows all network requests, response codes, and timing information.

#### 6. Run JavaScript
```bash
/headless-browser-debug "eval https://example.com 'document.title'"
```
Executes JavaScript in the browser context and returns the result.

#### 7. Inspect Element
```bash
/headless-browser-debug "inspect https://example.com 'selector'"
```
Finds elements matching the CSS selector and shows their attributes.

#### 8. Full Page Debug
```bash
/headless-browser-debug "debug https://example.com"
```
Performs comprehensive debugging: logs, errors, network, screenshot, and content.

## Examples

### Debug Your Website
```bash
/headless-browser-debug "debug http://localhost:5173"
```

### Check for Console Errors
```bash
/headless-browser-debug "errors http://localhost:5173"
```

### Take Screenshot of Landing Page
```bash
/headless-browser-debug "screenshot http://localhost:5173"
```

### Extract All Text Content
```bash
/headless-browser-debug "content http://localhost:5173"
```

### Find All Links on Page
```bash
/headless-browser-debug "inspect http://localhost:5173 'a[href]"
```

### Check Page Performance
```bash
/headless-browser-debug "network http://localhost:5173"
```

### Test Specific JavaScript
```bash
/headless-browser-debug "eval http://localhost:5173 'Array.from(document.querySelectorAll(\"h1\")).map(h => h.textContent)'"
```

## Detailed Workflow

### Step-by-Step Debugging

1. **Open the page** to see initial state:
   ```bash
   /headless-browser-debug "open http://localhost:5173"
   ```

2. **Check for errors**:
   ```bash
   /headless-browser-debug "errors http://localhost:5173"
   ```

3. **Take a screenshot** for visual verification:
   ```bash
   /headless-browser-debug "screenshot http://localhost:5173"
   ```

4. **Inspect specific elements**:
   ```bash
   /headless-browser-debug "inspect http://localhost:5173 '.activity-card'"
   ```

5. **Check if data loaded correctly**:
   ```bash
   /headless-browser-debug "content http://localhost:5173"
   ```

## Script Files

The skill includes helper scripts:

- `scripts/browser-debug.js` - Main debugging script
- `scripts/screenshot.js` - Screenshot capture
- `scripts/extract-content.js` - Content extraction

## Configuration

### Timeout Settings
Default timeout is 30 seconds. Override with:
```bash
/headless-browser-debug "open https://example.com --timeout 60000"
```

### Headless Mode
Default is headless. For headful mode (visible browser):
```bash
/headless-browser-debug "open https://example.com --headful"
```

### Viewport Settings
Custom viewport size:
```bash
/headless-browser-debug "open https://example.com --viewport 1920x1080"
```

## Notes

- All URLs should be accessible from the server
- Sensitive pages may require authentication (use appropriate cookies)
- Large pages may take longer to capture
- Some dynamic content may require waiting (use `--wait` option)
- Console logs include both browser console and JavaScript logs
- Network requests show successful and failed requests
- Take multiple screenshots if the page has interactions

## Troubleshooting

### "Browser not found" error
Make sure Chromium is installed:
```bash
npx puppeteer browsers install chrome
```

### Timeout errors
Increase timeout:
```bash
/headless-browser-debug "open https://example.com --timeout 120000"
```

### Network errors
Check if the URL is accessible:
```bash
curl -I http://localhost:5173
```

## Advanced Usage

### Intercept Network Requests
See `references/NETWORK_INTERCEPT.md` for advanced network debugging.

### Automated Testing
See `references/AUTOMATION.md` for creating automated browser tests.

### Performance Analysis
See `references/PERFORMANCE.md` for performance metrics.

## Related Skills

- `/search-xng` - Web search and content extraction
- Use together for comprehensive web testing

---

*This skill uses Puppeteer to provide headless browser debugging capabilities for web development and testing.*
