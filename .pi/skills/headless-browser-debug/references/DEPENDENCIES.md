# Dependencies & Setup Guide

## System Requirements

### Option 1: Full Puppeteer (Recommended for Development)

**Requires:**
- Node.js 16+
- NPM 7+
- Chromium (auto-installed by Puppeteer)
- System libraries for Chromium

#### Debian/Ubuntu

```bash
# Install system dependencies
apt-get update && apt-get install -y \
    libatk-1.0-0 \
    libatk-bridge2.0-0 \
    libcups2 \
    libdbus-1-3 \
    libdrm2 \
    libgbm1 \
    libxkbcommon0 \
    libxcomposite1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxrandr2 \
    libpango-1.0-0 \
    libcairo2 \
    libasound2 \
    libatspi2.0-0

# Install Node.js dependencies
npm install puppeteer

# Install Chromium
npx puppeteer browsers install chrome
```

#### macOS

```bash
# Chrome is already installed on most macOS systems
# Install Node.js dependencies only
npm install puppeteer

# Chromium should be auto-downloaded
npx puppeteer browsers install chrome
```

#### Docker

```dockerfile
FROM node:18-alpine

# Install dependencies
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont

# Set Puppeteer to use system Chrome
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Install NPM dependencies
COPY package*.json ./
RUN npm install
```

### Option 2: Web Check Mode (No Browser Required)

If you can't install Chromium, use the web-check script which only requires:

**Requires:**
- Node.js 14+
- No additional dependencies

**Usage:**
```bash
node scripts/web-check.js http://localhost:5173 check
node scripts/web-check.js http://localhost:5173 errors
node scripts/web-check.js http://localhost:5173 content
```

**Features:**
- ✅ HTTP response checking
- ✅ Content extraction
- ✅ Error detection
- ✅ Link analysis
- ❌ No JavaScript execution
- ❌ No screenshots
- ❌ No interactive debugging

## Installation Commands

### Quick Setup

```bash
# 1. Navigate to skill directory
cd .pi/skills/headless-browser-debug

# 2. Install dependencies
npm install

# 3. Install Chromium
npx puppeteer browsers install chrome

# 4. Test installation
node scripts/test-debug.js
```

### Skip Chromium Installation

```bash
# Install Puppeteer without Chromium
npm install puppeteer
export PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Use system Chrome if available
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome

# Or use web-check mode
node scripts/web-check.js http://localhost:5173 check
```

## Verification

### Test Full Puppeteer Setup

```bash
cd .pi/skills/headless-browser-debug
node scripts/test-debug.js
```

Expected output:
```
🧪 Testing Headless Browser Debug Skill
Test 1: Launching browser...
✅ Browser launched successfully
...
🎉 All tests passed successfully!
```

### Test Web Check Mode

```bash
node scripts/web-check.js http://example.com check
```

Expected output:
```
🌐 Checking http://example.com...
==================================================
✅ Status: 200 OK
📄 Content-Type: text/html
...
✅ Check complete!
```

## Environment Setup

### .env file (Optional)

Create `.env` in the skill directory:

```bash
# Puppeteer Configuration
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=false
PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome

# Custom Browser Settings
CHROMIUM_ARGS=--no-sandbox,--disable-setuid-sandbox,--disable-dev-shm-usage

# Debug Settings
DEBUG_HEADLESS=true
```

### CI/CD Environment

For GitHub Actions or other CI:

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

## Alternative: Browserless

For cloud deployments, consider using [Browserless](https://www.browserless.io/):

```bash
# Install puppeteer
npm install puppeteer

# Use Browserless endpoint
const browser = await puppeteer.connect({
    browserWSEndpoint: 'wss://your-browserless-endpoint'
});
```

## Troubleshooting

### Error: "Failed to launch"

```bash
# Install missing libraries
apt-get update && apt-get install -y libnss3 libglib2.0-0

# Or use Chrome from system
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome
```

### Error: "Permission denied"

```bash
# Run as root or with sudo
sudo apt-get install <packages>

# Or add user to required groups
usermod -aG video $USER
usermod -aG docker $USER
```

### Error: "Chromium not found"

```bash
# Reinstall Chromium
npx puppeteer browsers install chrome

# Or specify path
export PUPPETEER_EXECUTABLE_PATH=/path/to/chrome
```

### Docker-specific Issues

```dockerfile
# Add these to your Dockerfile
RUN apt-get update && apt-get install -y \
    fonts-liberation \
    libappindicator3-1 \
    libasound2 \
    libatk-1.0-0 \
    libatk-bridge2.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libnss3 \
    libpango-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    lsb-release \
    wget
```

## Performance Tips

### Optimize Puppeteer Launch

```javascript
const browser = await puppeteer.launch({
    headless: true,
    args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
    ]
});
```

### Reuse Browser Instance

```javascript
// Create browser once
const browser = await puppeteer.launch({...});

// Use for multiple requests
const page1 = await browser.newPage();
const page2 = await browser.newPage();

// Close when done
await browser.close();
```

### Memory Optimization

```javascript
const browser = await puppeteer.launch({
    headless: true,
    args: [
        '--disable-dev-shm-usage',
        '--disable-background-networking',
        '--disable-default-apps',
        '--disable-extensions'
    ]
});
```

## Dependencies Summary

| Package | Purpose | Required |
|---------|---------|----------|
| `puppeteer` | Headless browser automation | Yes |
| `chromium` | Chrome browser binary (optional) | For full features |
| `system-libs` | Chrome runtime libraries | For full features |

| Script | Purpose | Dependencies |
|--------|---------|--------------|
| `browser-debug.js` | Full debugging | Puppeteer + Chromium |
| `web-check.js` | Basic checking | Node.js only |
| `test-debug.js` | Verification | Puppeteer + Chromium |

---

*Choose the setup that works best for your environment. For production deployments, consider Browserless or Puppeteer's headless shell mode.*
