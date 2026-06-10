# Headless Browser Debug Skill

> Debug websites using Headless Chrome browser powered by Puppeteer

## Overview

This skill provides comprehensive debugging capabilities for web development using a headless Chrome browser. It allows you to:

- 🔍 **Capture Console Logs** - See all console messages, errors, and warnings
- 📸 **Take Screenshots** - Full-page or element screenshots
- 🌐 **Monitor Network** - Track all HTTP requests and responses
- 📄 **Extract Content** - Get page title, text, and structure
- ⚙️ **Run JavaScript** - Execute arbitrary JavaScript in browser context
- 🔎 **Inspect Elements** - Find and analyze DOM elements
- ❌ **Detect Errors** - Catch JavaScript errors and warnings
- 📊 **Performance Metrics** - Measure load times and resource usage

## Quick Start

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

## Installation

### Full Features (Required for Complete Debugging)

```bash
# Install Puppeteer
npm install puppeteer

# Install Chromium
npx puppeteer browsers install chrome

# Install system dependencies (Debian/Ubuntu)
apt-get update && apt-get install -y \
    libatk-1.0-0 libatk-bridge2.0-0 libcups2 \
    libdrm2 libgbm1 libxkbcommon0 libxcomposite1 \
    libxdamage1 libxext6 libxfixes3 libxrandr2 \
    libpango-1.0-0 libcairo2 libasound2 libatspi2.0-0

# Test installation
node scripts/test-debug.js
```

### Quick Mode (No Browser Required)

```bash
# Basic checks without browser
node scripts/web-check.js http://localhost:5173 check
node scripts/web-check.js http://localhost:5173 errors
node scripts/web-check.js http://localhost:5173 content
```

See [DEPENDENCIES.md](references/DEPENDENCIES.md) for detailed setup instructions.

## Usage

### Basic Commands

| Command | Description |
|---------|-------------|
| `debug <url>` | Full debugging report |
| `open <url>` | Open page with basic logs |
| `screenshot <url>` | Take full-page screenshot |
| `content <url>` | Extract page content |
| `errors <url>` | Show only errors |
| `network <url>` | Show network activity |
| `eval <url> 'js'` | Evaluate JavaScript |
| `inspect <url> 'selector'` | Inspect elements |

### Options

| Option | Description |
|--------|-------------|
| `--timeout ms` | Set timeout (ms) |
| `--headful` | Open visible browser |
| `--viewport WxH` | Set viewport size |
| `--screenshot path` | Custom screenshot path |
| `--wait selector` | Wait for element |

### Examples

```bash
# Debug homepage with full report
/headless-browser-debug "debug http://localhost:5173"

# Check for errors only
/headless-browser-debug "errors http://localhost:5173"

# Take screenshot with mobile viewport
/headless-browser-debug "screenshot http://localhost:5173 --viewport 375x667"

# Wait for element to load
/headless-browser-debug "debug http://localhost:5173 --wait .loaded"

# Check network activity
/headless-browser-debug "network http://localhost:5173/activities"

# Inspect activity cards
/headless-browser-debug "inspect http://localhost:5173 '.activity-card'"

# Get page title
/headless-browser-debug "eval http://localhost:5173 'document.title'"

# Long timeout for slow pages
/headless-browser-debug "debug http://localhost:5173 --timeout 120000"
```

## Skipper.tw Integration

### Debug Your Site

```bash
# Debug homepage
/headless-browser-debug "debug http://localhost:5173"

# Check activities page
/headless-browser-debug "debug http://localhost:5173/activities"

# Check courses page
/headless-browser-debug "debug http://localhost:5173/courses"

# Inspect activity cards
/headless-browser-debug "inspect http://localhost:5173 '.activity-card'"

# Count loaded activities
/headless-browser-debug "eval http://localhost:5173 'document.querySelectorAll(\".activity-card\").length'"

# Test mobile view
/headless-browser-debug "screenshot http://localhost:5173 --viewport 375x667"
```

See [SKIPPER_TW_USAGE.md](references/SKIPPER_TW_USAGE.md) for Skipper.tw specific debugging guide.

## Features

### Console Logging
- ✅ Capture all console logs (log, info, warn, error)
- ✅ Filter by log type
- ✅ Show source location
- ✅ Count logs by type

### Error Detection
- ✅ JavaScript exceptions
- ✅ Page errors
- ✅ Console warnings
- ✅ Uncaught errors

### Network Monitoring
- ✅ Track all HTTP requests
- ✅ Monitor response codes
- ✅ Capture timing information
- ✅ Detect failed requests
- ✅ Show request sizes

### Screenshot Capture
- ✅ Full-page screenshots
- ✅ Custom viewport sizes
- ✅ Element-specific screenshots
- ✅ High DPI support
- ✅ PDF generation

### Content Extraction
- ✅ Page title
- ✅ Meta descriptions
- ✅ All headings
- ✅ Link analysis
- ✅ Body text preview

### JavaScript Evaluation
- ✅ Execute arbitrary JS
- ✅ Get page state
- ✅ Test functionality
- ✅ Access DOM
- ✅ Make API calls

### Element Inspection
- ✅ CSS selector matching
- ✅ Attribute extraction
- ✅ Class analysis
- ✅ Text content
- ✅ Element hierarchy

## File Structure

```
headless-browser-debug/
├── SKILL.md                 # Main skill documentation
├── README.md                # This file
├── package.json             # NPM configuration
├── scripts/
│   ├── browser-debug.js     # Main debugging script
│   ├── web-check.js         # HTTP-based checking (no browser)
│   └── test-debug.js        # Test script
└── references/
    ├── ADVANCED_USAGE.md    # Advanced features
    ├── QUICK_REFERENCE.md   # Quick command reference
    ├── DEPENDENCIES.md      # Dependencies & setup
    └── SKIPPER_TW_USAGE.md  # Skipper.tw specific guide
```

## Architecture

### browser-debug.js
Main script using Puppeteer for full browser debugging:
- Launches headless Chrome
- Captures all browser events
- Generates comprehensive reports
- Takes screenshots

### web-check.js
Lightweight HTTP-based checking:
- No browser required
- Basic page analysis
- Content extraction
- Error detection

### test-debug.js
Verification script:
- Tests browser launch
- Validates functionality
- Checks all features

## Configuration

### Environment Variables

```bash
# Skip Chromium download
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true

# Use system Chrome
PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome

# Custom Chrome args
CHROMIUM_ARGS=--no-sandbox,--disable-setuid-sandbox
```

### Custom Settings

Edit `scripts/browser-debug.js`:
- Default timeout
- Screenshot directory
- Log verbosity
- Network capture depth

## Testing

```bash
# Test installation
node scripts/test-debug.js

# Test basic checks
node scripts/web-check.js http://example.com check

# Debug a page
node scripts/browser-debug.js debug http://localhost:5173
```

## Troubleshooting

### "Browser not found"

```bash
# Install Chromium
npx puppeteer browsers install chrome

# Or use system Chrome
export PUPPETEER_EXECUTABLE_PATH=/usr/bin/google-chrome
```

### "Permission denied"

```bash
# Install with sudo
sudo apt-get install <packages>

# Or run as root
sudo node scripts/browser-debug.js debug http://localhost:5173
```

### Timeout errors

```bash
# Increase timeout
/headless-browser-debug "debug http://localhost:5173 --timeout 120000"
```

### Missing system libraries

```bash
# Install all dependencies
apt-get update && apt-get install -y \
    libatk-1.0-0 libatk-bridge2.0-0 libcups2 \
    libdrm2 libgbm1 libxkbcommon0 libxcomposite1 \
    libxdamage1 libxext6 libxfixes3 libxrandr2 \
    libpango-1.0-0 libcairo2 libasound2 libatspi2.0-0
```

## Advanced Features

See [ADVANCED_USAGE.md](references/ADVANCED_USAGE.md) for:
- Network interception
- Authentication handling
- JavaScript automation
- Performance metrics
- Testing patterns
- Error handling
- Session management

## License

MIT

---

*Built with [Puppeteer](https://pptr.dev/) for comprehensive web debugging capabilities*
