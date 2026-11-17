import { readFile, mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'

/**
 * Static route shells.
 *
 * The app is a client-rendered SPA on real paths, so `/total-database` would
 * otherwise return the generic home shell. This script takes the built
 * index.html and writes one copy per route with the correct title, description,
 * canonical, Open Graph tags and a <noscript> summary carrying the verified
 * totals — so crawlers, link previews and no-JS visitors get the real page
 * identity and the real numbers. The numbers come from route-meta.json, which
 * is emitted from the live datasets during the build.
 */

const dist = path.resolve('dist')
const template = await readFile(path.join(dist, 'index.html'), 'utf8')
const meta = JSON.parse(await readFile(path.join(dist, 'route-meta.json'), 'utf8'))

const SITE = 'https://luciferdatabase.pages.dev'

const ROUTES = [
  {
    path: 'total-database',
    title: 'Total Database',
    heading: 'Total Database',
    description: `Aggregate telemetry across ${meta.archives} channel archives: ${meta.storage} (${meta.storagePB}), ${meta.files} files and ${meta.messages} messages checked.`,
  },
  {
    path: 'compare',
    title: 'Compare Channels',
    heading: 'Channel head to head',
    description: `Side-by-side comparison of the ${meta.archives} registered archives: storage, files, messages, resolution and category splits.`,
  },
  {
    path: 'search',
    title: 'Search',
    heading: 'Search the index',
    description: 'Search 490 recorded extensions, their categories and every page of the Lucifer Database X index.',
  },
  {
    path: 'sources',
    title: 'Sources & Method',
    heading: 'Sources & method',
    description: `Provenance for every figure: the two audit reports, the derivation rules, a unit converter and a glossary of scanner terms.`,
  },
]

const NAV_LINKS = [
  ['/', 'Overview'],
  ['/total-database', 'Total Database'],
  ['/compare', 'Compare'],
  ['/sources', 'Sources'],
]

/**
 * Route-specific social card. Kept as SVG so the build stays dependency-free;
 * every crawler that supports SVG receives the real totals, and the PNG twin
 * can be added later with any rasteriser without touching this script.
 */
function ogImage(route) {
  const title = escapeHtml(route.title)
  const lines = [
    `${meta.files} files`,
    `${meta.storage} (${meta.storagePB})`,
    `${meta.extensions} extensions`,
    `${meta.archives} archives`,
  ]
  const chips = lines
    .map(
      (line, index) =>
        `<g transform="translate(${80 + index * 268}, 470)"><rect width="248" height="58" rx="14" fill="#14171c" stroke="#2a2f38"/><text x="124" y="36" text-anchor="middle" fill="#c9d1dc" font-family="ui-monospace,monospace" font-size="20">${escapeHtml(line)}</text></g>`,
    )
    .join('')

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630" role="img" aria-label="${title} — Lucifer Database X">
  <rect width="1200" height="630" fill="#0a0b0d"/>
  <rect x="0" y="0" width="1200" height="6" fill="#6a9dff"/>
  <circle cx="1010" cy="120" r="220" fill="#6a9dff" opacity="0.08"/>
  <circle cx="120" cy="560" r="200" fill="#3ddc97" opacity="0.06"/>
  <text x="80" y="122" fill="#6a9dff" font-family="ui-monospace,monospace" font-size="22" letter-spacing="4">LUCIFER DATABASE X</text>
  <text x="80" y="198" fill="#f2f5f9" font-family="system-ui,sans-serif" font-size="34" font-weight="500" letter-spacing="6">SOVEREIGN MEDIA INDEX</text>
  <text x="80" y="330" fill="#ffffff" font-family="system-ui,sans-serif" font-size="86" font-weight="700" letter-spacing="-2">${title}</text>
  <text x="80" y="392" fill="#98a3b1" font-family="system-ui,sans-serif" font-size="26">Verified scan telemetry — nothing estimated.</text>
  ${chips}
</svg>
`
}

function escapeHtml(value) {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function shellFor(route) {
  const canonical = `${SITE}/${route.path}`
  const title = `${route.title} — Lucifer Database X`
  const description = escapeHtml(route.description)

  const jsonLd = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'Dataset',
    name: `Lucifer Database X — ${route.title}`,
    description: route.description,
    url: canonical,
    creator: { '@type': 'Organization', name: 'Lucifer Open Source' },
    variableMeasured: ['files', 'messages', 'storage bytes', 'resolution tiers', 'file extensions'],
  })

  const ogUrl = `${SITE}/og/${route.path}.svg`

  const noscript = `<noscript>
      <div style="max-width:900px;margin:0 auto;padding:48px 24px;font-family:system-ui,sans-serif;line-height:1.6">
        <p style="font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#666">Lucifer Open Source · verified scan telemetry</p>
        <h1 style="font-size:34px;margin:12px 0">${escapeHtml(route.heading)}</h1>
        <p>${description}</p>
        <p><strong>${meta.files}</strong> files · <strong>${meta.storage}</strong> (${meta.storagePB}) · <strong>${meta.messages}</strong> messages checked across ${meta.archives} archives · ${meta.extensions} unique extensions.</p>
        <ul>${NAV_LINKS.map(([href, label]) => `<li><a href="${href}">${label}</a></li>`).join('')}</ul>
        <p>This page renders its tables with JavaScript. The totals above are baked into the HTML so nothing is hidden from a crawler.</p>
      </div>
    </noscript>`

  let html = template
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
      `<meta name="description" content="${description}" />`,
    )
    .replace(
      /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
      `<meta property="og:title" content="${escapeHtml(title)}" />`,
    )
    .replace(
      /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
      `<meta property="og:description" content="${description}" />`,
    )
    .replace(
      '</head>',
      `  <link rel="canonical" href="${canonical}" />
    <meta property="og:url" content="${canonical}" />
    <meta property="og:image" content="${ogUrl}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:image" content="${ogUrl}" />
    <script type="application/ld+json">${jsonLd}</script>
  </head>`,
    )
    .replace('<div id="root"></div>', `<div id="root"></div>${noscript}`)

  return html
}

await mkdir(path.join(dist, 'og'), { recursive: true })

for (const route of ROUTES) {
  const html = shellFor(route)
  await writeFile(path.join(dist, 'og', `${route.path}.svg`), ogImage(route))

  // Directory index (served for `/route/` and by Cloudflare Pages).
  const dirTarget = path.join(dist, route.path, 'index.html')
  await mkdir(path.dirname(dirTarget), { recursive: true })
  await writeFile(dirTarget, html)

  // Clean-URL file (served for `/route` by static hosts and `vite preview`).
  await writeFile(path.join(dist, `${route.path}.html`), html)

  console.log(`prerendered /${route.path} (+ .html, og image)`)
}
