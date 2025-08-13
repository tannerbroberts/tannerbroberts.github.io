#!/usr/bin/env node
/**
 * Validate and (optionally) update breadcrumb lines across documentation markdown files.
 *
 * Rules:
 *  - Each monitored .md file must contain a line beginning with `Breadcrumb:` within the first 15 non-empty lines after the top-level heading.
 *  - If a file path exists in docs/breadcrumb-map.json, the breadcrumb string must EXACTLY match.
 *  - Files present in map but missing on disk -> warning.
 *  - New doc files with breadcrumb lines not yet in map -> reported (optionally added with --write-missing).
 *  - Missing breadcrumb line -> error (optionally auto-insert with --fix to just after first heading).
 *
 * Exit codes:
 *  0 = success (no errors)
 *  1 = validation errors (structure / missing breadcrumb / mismatch)
 *  2 = script/config error
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const MAP_PATH = path.join(ROOT, 'docs', 'breadcrumb-map.json');
const ARG_WRITE = process.argv.includes('--write-missing');
const ARG_FIX = process.argv.includes('--fix');

/** Recursively collect markdown files under a directory */
async function collectMarkdown(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const results = [];
  for (const e of entries) {
    if (e.name.startsWith('.')) continue;
    const full = path.join(dir, e.name);
    if (e.isDirectory()) results.push(...await collectMarkdown(full));
    else if (e.isFile() && e.name.endsWith('.md')) results.push(full);
  }
  return results;
}

async function readMap() {
  const raw = await fs.readFile(MAP_PATH, 'utf8');
  return JSON.parse(raw);
}

function relative(p) { return p.replace(ROOT + path.sep, '').replace(/\\/g, '/'); }

function extractBreadcrumb(content) {
  const lines = content.split(/\r?\n/);
  let sawHeading = false;
  let searched = 0;
  for (const line of lines) {
    if (!sawHeading) {
      if (/^#\s+/.test(line.trim())) sawHeading = true;
      continue;
    }
    if (line.trim()) searched++;
    const m = line.match(/^Breadcrumb:\s*(.+)$/);
    if (m) return { breadcrumb: m[1].trim(), line };
    if (searched > 15) break; // limit search window
  }
  return null;
}

async function insertBreadcrumb(filePath, breadcrumb) {
  const raw = await fs.readFile(filePath, 'utf8');
  const lines = raw.split(/\r?\n/);
  let out = [];
  let inserted = false;
  for (let i = 0; i < lines.length; i++) {
    out.push(lines[i]);
    if (!inserted && /^#\s+/.test(lines[i])) {
      out.push('');
      out.push(`Breadcrumb: ${breadcrumb}`);
      inserted = true;
    }
  }
  if (!inserted) {
    out.unshift(`Breadcrumb: ${breadcrumb}`);
  }
  await fs.writeFile(filePath, out.join('\n'));
}

async function main() {
  let map;
  try { map = await readMap(); } catch (e) {
    console.error('Failed to load breadcrumb map:', e.message);
    process.exit(2);
  }
  const mapEntries = Object.entries(map).filter(([k]) => !k.startsWith('_'));
  const watchedRoots = [path.join(ROOT, 'docs'), path.join(ROOT, 'src')];
  const allFiles = [];
  for (const r of watchedRoots) {
    try { allFiles.push(...await collectMarkdown(r)); } catch {/* ignore */}
  }
  const relSet = new Set(allFiles.map(relative));

  const errors = [];
  const warnings = [];
  const additions = [];

  // Validate existing mapped files
  for (const [file, expected] of mapEntries) {
    if (!relSet.has(file)) {
      warnings.push(`Mapped file missing on disk: ${file}`);
      continue;
    }
    const content = await fs.readFile(path.join(ROOT, file), 'utf8');
    const br = extractBreadcrumb(content);
    if (!br) {
      errors.push(`Missing breadcrumb in mapped file: ${file}`);
      if (ARG_FIX) {
        await insertBreadcrumb(path.join(ROOT, file), expected);
        console.log(`Auto-inserted breadcrumb into ${file}`);
      }
      continue;
    }
    if (br.breadcrumb !== expected) {
      errors.push(`Breadcrumb mismatch in ${file}\n  expected: ${expected}\n  found:    ${br.breadcrumb}`);
      if (ARG_FIX) {
        // Replace line
        const updated = content.replace(br.line, `Breadcrumb: ${expected}`);
        await fs.writeFile(path.join(ROOT, file), updated);
        console.log(`Fixed breadcrumb in ${file}`);
      }
    }
  }

  // Detect new files with breadcrumbs not in map
  for (const f of relSet) {
    if (!f.endsWith('.md')) continue;
    if (map[f]) continue;
    const content = await fs.readFile(path.join(ROOT, f), 'utf8');
    const br = extractBreadcrumb(content);
    if (br) {
      additions.push({ file: f, breadcrumb: br.breadcrumb });
    } else {
      // Only enforce breadcrumb for docs/* or *feature-description.md or DATA_MODEL_SPEC
      if (/^docs\//.test(f) || /feature-description\.md$/.test(f) || /DATA_MODEL_SPEC\.md$/.test(f)) {
        errors.push(`Unmapped file missing breadcrumb: ${f}`);
        if (ARG_FIX) {
          const placeholder = 'Docs > TODO > (Add Breadcrumb)';
            await insertBreadcrumb(path.join(ROOT, f), placeholder);
            console.log(`Inserted placeholder breadcrumb in ${f}`);
        }
      }
    }
  }

  if (additions.length) {
    if (ARG_WRITE) {
      const mapObj = map;
      for (const a of additions) {
        mapObj[a.file] = a.breadcrumb;
        console.log(`Added to map: ${a.file} -> ${a.breadcrumb}`);
      }
      mapObj._meta.lastGenerated = new Date().toISOString().slice(0,10);
      await fs.writeFile(MAP_PATH, JSON.stringify(mapObj, null, 2) + '\n');
    } else {
      console.log('\nNew files with breadcrumbs (add with --write-missing):');
      for (const a of additions) console.log(`  ${a.file} -> ${a.breadcrumb}`);
    }
  }

  if (warnings.length) {
    console.log('\nWarnings:');
    warnings.forEach(w => console.log('  ' + w));
  }
  if (errors.length) {
    console.error('\nErrors:');
    errors.forEach(e => console.error('  ' + e));
    process.exit(1);
  }
  console.log('\nAll breadcrumbs valid.');
}

main().catch(e => { console.error('Fatal error:', e); process.exit(2); });
