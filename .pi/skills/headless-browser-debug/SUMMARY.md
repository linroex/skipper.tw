# Headless Browser Debug Skill - Summary

## What Was Created

This skill provides **Headless Chrome browser debugging** capabilities for your web development workflow.

## Files Created

### Main Files
```
.pi/skills/headless-browser-debug/
├── SKILL.md                 # Skill definition (what you're reading)
├── README.md                # Main documentation
├── SUMMARY.md               # This file
├── package.json             # NPM configuration
├── scripts/
│   ├── browser-debug.js     # Main debugging script (15KB)
│   ├── web-check.js         # Fallback HTTP checking (7KB)
│   └── test-debug.js        # Test verification (4.5KB)
└── references/
    ├── ADVANCED_USAGE.md    # Advanced features (8KB)
    ├── QUICK_REFERENCE.md   # Quick command reference (5KB)
    ├── DEPENDENCIES.md      # Setup instructions (7KB)
    ├── SKIPPER_TW_USAGE.md  # Skipper.tw guide (9KB)
    └── TROUBLESHOOTING.md   # Common issues
```

## Key Features

### ✅ What You Can Do

1. **Full Page Debugging**
   ```bash
   /headless-browser-debug "debug http://localhost:5173"
   ```

2. **Error Detection**
   ```bash
   /headless-browser-debug "errors http://localhost:5173"
   ```

3. **Screenshot Capture**
   ```bash
   /headless-browser-debug "screenshot http://localhost:5173"
   ```

4. **Network Monitoring**
   ```bash
   /headless-browser-debug "network http://localhost:5173"
   ```

5. **JavaScript Evaluation**
   ```bash
   /headless-browser-debug "eval http://localhost:5173 'document.title'"
   ```

6. **Element Inspection**
   ```bash
   /headless-browser-debug "inspect http://localhost:5173 '.activity-card'"
   ```

### 📊 What It Captures

- Console logs (log, info, warn, error)
- JavaScript errors
- Network requests and responses
- Page load times
- Screenshot images
- Page content and structure
- DOM element details

## Setup Required

### Option 1: Full Features (Recommended)

```bash
# Install Puppeteer
npm install puppeteer

# Install Chromium
npx puppeteer browsers install chrome

# Install system dependencies (if on Linux)
apt-get update && apt-get install -y \
    libatk-1.0-0 libatk-bridge2.0-0 libcups2 \
    libdrm2 libgbm1 libxkbcommon0 libxcomposite1 \
    libxdamage1 libxext6 libxfixes3 libxrandr2 \
    libpango-1.0-0 libcairo2 libasound2 libatspi2.0-0

# Test
node .pi/skills/headless-browser-debug/scripts/test-debug.js
```

### Option 2: Quick Mode (No Browser)

```bash
# Basic checks without browser
node .pi/skills/headless-browser-debug/scripts/web-check.js http://localhost:5173 check
```

## How to Use

### For Your Skipper.tw Project

```bash
# Debug homepage
/headless-browser-debug "debug http://localhost:5173"

# Check for errors
/headless-browser-debug "errors http://localhost:5173"

# Take screenshot
/headless-browser-debug "screenshot http://localhost:5173"

# Check activities page
/headless-browser-debug "debug http://localhost:5173/activities"

# Inspect cards
/headless-browser-debug "inspect http://localhost:5173 '.activity-card'"

# Count activities
/headless-browser-debug "eval http://localhost:5173 'document.querySelectorAll(\".activity-card\").length'"
```

### Full Debug Command

```bash
/headless-browser-debug "debug http://localhost:5173"
```

This will:
1. Open the page in headless Chrome
2. Capture all console logs
3. Detect JavaScript errors
4. Monitor network requests
5. Take a full-page screenshot
6. Extract page content
7. Display comprehensive report

### Advanced Options

```bash
# Custom timeout
/headless-browser-debug "debug http://localhost:5173 --timeout 60000"

# Mobile viewport
/headless-browser-debug "screenshot http://localhost:5173 --viewport 375x667"

# Wait for element
/headless-browser-debug "debug http://localhost:5173 --wait .loaded"

# Headful mode (visible browser)
/headless-browser-debug "debug http://localhost:5173 --headful"
```

## What Happens When You Run It

When you use `/headless-browser-debug`, the skill:

1. **Parses your command** to extract URL and action
2. **Launches Puppeteer browser** (headless or headful)
3. **Attaches event listeners** for console, errors, network
4. **Navigates to your page**
5. **Monitors activity** while page loads
6. **Captures data**: logs, errors, network, screenshots
7. **Closes browser** and returns report

## Output Examples

### Debug Report
```
🚀 Starting Headless Browser Debug
====================================================
📍 URL: http://localhost:5173
📍 Mode: Headless

🌐 Navigating to http://localhost:5173...
📸 Screenshot saved to: ./debug-screenshot.png

==================================================
📊 DEBUG REPORT
==================================================

📄 Page Information:
   Title: Skipper.tw - 台灣帆船活動與課程資訊

📝 Console Logs (5 total):
   ✓ No errors or warnings

❌ Page Errors: 0
   ✓ No page errors

🌐 Network Requests (12 total):
   ✅ All requests successful

🔗 Links found: 15
```

### Error Report
```
🔍 Checking for errors in http://localhost:5173...

❌ Found 2 error(s):
   1. Cannot read property 'map' of undefined
   2. Failed to load resource: net::ERR_FAILED
```

### Content Report
```
📄 Extracting content from http://localhost:5173...

Title: Skipper.tw - 台灣帆船活動與課程資訊

Text content (first 500 chars):
  台灣帆船活動與課程資訊
  查找台灣各地的帆船活動、課程、競賽資訊...

Headings:
   h1: 台灣帆船活動與課程資訊
   h2: 即將開始的活動
   h2: 熱門課程
```

## Testing the Skill

### 1. Test Installation

```bash
cd .pi/skills/headless-browser-debug
node scripts/test-debug.js
```

Should show:
```
🧪 Testing Headless Browser Debug Skill
✅ All tests passed successfully!
```

### 2. Test Quick Mode

```bash
node scripts/web-check.js http://example.com check
```

Should show:
```
🌐 Checking http://example.com...
✅ Status: 200 OK
📄 Content-Type: text/html
...
```

### 3. Test Full Debug

```bash
node scripts/browser-debug.js debug http://localhost:5173
```

Should show full debug report.

## Integration with Your Workflow

### Development
```bash
# Start dev server
npm run dev

# Debug in another terminal
/headless-browser-debug "debug http://localhost:5173"
```

### CI/CD
```yaml
- name: Browser Debug
  run: |
    npm run dev &
    sleep 5
    node scripts/web-check.js http://localhost:5173 check
    pkill -f vite
```

### Manual Testing
```bash
# Check before deploy
/headless-browser-debug "debug http://your-site.com"
/headless-browser-debug "errors http://your-site.com"
/headless-browser-debug "screenshot http://your-site.com"
```

## Performance

### Speed
- **Quick mode**: ~1-2 seconds
- **Full mode**: ~3-10 seconds
- **Screenshot**: ~1-2 seconds

### Resource Usage
- **Memory**: ~50-200 MB
- **CPU**: ~10-50% while running
- **Disk**: ~200 MB for Chromium

## Security Notes

⚠️ **Important:**
- Never use with untrusted URLs
- Be careful with authentication cookies
- Don't expose sensitive data in logs
- Validate URLs before opening
- Use proper authentication if needed

## Next Steps

### 1. Install Dependencies

```bash
npm install puppeteer
npx puppeteer browsers install chrome
```

### 2. Test It

```bash
node scripts/test-debug.js
```

### 3. Start Using

```bash
/headless-browser-debug "debug http://localhost:5173"
```

### 4. Read Documentation

- [README.md](README.md) - Main documentation
- [QUICK_REFERENCE.md](references/QUICK_REFERENCE.md) - Quick commands
- [ADVANCED_USAGE.md](references/ADVANCED_USAGE.md) - Advanced features
- [SKIPPER_TW_USAGE.md](references/SKIPPER_TW_USAGE.md) - Skipper.tw guide
- [DEPENDENCIES.md](references/DEPENDENCIES.md) - Setup instructions

## Tips

### For Better Results

1. **Use full debug first** to see all issues
2. **Check errors separately** with `errors` command
3. **Take screenshots** for visual verification
4. **Inspect elements** to debug layout issues
5. **Monitor network** to find failed requests
6. **Use mobile viewport** to test responsiveness

### For Fast Debugging

1. **Start with errors check** if you suspect problems
2. **Use quick mode** for simple checks
3. **Set appropriate timeouts** for slow pages
4. **Reuse browser** for multiple checks
5. **Close browser properly** to free resources

### For Production

1. **Use web-check mode** if Chromium not available
2. **Set timeouts** appropriately
3. **Handle errors gracefully**
4. **Log important actions**
5. **Clean up screenshots**

## Support

### Common Issues

1. **"Browser not found"** - Install Chromium
2. **"Permission denied"** - Run with sudo or install as root
3. **"Timeout"** - Increase timeout value
4. **"Network error"** - Check server is running
5. **"No output"** - Check if URL is accessible

### Getting Help

See [TROUBLESHOOTING.md](references/TROUBLESHOOTING.md) or check:
- Puppeteer docs: https://pptr.dev
- Puppeteer GitHub: https://github.com/puppeteer/puppeteer

## License

MIT License - Free to use for personal and commercial projects.

---

**Created**: 2026-06-10  
**Version**: 1.0.0  
**Dependencies**: Puppeteer  
**Compatible**: Node.js 16+, Chrome/Chromium
