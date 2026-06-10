# Troubleshooting Guide

Common issues and solutions for the headless browser debug skill.

## Installation Issues

### "Browser not found" Error

```
Failed to launch the browser process: Code: 127
```

**Solution:**

```bash
# Install Chromium
npx puppeteer browsers install chrome

# Or use system Chrome
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome
```

### Missing Shared Libraries

```
chrome: error while loading shared libraries: libatk-1.0.so.0: cannot open shared object file
```

**Solution (Debian/Ubuntu):**

```bash
apt-get update && apt-get install -y \
    libatk-1.0-0 libatk-bridge2.0-0 libcups2 \
    libdrm2 libgbm1 libxkbcommon0 libxcomposite1 \
    libxdamage1 libxext6 libxfixes3 libxrandr2 \
    libpango-1.0-0 libcairo2 libasound2 libatspi2.0-0
```

**Solution (Alpine/Docker):**

```dockerfile
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont
```

### Permission Denied

```
Permission denied: Cannot write to directory
```

**Solution:**

```bash
# Run as root (temporarily)
sudo node scripts/browser-debug.js debug http://localhost:5173

# Or fix permissions
sudo chown -R $USER:$USER .pi/skills/headless-browser-debug
```

## Runtime Issues

### Timeout Error

```
TimeoutError: Navigation timeout of 30000 ms exceeded
```

**Solution:**

```bash
# Increase timeout
/headless-browser-debug "debug http://localhost:5173 --timeout 120000"

# Or wait for specific element
/headless-browser-debug "debug http://localhost:5173 --wait .loaded"
```

### Network Error

```
Error: net::ERR_CONNECTION_REFUSED
```

**Solution:**

```bash
# Check if server is running
curl http://localhost:5173

# Start dev server
npm run dev

# Verify port
lsof -i :5173
```

### Chromium Crash

```
Process exited with code 0
```

**Solution:**

```bash
# Try headful mode to see what's happening
/headless-browser-debug "debug http://localhost:5173 --headful"

# Disable GPU acceleration
export CHROMIUM_ARGS="--disable-gpu"

# Use different chromium args
export CHROMIUM_ARGS="--no-sandbox,--disable-setuid-sandbox,--disable-dev-shm-usage"
```

## Usage Issues

### No Output from Debug

**Possible Causes:**
1. URL is not accessible
2. Page is not loading
3. Browser crashed silently

**Solution:**

```bash
# Test with a known working URL
/headless-browser-debug "debug http://example.com"

# Check if URL is correct
echo $URL

# Try web-check mode (no browser)
node scripts/web-check.js http://localhost:5173 check
```

### Screenshot Not Created

```bash
# Check permissions
ls -la | grep debug-screenshot

# Try custom path
/headless-browser-debug "screenshot http://localhost:5173 --screenshot /tmp/test.png"

# Check disk space
df -h
```

### Element Not Found

```
No element found matching selector: '.card'
```

**Solution:**

```bash
# Check if element exists
/headless-browser-debug "eval http://localhost:5173 'document.querySelector(\".card\")'"

# Try different selector
/headless-browser-debug "inspect http://localhost:5173 '*'"

# Wait for element to load
/headless-browser-debug "debug http://localhost:5173 --wait .card"
```

## Performance Issues

### Slow Debug

```
Debug took 30+ seconds
```

**Solution:**

```bash
# Use quick mode
/headless-browser-debug "open http://localhost:5173"

# Reduce network capture
# (Edit scripts/browser-debug.js to limit requests)

# Use web-check mode for basic checks
node scripts/web-check.js http://localhost:5173 check
```

### High Memory Usage

```
JavaScript heap out of memory
```

**Solution:**

```bash
# Increase Node memory limit
export NODE_OPTIONS="--max-old-space-size=4096"

# Or use web-check mode
node scripts/web-check.js http://localhost:5173 check
```

## Environment-Specific Issues

### Docker

**Issue:** Chromium can't find display

```bash
# Add to Dockerfile
RUN apt-get update && apt-get install -y \
    fonts-liberation \
    libasound2 \
    libatk-1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdbus-1-3 \
    libx11-6 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxss1 \
    libxtst6 \
    ca-certificates \
    fonts-liberation \
    libappindicator3-1 \
    libnss3 \
    lsb-release

# Set environment variables
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
```

### CI/CD (GitHub Actions)

```yaml
- name: Install dependencies
  run: |
    apt-get update
    apt-get install -y \
      libatk-1.0-0 libatk-bridge2.0-0 libcups2 \
      libx11-6 libxcomposite1 libxcursor1 libxdamage1 \
      libxext6 libxi6 libxtst6 libnss3 libc6 \
      libasound2 libpango-1.0-0 libcairo2

    npm install

    npx puppeteer browsers install chrome
```

### macOS

**Issue:** Gatekeeper blocks Chrome

```bash
# Remove quarantine attribute
sudo xattr -rd com.apple.quarantine /Applications/Google\ Chrome.app

# Or use Chromium
brew install --cask chromium
export PUPPETEER_EXECUTABLE_PATH=$(which chromium)
```

## Debug Mode

### Enable Verbose Logging

```javascript
// In scripts/browser-debug.js, add:
console.log('DEBUG:', 'Message');
```

### Check Browser Version

```bash
# Check Puppeteer version
npm list puppeteer

# Check Chromium version
npx puppeteer browsers info
```

### Test Browser Launch

```bash
# Test basic browser launch
node -e "const puppeteer = require('puppeteer'); (async () => { const b = await puppeteer.launch(); await b.close(); console.log('OK'); })();"
```

## Common Error Messages

### "Failed to launch"

```
Error: Failed to launch the browser process!
```

**Solutions:**
1. Check if Chromium is installed
2. Check if system libraries are installed
3. Try headful mode to see error details
4. Check Chromium version compatibility

### "Protocol error"

```
Protocol error (Page.navigate): Target page, context or browser has been closed
```

**Solution:**
```bash
# Close all browser instances
pkill -f chrome
pkill -f chromium

# Try again
/headless-browser-debug "debug http://localhost:5173"
```

### "Connection refused"

```
Error: connect ECONNREFUSED 127.0.0.1:9222
```

**Solution:**
```bash
# Check if DevTools protocol is available
curl http://localhost:9222/json

# Start Chrome with debug port
google-chrome --remote-debugging-port=9222

# Connect to existing browser
export PUPPETEER_WS_ENDPOINT=http://localhost:9222
```

## Verification Steps

### Step 1: Check Node Installation

```bash
node --version
npm --version
```

### Step 2: Check Puppeteer Installation

```bash
npm list puppeteer
```

### Step 3: Check Chromium Installation

```bash
npx puppeteer browsers info
```

### Step 4: Check System Libraries

```bash
ldconfig -p | grep -E "libatk|libgtk|libgdk"
```

### Step 5: Test Basic Functionality

```bash
node scripts/web-check.js http://example.com check
```

### Step 6: Test Full Browser

```bash
node scripts/browser-debug.js debug http://example.com
```

## Getting Help

### Check Logs

```bash
# Enable debug logging
export DEBUG=headless-browser-debug

# Run debug
/headless-browser-debug "debug http://localhost:5173"
```

### Check Documentation

```bash
cat README.md
cat references/DEPENDENCIES.md
cat references/SKIPPER_TW_USAGE.md
```

### Check Online Resources

- Puppeteer docs: https://pptr.dev
- Puppeteer GitHub: https://github.com/puppeteer/puppeteer
- Puppeteer troubleshooting: https://pptr.dev/troubleshooting

## Quick Fixes

### One-Liner Fixes

```bash
# Install everything
apt-get update && apt-get install -y libatk-1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 libgbm1 libxkbcommon0 libxcomposite1 libxdamage1 libxext6 libxfixes3 libxrandr2 libpango-1.0-0 libcairo2 libasound2 libatspi2.0-0 && npx puppeteer browsers install chrome

# Kill stuck browsers
pkill -f chrome && pkill -f chromium

# Clear Puppeteer cache
rm -rf ~/.cache/puppeteer && npx puppeteer browsers install chrome

# Test everything
node scripts/test-debug.js
```

### Environment Reset

```bash
# Clear all Puppeteer settings
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=
export PUPPETEER_EXECUTABLE_PATH=
export CHROMIUM_ARGS=

# Reinstall
rm -rf node_modules/puppeteer
npm install puppeteer
npx puppeteer browsers install chrome
```

## Best Practices

### To Avoid Issues

1. **Always install Chromium** before using
2. **Check system dependencies** on Linux
3. **Use appropriate timeouts** for slow pages
4. **Close browser properly** to free resources
5. **Clear cache** if issues persist
6. **Update Puppeteer** regularly
7. **Test in headful mode** if browser crashes
8. **Use web-check mode** if browser not available

### To Debug Issues

1. **Read error message** carefully
2. **Check documentation** for solution
3. **Test with example URL** (example.com)
4. **Enable verbose logging**
5. **Try headful mode**
6. **Check environment variables**
7. **Verify all dependencies**
8. **Search online resources**

---

*If you can't find a solution, try the web-check mode or contact support.*
