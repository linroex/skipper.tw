import { writeFileSync, mkdirSync } from 'node:fs'
import { resolve } from 'node:path'
import schoolsData from '../public/data/schools.json' with { type: 'json' }

const siteUrl = 'https://skipper.tw'
const today = new Date().toISOString().slice(0, 10)

const urls = [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/courses/', changefreq: 'daily', priority: '0.9' },
  { path: '/schools/', changefreq: 'weekly', priority: '0.8' },
  { path: '/activities/', changefreq: 'daily', priority: '0.7' },
  ...schoolsData.schools.map(school => ({
    path: `/schools/${school.id}/`,
    changefreq: 'weekly',
    priority: '0.7'
  }))
]

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(({ path, changefreq, priority }) => `  <url>
    <loc>${siteUrl}${path}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`).join('\n')}
</urlset>
`

const outputDir = resolve('dist')
mkdirSync(outputDir, { recursive: true })
writeFileSync(resolve(outputDir, 'sitemap.xml'), xml)
console.log(`Generated sitemap.xml with ${urls.length} URLs`)
