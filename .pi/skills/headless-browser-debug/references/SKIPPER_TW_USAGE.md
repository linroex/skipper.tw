# Skipper.tw Usage Guide

This guide shows how to use the headless browser debug skill specifically for debugging the Skipper.tw website.

## Prerequisites

Make sure your development server is running:

```bash
cd /home/linroex/projects/skipper.tw
npm run dev
```

Server typically runs on `http://localhost:5173`

## Quick Debugging Commands

### Check Homepage

```bash
/headless-browser-debug "debug http://localhost:5173"
```

This will:
- Open the homepage
- Capture all console logs and errors
- Take a full-page screenshot
- Extract page content
- Show network requests

### Check Activities Page

```bash
/headless-browser-debug "debug http://localhost:5173/activities"
```

### Check Courses Page

```bash
/headless-browser-debug "debug http://localhost:5173/courses"
```

## Common Debugging Scenarios

### 1. Check for Console Errors

```bash
/headless-browser-debug "errors http://localhost:5173"
```

Look for:
- JavaScript errors
- API failures
- Missing resources
- Warning messages

### 2. Verify Data Loading

```bash
/headless-browser-debug "eval http://localhost:5173 'Array.from(document.querySelectorAll(\".activity-card\")).length'"
```

Expected output: Number of activity cards loaded (should match your JSON data)

### 3. Check Network Requests

```bash
/headless-browser-debug "network http://localhost:5173/activities"
```

Look for:
- Failed API calls
- Missing JSON files
- Slow loading resources
- 404 errors

### 4. Inspect Activity Cards

```bash
/headless-browser-debug "inspect http://localhost:5173 '.activity-card'"
```

Check:
- Card structure
- Data attributes
- Styling classes
- Content rendering

### 5. Test Mobile Responsiveness

```bash
/headless-browser-debug "screenshot http://localhost:5173 --viewport 375x667"
```

This takes a mobile-sized screenshot to check responsive design.

### 6. Check Component Rendering

```bash
/headless-browser-debug "eval http://localhost:5173 'document.querySelector(\".activity-card\") !== null'"
```

Should return `true` if components are rendering correctly.

### 7. Test Search Functionality

```bash
/headless-browser-debug "eval http://localhost:5173 'document.querySelector(\"input[type=\\\"search\\\"]\")?.value || \"no search input\"'"
```

Verify search inputs are present.

## Skipper.tw Specific Tests

### Verify Activities Data

```bash
/headless-browser-debug "eval http://localhost:5173 'fetch(\"/data/activities.json\").then(r => r.json()).then(d => d.activities.length)'"
```

### Verify Courses Data

```bash
/headless-browser-debug "eval http://localhost:5173 'fetch(\"/data/courses.json\").then(r => r.json()).then(d => d.courses.length)'"
```

### Check Region Filter

```bash
/headless-browser-debug "eval http://localhost:5173 'Array.from(document.querySelectorAll(\"select option\")).map(o => o.text.trim())'"
```

### Check Type Filter

```bash
/headless-browser-debug "eval http://localhost:5173 'Array.from(document.querySelectorAll(\"[data-type]\"))\""
```

### Verify Navigation Links

```bash
/headless-browser-debug "eval http://localhost:5173 'Array.from(document.querySelectorAll(\"nav a\")).map(a => ({text: a.textContent, href: a.href}))'"
```

## Debugging Specific Issues

### Issue: Cards Not Appearing

```bash
# 1. Check console logs
/headless-browser-debug "open http://localhost:5173"

# 2. Check for errors
/headless-browser-debug "errors http://localhost:5173"

# 3. Verify data loading
/headless-browser-debug "eval http://localhost:5173 'console.log(JSON.parse(localStorage.getItem(\"activities\")))'"

# 4. Inspect HTML structure
/headless-browser-debug "inspect http://localhost:5173 'body > div'"
```

### Issue: Styling Problems

```bash
# Take screenshot
/headless-browser-debug "screenshot http://localhost:5173"

# Check CSS classes
/headless-browser-debug "eval http://localhost:5173 'document.querySelector(\".activity-card\").className'"

# Check Tailwind classes
/headless-browser-debug "eval http://localhost:5173 'Array.from(document.querySelectorAll(\".activity-card\"))[0].classList.values()'"
```

### Issue: Navigation Not Working

```bash
# Check router
/headless-browser-debug "eval http://localhost:5173 'window.location.pathname'"

# Check Vue router
/headless-browser-debug "eval http://localhost:5173 'window.__VUE_DEVTOOLS_GLOBAL_HOOK__ ? \"Vue detected\" : \"No Vue\"'"

# Check navigation links
/headless-browser-debug "inspect http://localhost:5173 'a[href=\"/activities\"]'"
```

## Performance Testing

### Measure Page Load Time

```bash
/headless-browser-debug "eval http://localhost:5173 'performance.timing.loadEventEnd - performance.timing.navigationStart'"
```

### Count Resources

```bash
/headless-browser-debug "eval http://localhost:5173 'performance.getEntriesByType(\"resource\").length'"
```

### Check Bundle Size

```bash
/headless-browser-debug "eval http://localhost:5173 'performance.getEntriesByType(\"resource\").filter(r => r.name.includes(\"chunk\")).reduce((sum, r) => sum + r.transferSize, 0)'"
```

## Automated Testing Pattern

Create a test script in your project:

```javascript
// test-browser-debug.js
const { exec } = require('child_process');

const tests = [
    'debug http://localhost:5173',
    'debug http://localhost:5173/activities',
    'debug http://localhost:5173/courses',
    'errors http://localhost:5173',
    'network http://localhost:5173'
];

async function runTests() {
    for (const test of tests) {
        console.log(`\n🧪 Testing: ${test}`);
        await new Promise(resolve => {
            exec(`node .pi/skills/headless-browser-debug/scripts/browser-debug.js ${test}`, (err, stdout, stderr) => {
                if (err) console.error(`❌ ${test}: ${err.message}`);
                else console.log(`✅ ${test}: OK`);
                resolve();
            });
        });
    }
    console.log('\n🎉 All tests complete!');
}

runTests();
```

## Visual Regression Testing

```bash
# Take baseline screenshot
/headless-browser-debug "screenshot http://localhost:5173 --screenshot baseline-home.png"

# Take comparison screenshot
/headless-browser-debug "screenshot http://localhost:5173 --screenshot current-home.png"

# Compare (requires pixelmatch)
node -e "const pixelmatch = require('pixelmatch'); const fs = require('fs'); const img1 = fs.readFileSync('baseline.png'); const img2 = fs.readFileSync('current.png'); const { width, height } = img1; const diff = Buffer.alloc(width * height * 4); const diffPct = pixelmatch(img1, img2, diff, width, height); console.log(\`Difference: \${(diffPct * 100).toFixed(2)}%\`);"
```

## Debug Workflow Example

```bash
# 1. Start dev server
npm run dev

# 2. Open homepage with full debug
/headless-browser-debug "debug http://localhost:5173"

# 3. Check for errors
/headless-browser-debug "errors http://localhost:5173"

# 4. Verify navigation
/headless-browser-debug "inspect http://localhost:5173 'nav a'"

# 5. Check activities page
/headless-browser-debug "debug http://localhost:5173/activities"

# 6. Inspect cards
/headless-browser-debug "inspect http://localhost:5173 '.activity-card'"

# 7. Take mobile screenshot
/headless-browser-debug "screenshot http://localhost:5173 --viewport 375x667"

# 8. Check network
/headless-browser-debug "network http://localhost:5173/activities"

# 9. Verify data
/headless-browser-debug "eval http://localhost:5173 'Array.from(document.querySelectorAll(\".activity-card\")).length'"

# 10. Check console logs
/headless-browser-debug "open http://localhost:5173"
```

## Integration with CI

Add browser debugging to your CI pipeline:

```yaml
- name: Debug Build
  run: |
    npm run dev &
    sleep 5
    
    # Run browser checks
    node .pi/skills/headless-browser-debug/scripts/web-check.js http://localhost:5173 check
    node .pi/skills/headless-browser-debug/scripts/web-check.js http://localhost:5173 errors
    
    # Kill dev server
    pkill -f "vite"
```

## Troubleshooting Skipper.tw

### Issue: JSON Files Not Loading

```bash
# Check if files exist
curl http://localhost:5173/data/activities.json

# Check browser console
/headless-browser-debug "open http://localhost:5173"

# Look for CORS errors
/headless-browser-debug "errors http://localhost:5173"
```

### Issue: Vue Router Not Working

```bash
# Check current route
/headless-browser-debug "eval http://localhost:5173 'window.location.pathname'"

# Check router history mode
/headless-browser-debug "eval http://localhost:5173 'document.querySelector(\"link[rel=\\\"canonical\\\"]\")?.href || window.location.href'"
```

### Issue: Tailwind Not Applied

```bash
# Check if Tailwind classes exist
/headless-browser-debug "eval http://localhost:5173 'document.querySelector(\".activity-card\").className'"

# Check Tailwind CSS loaded
/headless-browser-debug "eval http://localhost:5173 'Array.from(document.styleSheets).some(s => s.href?.includes(\"tailwind\"))'"
```

---

*This guide helps you debug Skipper.tw using the headless browser debugging skill. For general debugging, see [ADVANCED_USAGE.md](ADVANCED_USAGE.md)*
