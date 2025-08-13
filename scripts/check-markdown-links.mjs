#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const root = process.cwd();
const mdFiles = [];
function walk(dir){
  for (const e of fs.readdirSync(dir)) {
    if (e.startsWith('.')) continue;
    const full = path.join(dir, e);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (['node_modules','dist','.git'].includes(e)) continue;
      walk(full);
    } else if (/\.md$/.test(e)) mdFiles.push(full);
  }
}
walk(root);

function slug(h){
  return h.toLowerCase().replace(/[`*_~]/g,'').replace(/[^a-z0-9\s-]/g,'').trim().replace(/\s+/g,'-');
}
const headingCache = new Map();
for (const file of mdFiles) {
  const text = fs.readFileSync(file,'utf8');
  headingCache.set(file, new Set([...text.matchAll(/^#+\s+(.+)$/gm)].map(m=>slug(m[1]))));
}

let bad = 0;
for (const file of mdFiles) {
  const rel = path.relative(root, file);
  const text = fs.readFileSync(file,'utf8');
  for (const m of text.matchAll(/\[(.*?)\]\(([^)]+)\)/g)) {
    let target = m[2];
    if (/^https?:/.test(target) || target.startsWith('#') || target.startsWith('mailto:')) continue;
    const [p, hash] = target.split('#');
    const resolved = path.resolve(path.dirname(file), p);
    if (!fs.existsSync(resolved)) { console.error(`MISSING FILE: ${rel} -> ${target}`); bad++; continue; }
    if (hash) {
      const headings = headingCache.get(resolved) || new Set();
      if (!headings.has(slug(hash))) { console.error(`BAD ANCHOR: ${rel} -> ${target}`); bad++; }
    }
  }
}
if (bad) { console.error(`\nLink check failed: ${bad} issues.`); process.exit(3); }
console.log('All markdown links OK.');
