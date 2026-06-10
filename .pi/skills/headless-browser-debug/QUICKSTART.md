# Quick Start Guide

## Setup (One Time Only)

### Step 1: Install Dependencies

```bash
npm install puppeteer
```

### Step 2: Install Chromium

```bash
npx puppeteer browsers install chrome
```

### Step 3: Install System Libraries (Linux only)

```bash
apt-get update && apt-get install -y \
    libatk-1.0-0 libatk-bridge2.0-0 libcups2 \
    libdrm2 libgbm1 libxkbcommon0 libxcomposite1 \
    libxdamage1 libxext6 libxfixes3 libxrandr2 \
    libpango-1.0-0 libcairo2 libasound2 libatspi2.0-0
```

### Step 4: Verify Installation

```bash
node .pi/skills/headless-browser-debug/scripts/test-debug.js
```

You should see:
```
🧪 Testing Headless Browser Debug Skill
✅ Browser launched successfully
...
🎉 All tests passed successfully!
```

## Start Using

### Start Your Dev Server

```bash
cd /home/linroex/projects/skipper.tw
npm run dev
```

### Debug Your Website

```bash
/headless-browser-debug "debug http://localhost:5173"
```

### Check for Errors

```bash
/headless-browser-debug "errors http://localhost:5173"
```

### Take Screenshot

```bash
/headless-browser-debug "screenshot http://localhost:5173"
```

## Quick Commands

| Command | What It Does |
|---------|--------------|
| `debug <url>` | Full debug report |
| `errors <url>` | Check for errors |
| `screenshot <url>` | Take screenshot |
| `content <url>` | Extract page content |
| `network <url>` | Monitor network |
| `inspect <url> '.selector'` | Inspect elements |
| `eval <url> 'js'` | Run JavaScript |

## Skipper.tw Specific

```bash
# Debug homepage
/headless-browser-debug "debug http://localhost:5173"

# Check activities page
/headless-browser-debug "debug http://localhost:5173/activities"

# Check courses page
/headless-browser-debug "debug http://localhost:5173/courses"

# Inspect activity cards
/headless-browser-debug "inspect http://localhost:5173 '.activity-card'"

# Count activities
/headless-browser-debug "eval http://localhost:5173 'document.querySelectorAll(\".activity-card\").length'"

# Test mobile view
/headless-browser-debug "screenshot http://localhost:5173 --viewport 375x667"
```

## No Browser? Use Fallback Mode

If you can't install Chromium:

```bash
node .pi/skills/headless-browser-debug/scripts/web-check.js http://localhost:5173 check
node .pi/skills/headless-browser-debug/scripts/web-check.js http://localhost:5173 errors
node .pi/skills/headless-browser-debug/scripts/web-check.js http://localhost:5173 content
```

## What You Get

### Full Debug Report

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

📝 Console Logs: 0 total
   ✓ No errors or warnings

❌ Page Errors: 0
   ✓ No page errors

🌐 Network Requests: 12 total
   ✅ All requests successful

🔗 Links found: 15

==================================================
✅ Debug complete!
==================================================
```

### Error Report

```
🔍 Checking for errors in http://localhost:5173...

❌ Found 2 error(s):
   1. Cannot read property 'map' of undefined
   2. Failed to load resource: net::ERR_FAILED
```

### Screenshot

```
📸 Taking screenshot...
✅ Screenshot saved to: debug-screenshot.png
```

## Next Steps

1. ✅ **Run your first debug**
   ```bash
   /headless-browser-debug "debug http://localhost:5173"
   ```

2. ✅ **Check for errors**
   ```bash
   /headless-browser-debug "errors http://localhost:5173"
   ```

3. ✅ **Take a screenshot**
   ```bash
   /headless-browser-debug "screenshot http://localhost:5173"
   ```

4. ✅ **Inspect elements**
   ```bash
   /headless-browser-debug "inspect http://localhost:5173 '.activity-card'"
   ```

5. ✅ **Read more** - Check other documentation files:
   - [README.md](README.md) - Full documentation
   - [QUICK_REFERENCE.md](references/QUICK_REFERENCE.md) - All commands
   - [ADVANCED_USAGE.md](references/ADVANCED_USAGE.md) - Advanced features
   - [SKIPPER_TW_USAGE.md](references/SKIPPER_TW_USAGE.md) - Skipper.tw guide

## Tips

### For Faster Debugging

1. **Start with errors check** - Fastest way to find problems
2. **Use mobile viewport** - Test responsive design
3. **Check network** - Find failed requests
4. **Inspect elements** - Debug layout issues

### For Better Results

1. **Run full debug first** - See everything at once
2. **Take screenshots** - Visual verification
3. **Check console** - See all logs
4. **Use appropriate timeouts** - For slow pages

### Common Issues

| Issue | Solution |
|-------|----------|
| "Browser not found" | `npx puppeteer browsers install chrome` |
| "Permission denied" | Run with `sudo` or install as root |
| "Timeout" | Use `--timeout 120000` |
| "No output" | Check if URL is accessible |

## Help

Need help? Check:
- [README.md](README.md)
- [TROUBLESHOOTING.md](references/TROUBLESHOOTING.md)
- [SKIPPER_TW_USAGE.md](references/SKIPPER_TW_USAGE.md)

---

**Ready to start debugging! 🎉**

Use `/headless-browser-debug` to debug your website.
