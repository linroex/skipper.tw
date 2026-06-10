# SearchXNG API Reference

## Endpoint

```
https://search.app.lab
```

## Search Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | Yes | Search query string |
| `limit` | integer | No | Number of results (default: 20) |
| `offset` | integer | No | Pagination offset (default: 0) |
| `filter` | string | No | Additional filtering options |
| `type` | string | No | Result type (search, suggestions, extract) |

## Example Requests

### Basic search
```
GET https://search.app.lab?q=javascript+tutorial&limit=10
```

### Search with suggestions
```
GET https://search.app.lab?q=react&limit=5&type=suggestions
```

### Search with offset (pagination)
```
GET https://search.app.lab?q=vue.js&limit=10&offset=10
```

### Search with filter
```
GET https://search.app.lab?q=api+documentation&filter=site:docs.example.com
```

## Response Format

### Search Results
```json
{
  "results": [
    {
      "title": "Result Title",
      "url": "https://example.com/page",
      "snippet": "Result description or snippet...",
      "favicon": "https://example.com/favicon.ico"
    }
  ],
  "total": 150,
  "query": "search query"
}
```

### Suggestions
```json
{
  "suggestions": [
    "react tutorial",
    "react hooks",
    "react router"
  ]
}
```

## Common Use Cases

### 1. Research a topic
```javascript
const results = await fetch('https://search.app.lab?q=react+state+management');
const data = await results.json();
// Use data.results[0].url to access the top result
```

### 2. Get autocomplete suggestions
```javascript
const suggestions = await fetch('https://search.app.lab?q=react&limit=5&type=suggestions');
const data = await suggestions.json();
// data.suggestions contains autocomplete suggestions
```

### 3. Paginate through results
```javascript
const page1 = await fetch('https://search.app.lab?q=javascript&page=1&limit=10');
const page2 = await fetch('https://search.app.lab?q=javascript&page=2&limit=10');
```

## Tips

- Keep queries concise (10-50 words)
- Use specific keywords for better results
- Try multiple queries if initial search doesn't find what you need
- Check the snippet to ensure relevance before following the URL
