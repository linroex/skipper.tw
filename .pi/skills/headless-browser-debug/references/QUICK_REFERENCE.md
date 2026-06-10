# Quick Reference Card

## Command Syntax
```bash
/headless-browser-debug "action url [options]"
```

## Actions

| Action | Description | Example |
|--------|-------------|---------|
| `debug` | Full debugging report | `/headless-browser-debug "debug http://localhost:5173"` |
| `open` | Open page with basic logs | `/headless-browser-debug "open http://localhost:5173"` |
| `screenshot` | Take full-page screenshot | `/headless-browser-debug "screenshot http://localhost:5173"` |
| `content` | Extract page content | `/headless-browser-debug "content http://localhost:5173"` |
| `errors` | Show only errors | `/headless-browser-debug "errors http://localhost:5173"` |
| `network` | Show network activity | `/headless-browser-debug "network http://localhost:5173"` |
| `eval` | Evaluate JavaScript | `/headless-browser-debug "eval http://localhost:5173 'document.title'"` |
| `inspect` | Inspect elements | `/headless-browser-debug "inspect http://localhost:5173 '.card'"` |

## Options

| Option | Description | Example |
|--------|-------------|---------|
| `--timeout ms` | Set timeout (ms) | `--timeout 60000` |
| `--headful` | Open visible browser | `--headful` |
| `--viewport WxH` | Set viewport size | `--viewport 1920x1080` |
| `--screenshot path` | Custom screenshot path | `--screenshot custom.png` |
| `--wait selector` | Wait for element | `--wait '.loaded'` |

## Common Patterns

### Debug Your Site
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

### Find Console Logs
```bash
/headless-browser-debug "open http://localhost:5173"
```

### Inspect Elements
```bash
/headless-browser-debug "inspect http://localhost:5173 'h1'"
```

### Check Network
```bash
/headless-browser-debug "network http://localhost:5173"
```

### Get Page Title
```bash
/headless-browser-debug "eval http://localhost:5173 'document.title'"
```

### Extract Content
```bash
/headless-browser-debug "content http://localhost:5173"
```

### Custom Viewport
```bash
/headless-browser-debug "screenshot http://localhost:5173 --viewport 375x667"
```

### Wait for Element
```bash
/headless-browser-debug "debug http://localhost:5173 --wait '.activity-loaded'"
```

### Long Timeout
```bash
/headless-browser-debug "debug http://localhost:5173 --timeout 120000"
```

## Skipper.tw Specific Commands

### Debug Homepage
```bash
/headless-browser-debug "debug http://localhost:5173"
```

### Check Activities Page
```bash
/headless-browser-debug "debug http://localhost:5173/activities"
```

### Check Courses Page
```bash
/headless-browser-debug "debug http://localhost:5173/courses"
```

### Inspect Activity Card
```bash
/headless-browser-debug "inspect http://localhost:5173 '.activity-card'"
```

### Check Data Loading
```bash
/headless-browser-debug "eval http://localhost:5173 'Array.from(document.querySelectorAll(\".activity-card\")).length'"
```

### Test Mobile View
```bash
/headless-browser-debug "screenshot http://localhost:5173 --viewport 375x667"
```

### Check Console Logs
```bash
/headless-browser-debug "open http://localhost:5173"
```

### Check Network Requests
```bash
/headless-browser-debug "network http://localhost:5173"
```

## Useful JavaScript Evaluations

```javascript
// Count elements
'document.querySelectorAll(".activity-card").length'

// Get all titles
'Array.from(document.querySelectorAll("h1")).map(h => h.textContent)'

// Check if element exists
'!!document.querySelector(".activity-card")'

// Get page URL
'window.location.href'

// Get viewport size
'{ width: window.innerWidth, height: window.innerHeight }'

// Get console log count
'console._count || 0'

// Get network request count
'performance.getEntriesByType("resource").length'

// Check if data loaded
'document.querySelector(".loading") === null'
```

## Troubleshooting

### Browser not installed
```bash
npx puppeteer browsers install chrome
```

### Port not accessible
```bash
# Check if server is running
curl http://localhost:5173

# Or start dev server
npm run dev
```

### Timeout errors
```bash
# Increase timeout
/headless-browser-debug "debug http://localhost:5173 --timeout 60000"
```

## Exit Codes

- `0` - Success
- `1` - Error (missing URL, browser error, etc.)

## File Locations

- Main script: `scripts/browser-debug.js`
- Screenshot: `./debug-screenshot.png`
- Skill directory: `./.pi/skills/headless-browser-debug/`

## Environment Variables

```bash
# Custom Chromium path
CHROMIUM_PATH=/path/to/chromium

# Skip browser validation
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
```

## Performance Tips

1. Use `headless` mode for faster execution
2. Set appropriate timeout values
3. Avoid unnecessary screenshots
4. Close browser properly
5. Reuse browser instance for multiple requests

## Security Notes

- Never use with untrusted URLs
- Be careful with authentication cookies
- Don't expose sensitive information in logs
- Validate URLs before opening

---

*For more detailed information, see [ADVANCED_USAGE.md](ADVANCED_USAGE.md)*
