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
    path: 'stream-backup-1',
    title: 'Stream Backup 01',
    heading: meta.channels[0]?.name ?? 'Stream Backup 01',
    description: meta.channels[0]
      ? `${meta.channels[0].name}: ${meta.channels[0].storage} across ${meta.channels[0].files} audited files (scan ${meta.channels[0].scanId}).`
      : 'Channel 1 audit report.',
  },
  {
    path: 'stream-backup-2',
    title: 'Stream Backup 02',
    heading: meta.channels[1]?.name ?? 'Stream Backup 02',
    description: meta.channels[1]
      ? `${meta.channels[1].name}: ${meta.channels[1].storage} across ${meta.channels[1].files} audited files (scan ${meta.channels[1].scanId}).`
      : 'Channel 2 audit report.',
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
  ['/stream-backup-1', 'Backup 01'],
  ['/stream-backup-2', 'Backup 02'],
  ['/sources', 'Sources'],
]

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
      `  <link rel="canonical" href="${canonical}" />\n    <script type="application/ld+json">${jsonLd}</script>\n  </head>`,
    )
    .replace('<div id="root"></div>', `<div id="root"></div>${noscript}`)

  return html
}

for (const route of ROUTES) {
  const html = shellFor(route)

  // Directory index (served for `/route/` and by Cloudflare Pages).
  const dirTarget = path.join(dist, route.path, 'index.html')
  await mkdir(path.dirname(dirTarget), { recursive: true })
  await writeFile(dirTarget, html)

  // Clean-URL file (served for `/route` by static hosts and `vite preview`).
  await writeFile(path.join(dist, `${route.path}.html`), html)

  console.log(`prerendered /${route.path} (+ .html)`)
}
