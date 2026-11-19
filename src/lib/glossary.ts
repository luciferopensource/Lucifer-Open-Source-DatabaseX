export interface GlossaryEntry {
  term: string
  definition: string
  group: 'Resolution' | 'Codec & container' | 'Storage' | 'Audit'
}

/**
 * Plain-language definitions for terms that appear in the reports. Nothing here
 * describes a capability the site does not have; each entry explains a label
 * the scanner actually emitted.
 */
export const GLOSSARY: GlossaryEntry[] = [
  {
    term: '2160p / 4K UHD',
    definition: '3840 × 2160 pixels. The scanner groups every file whose height is 2160 lines under this tier.',
    group: 'Resolution',
  },
  {
    term: '1440p / 2K',
    definition: '2560 × 1440 pixels. Quad HD; common for re-encodes that sit between 1080p and 4K.',
    group: 'Resolution',
  },
  {
    term: '1080p / FHD',
    definition: '1920 × 1080 pixels. Full high definition, the most common tier in both archives.',
    group: 'Resolution',
  },
  {
    term: '720p / HD',
    definition: '1280 × 720 pixels. Standard high definition; the second most common tier here.',
    group: 'Resolution',
  },
  {
    term: '480p / 576p / 360p / 240p',
    definition: 'Standard-definition tiers. The scanner reports them separately so nothing is folded into “other”.',
    group: 'Resolution',
  },
  {
    term: 'HEVC / H.265',
    definition: 'A video codec that reaches similar quality to H.264 at roughly half the bitrate. Files usually end in .mkv or .mp4.',
    group: 'Codec & container',
  },
  {
    term: 'AVC / H.264',
    definition: 'The older, universally supported video codec; larger files for the same perceived quality.',
    group: 'Codec & container',
  },
  {
    term: 'MKV',
    definition: 'Matroska container. Holds video, multiple audio tracks and subtitles in one file — the dominant extension here.',
    group: 'Codec & container',
  },
  {
    term: 'Split parts (.001, .002 …)',
    definition: 'A single release divided into numbered volumes. Each part is counted as its own file by the scanner.',
    group: 'Codec & container',
  },
  {
    term: 'Extension',
    definition: 'The text after the final dot in a file name. The ledger reports what the scanner saw, including malformed “extensions” such as fragments of a title.',
    group: 'Codec & container',
  },
  {
    term: 'TB / PB',
    definition:
      'TB, GB and MB are binary (1 TB = 1024 GB). The headline PB figure uses the decimal convention of the audit reports (1 PB = 1000 TB), so 1,654.24 TB is reported as 1.65 PB. The unit selector converts every figure on the fly.',
    group: 'Storage',
  },
  {
    term: 'Largest single file',
    definition: 'The heaviest individual file recorded in a channel, taken from the scan report rather than recalculated.',
    group: 'Storage',
  },
  {
    term: 'Scan ID',
    definition: 'Identifier the scanner wrote for one audit run, e.g. LMS-XXXX-XXXX. It ties a table row back to its report.',
    group: 'Audit',
  },
  {
    term: 'Messages checked',
    definition: 'Every message the scanner walked through, including messages that held no file.',
    group: 'Audit',
  },
  {
    term: 'Integrity matrix',
    definition: 'Live tests run against the aggregate built from the registry. If a test fails it reports MISSING rather than a decorative tick.',
    group: 'Audit',
  },
  {
    term: 'Empty by design',
    definition: 'The media catalogue has no verified records, so it renders nothing. No placeholder titles or posters are ever seeded.',
    group: 'Audit',
  },
]
