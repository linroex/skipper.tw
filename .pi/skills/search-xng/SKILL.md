---
name: search-xng
description: Perform web search and content extraction using search.app.lab (SearchXNG) service. Use when you need to search for information on the web, look up documentation, find facts, or extract content from URLs.
---

# search-xng

## Overview

This skill integrates with **search.app.lab** (SearchXNG) to perform web searches and content extraction. Use this when the task requires finding information from the web.

## Setup

The search service is already available at:

```
https://search.app.lab
```

No additional setup required.

## Usage

### Search the web

```bash
/search "your query"
```

Example:
- `/search "Vue 3 composition API tutorial"`
- `/search "JavaScript async await best practices"`
- `/search "latest React 18 documentation"`

### Extract content from URL

```bash
/extract "https://example.com"
```

### Get search suggestions

```bash
/suggestions "partial query"
```

## Examples

### Find documentation
```
/search "Next.js middleware authentication"
```

### Research a topic
```
/search "difference between React and Vue"
```

### Get latest news
```
/search "React 19 release date"
```

### Find API documentation
```
/search "Supabase TypeScript authentication API"
```

## Notes

- Keep search queries specific and relevant
- Use quotation marks for exact phrases
- Results may vary based on the search service capabilities
- This skill is for research purposes, not for automated workflows
- Always verify important information from multiple sources

## Files in this skill

- `SKILL.md` - This file, defines the skill
- `references/SEARCH_API.md` - Detailed API reference
