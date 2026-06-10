#!/usr/bin/env node

/**
 * Web Page Checker - HTTP-based page checking (fallback when Puppeteer unavailable)
 * This provides basic functionality without requiring Chromium
 */

const http = require('http');
const https = require('https');
const { URL } = require('url');

async function fetchPage(url) {
    return new Promise((resolve, reject) => {
        const parsedUrl = new URL(url);
        const client = parsedUrl.protocol === 'https:' ? https : http;

        const request = client.get(url, { timeout: 10000 }, (res) => {
            let data = '';
            
            res.on('data', chunk => {
                data += chunk;
            });
            
            res.on('end', () => {
                resolve({
                    url,
                    status: res.statusCode,
                    headers: res.headers,
                    content: data,
                    contentType: res.headers['content-type']
                });
            });
        });

        request.on('error', reject);
        request.on('timeout', () => {
            request.destroy();
            reject(new Error('Request timeout'));
        });
    });
}

async function extractContent(html) {
    // Simple HTML parsing without DOM
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']*)["']/i);
    const headingMatches = html.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/gi) || [];
    const linkMatches = html.match(/<a[^>]*href=["']([^"']*)["'][^>]*>/gi) || [];

    return {
        title: titleMatch ? titleMatch[1].trim() : 'No title',
        description: metaDescMatch ? metaDescMatch[1] : null,
        headings: headingMatches.map(h => h.replace(/<[^>]+>/g, '').trim()),
        links: linkMatches.map(l => {
            const hrefMatch = l.match(/href=["']([^"']*)["']/i);
            return hrefMatch ? hrefMatch[1] : null;
        }).filter(Boolean)
    };
}

async function checkPage(url, options = {}) {
    const { timeout = 10000, includeBody = true } = options;

    console.log(`🌐 Checking ${url}...`);
    console.log('='.repeat(50));

    try {
        const response = await fetchPage(url);
        
        console.log(`\n✅ Status: ${response.status} ${http.STATUS_CODES[response.status] || 'OK'}`);
        console.log(`📄 Content-Type: ${response.contentType || 'unknown'}`);
        
        if (!includeBody) {
            console.log('\n✅ Check complete (body excluded)');
            return response;
        }

        // Extract content
        const content = await extractContent(response.content);
        
        console.log(`\n📄 Page Information:`);
        console.log(`   Title: ${content.title}`);
        if (content.description) {
            console.log(`   Description: ${content.description.substring(0, 100)}`);
        }

        console.log(`\n📑 Headings:`);
        content.headings.forEach(h => {
            const level = h.match(/^h[1-6]/i);
            const indent = level ? level[0].toUpperCase() + ': ' : '   ';
            console.log(`   ${indent}${h.substring(0, 100)}`);
        });

        console.log(`\n🔗 Links found: ${content.links.length}`);
        if (content.links.length > 0) {
            console.log('   First 5 links:');
            content.links.slice(0, 5).forEach(link => {
                console.log(`      - ${link.substring(0, 80)}`);
            });
        }

        console.log('='.repeat(50));
        console.log('✅ Check complete!');

        return { ...response, content };

    } catch (error) {
        console.error(`\n❌ Error checking ${url}:`);
        console.error(`   ${error.message}`);
        
        if (error.code === 'ENOTFOUND') {
            console.error('\n💡 Tip: Make sure the server is running and the URL is correct');
        }
        
        throw error;
    }
}

async function checkErrors(url) {
    console.log(`🔍 Checking ${url} for errors...`);
    
    try {
        const response = await fetchPage(url);
        
        if (response.status >= 400) {
            console.log(`\n❌ HTTP Error: ${response.status}`);
            return false;
        }

        // Check for common error indicators in content
        const errorPatterns = [
            /error/i,
            /failed/i,
            /exception/i,
            /cannot/i,
            /undefined is not/i,
            /is not a function/i
        ];

        const content = response.content.toLowerCase();
        let foundIssues = [];

        errorPatterns.forEach(pattern => {
            if (pattern.test(content)) {
                foundIssues.push(`Pattern "${pattern.source}" found`);
            }
        });

        if (foundIssues.length > 0) {
            console.log(`\n⚠️  Potential issues found:`);
            foundIssues.forEach(issue => console.log(`   - ${issue}`));
            return false;
        }

        console.log('✓ No obvious errors detected');
        return true;

    } catch (error) {
        console.error(`\n❌ Error: ${error.message}`);
        return false;
    }
}

async function getContent(url) {
    console.log(`📄 Extracting content from ${url}...`);
    
    const response = await fetchPage(url);
    const content = await extractContent(response.content);

    console.log('\n' + '='.repeat(50));
    console.log(`TITLE: ${content.title}`);
    console.log('='.repeat(50));

    if (content.description) {
        console.log(`\nDESCRIPTION:`);
        console.log(content.description);
    }

    console.log(`\nHEADINGS:`);
    content.headings.forEach(h => console.log(`   ${h}`));

    console.log(`\nBODY PREVIEW (first 500 chars):`);
    const bodyContent = response.content
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
        .substring(0, 500);
    console.log(bodyContent);

    return content;
}

async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.error('❌ Usage: node web-check.js <url> [action]');
        console.error('\nActions:');
        console.error('  check  - Full check (default)');
        console.error('  errors - Check for errors only');
        console.error('  content - Extract page content');
        console.error('\nExample:');
        console.error('  node web-check.js http://localhost:5173 check');
        process.exit(1);
    }

    const url = args[0];
    const action = args[1] || 'check';

    try {
        switch (action) {
            case 'check':
                await checkPage(url);
                break;
            case 'errors':
                await checkErrors(url);
                break;
            case 'content':
                await getContent(url);
                break;
            default:
                console.error(`❌ Unknown action: ${action}`);
                process.exit(1);
        }
    } catch (error) {
        console.error('\n💡 Troubleshooting:');
        console.error('   1. Check if the server is running');
        console.error('   2. Verify the URL is correct');
        console.error('   3. Check network connectivity');
        console.error('   4. Use the full headless-browser-debug for complete features');
        process.exit(1);
    }
}

main();
