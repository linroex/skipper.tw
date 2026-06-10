# Visual Guide - Headless Browser Debug Skill

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Your Command                             │
│  /headless-browser-debug "debug http://localhost:5173"      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   Skill Loader                              │
│  - Parses command arguments                                 │
│  - Loads browser-debug.js                                   │
│  - Extracts URL, action, and options                        │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              Puppeteer Browser                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Headless Chrome / Chromium                          │  │
│  │  ┌────────────────────────────────────────────────┐  │  │
│  │  │   Page Object                                   │  │  │
│  │  │   - Navigates to URL                            │  │  │
│  │  │   - Loads DOM                                   │  │  │
│  │  │   - Executes JavaScript                         │  │  │
│  │  │   - Renders CSS                                 │  │  │
│  │  │   - Handles interactions                        │  │  │
│  │  └────────────────────────────────────────────────┘  │  │
│  │                                                       │  │
│  │  Event Listeners:                                    │  │  │
│  │  - console.log → capture logs                        │  │  │
│  │  - pageerror → capture errors                        │  │  │
│  │  - request/response → capture network                │  │  │
│  │  - screenshot → capture image                        │  │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   Data Capture                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │ Console    │  │  Network   │  │   Screenshot│           │
│  │    Logs    │  │  Requests  │  │   Capture   │           │
│  └────────────┘  └────────────┘  └────────────┘            │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │  Page      │  │  Content   │  │ JavaScript │            │
│  │   Errors   │  │  Extract   │  │  Eval      │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                   Report Generation                         │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Comprehensive Debug Report:                         │  │
│  │  - Page Information                                  │  │
│  │  - Console Logs (with counts)                        │  │
│  │  - Errors & Warnings                                 │  │
│  │  - Network Activity                                  │  │
│  │  - Screenshot Path                                   │  │
│  └──────────────────────────────────────────────────────┘  │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  Your Terminal                              │
│  🚀 Starting Headless Browser Debug                       │
│  📍 URL: http://localhost:5173                            │
│  📸 Screenshot saved to: debug-screenshot.png            │
│  📊 DEBUG REPORT                                           │
│  ...                                                       │
└─────────────────────────────────────────────────────────────┘
```

## Workflow

```
User Request
    │
    ├───► Parse Command
    │        │
    │        ├───► Extract URL
    │        ├───► Determine Action (debug/screenshot/content/etc)
    │        └───► Apply Options (timeout, viewport, etc)
    │
    ├───► Launch Browser (Puppeteer)
    │        │
    │        ├───► Headless Mode (default)
    │        └───► Headful Mode (if --headful)
    │
    ├───► Create Page
    │        │
    │        ├───► Set Viewport
    │        └───► Attach Event Listeners
    │
    ├───► Navigate to URL
    │        │
    │        ├───► Wait for Network Idle
    │        └───► Wait for Selector (if specified)
    │
    ├───► Capture Data
    │        │
    │        ├───► Console Logs
    │        ├───► Page Errors
    │        ├───► Network Requests
    │        ├───► Take Screenshot
    │        └───► Extract Content
    │
    ├───► Close Browser
    │
    └───► Generate Report
             │
             └───► Display Results
```

## Component Flow

```
┌─────────────────┐
│  browser-debug.js  │
│   (Main Script)    │
└────────┬──────────┘
         │
         ├──► captureConsoleLogs(page)
         │      └──► page.on('console', ...)
         │
         ├──► captureErrors(page)
         │      └──► page.on('pageerror', ...)
         │
         ├──► captureNetwork(page)
         │      └──► page.on('request', 'response', ...)
         │
         ├──► captureScreenshot(page, path)
         │      └──► page.screenshot()
         │
         ├──► extractContent(page)
         │      └──► page.evaluate()
         │
         ├──► inspectElement(page, selector)
         │      └──► page.$$(selector)
         │
         └──► evaluateJS(page, expression)
                └──► page.evaluate(expression)
```

## Command Types

```
1. DEBUG
   /headless-browser-debug "debug <url>"
   
   Output: Full report with:
   - Page info
   - Console logs
   - Errors
   - Network activity
   - Screenshot

2. SCREENSHOT
   /headless-browser-debug "screenshot <url>"
   
   Output: Screenshot file
   - Full-page capture
   - Saved to disk

3. CONTENT
   /headless-browser-debug "content <url>"
   
   Output: Text content
   - Page title
   - Meta description
   - Headings
   - Link list

4. ERRORS
   /headless-browser-debug "errors <url>"
   
   Output: Error list only
   - Console errors
   - Page errors

5. NETWORK
   /headless-browser-debug "network <url>"
   
   Output: Network activity
   - Request count
   - Failed requests
   - Response codes

6. EVAL
   /headless-browser-debug "eval <url> 'js'"
   
   Output: JavaScript result
   - Evaluated expression
   - Return value

7. INSPECT
   /headless-browser-debug "inspect <url> 'selector'"
   
   Output: Element details
   - Matching elements
   - Attributes
   - Text content
```

## Data Flow

```
Browser Events → Event Handlers → Data Store → Report → Output

Console Log → on('console') → logs[] → Format → Display
Page Error → on('pageerror') → errors[] → Format → Display
Request → on('request') → requests[] → Format → Display
Response → on('response') → update() → Format → Display
Navigation → goto() → pageState → Extract → Display
Screenshot → screenshot() → file → Save → Path
Content → evaluate() → data → Format → Display
```

## File Output

```
Input: /headless-browser-debug "screenshot http://localhost:5173"

Output:
├── debug-screenshot.png  (1920x1080)
├── debug-screenshot-mobile.png (375x667) - if --viewport
└── debug-report.txt      (log file) - optional
```

## Error Flow

```
Error Occurs
    │
    ├──► Capture Error
    │      ├──► Console error → logs[]
    │      ├──► Page error → errors[]
    │      └──► Network error → requests[].failed = true
    │
    ├──► Log Error
    │      └──► Display to user
    │
    ├──► Continue or Abort
    │      ├──► Continue if non-fatal
    │      └──► Abort if fatal
    │
    └──► Include in Report
           └──► Summary at top
```

## Performance

```
Step                  │ Time    │ Memory
──────────────────────┼─────────┼──────────
Parse Command         │ 10ms    │ 5MB
Launch Browser        │ 2000ms  │ 50MB
Create Page           │ 100ms   │ 10MB
Navigate              │ 1000ms  │ 20MB
Capture Data          │ 500ms   │ 30MB
Take Screenshot       │ 1000ms  │ 50MB
Generate Report       │ 100ms   │ 5MB
Close Browser         │ 200ms   │ 10MB
──────────────────────┼─────────┼──────────
Total                 │ 4910ms  │ 180MB
```

## Usage Examples

```
1. Quick Check
   /headless-browser-debug "open http://localhost:5173"
   
   Result: Basic logs + screenshot
   Time: ~3s

2. Error Check
   /headless-browser-debug "errors http://localhost:5173"
   
   Result: Error list only
   Time: ~4s

3. Full Debug
   /headless-browser-debug "debug http://localhost:5173"
   
   Result: Complete report
   Time: ~5s

4. Mobile Test
   /headless-browser-debug "screenshot http://localhost:5173 --viewport 375x667"
   
   Result: Mobile screenshot
   Time: ~4s

5. Data Check
   /headless-browser-debug "eval http://localhost:5173 'document.querySelectorAll(\".card\").length'"
   
   Result: Element count
   Time: ~3s
```

## Configuration Options

```
Timeout
   --timeout 60000  (60 seconds)
   
Viewport
   --viewport 1920x1080
   --viewport 375x667
   
Headful Mode
   --headful
   
Screenshot Path
   --screenshot custom.png
   
Wait for Element
   --wait .loaded
```

## State Management

```
Browser State:
┌─────────────────────────────────────┐
│ Browser Instance                    │
│ ├── Context                         │
│ │   └── Page 1                      │
│ │       ├── State: 'loading'        │
│ │       ├── URL: 'http://...'       │
│ │       └── DOM: loaded             │
│ ├── Context                         │
│ │   └── Page 2                      │
│ └── ...                             │
└─────────────────────────────────────┘

Data State:
┌─────────────────────────────────────┐
│ Captured Data                       │
│ ├── Console Logs: []                │
│ ├── Page Errors: []                 │
│ ├── Network Requests: []            │
│ ├── Screenshot: 'path.png'          │
│ └── Content: { title, ... }         │
└─────────────────────────────────────┘

Report State:
┌─────────────────────────────────────┐
│ Final Report                        │
│ ├── Page Info                       │
│ ├── Console Summary                 │
│ ├── Error Summary                   │
│ ├── Network Summary                 │
│ └── Screenshot Path                 │
└─────────────────────────────────────┘
```

---

*This visual guide helps understand how the skill works internally*
