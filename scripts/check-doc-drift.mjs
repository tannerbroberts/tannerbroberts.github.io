#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const root = process.cwd();
const mapPath = path.join(root, 'docs/code-to-doc-map.json');
const memoryPath = path.join(root, 'server_memory.json');

function loadJSON(p, fallback) {
  if (!fs.existsSync(p)) return fallback;
  try { return JSON.parse(fs.readFileSync(p,'utf8')); } catch { return fallback; }
}

const mapping = loadJSON(mapPath, { mappings: [] }).mappings;
const memory = loadJSON(memoryPath, {});
memory.docDrift ||= { hashes: {} };

let hadDrift = false;
for (const { code, doc } of mapping) {
  const codeDir = path.join(root, code);
  const docPath = path.join(root, doc);
  if (!fs.existsSync(codeDir) || !fs.existsSync(docPath)) continue;
  const files = [];
  (function walk(d){
    for (const entry of fs.readdirSync(d)) {
      if (entry.startsWith('.')) continue;
      const full = path.join(d, entry);
      const stat = fs.statSync(full);
      if (stat.isDirectory()) { walk(full); continue; }
      if (!/\.(t|j)sx?$/.test(entry)) continue;
      files.push({ rel: path.relative(codeDir, full), size: stat.size, mtime: stat.mtimeMs });
    }
  })(codeDir);
  files.sort((a,b)=>a.rel.localeCompare(b.rel));
  const newest = Math.max(...files.map(f=>f.mtime), 0);
  const hash = crypto.createHash('sha1').update(files.map(f=>`${f.rel}:${f.size}:${f.mtime}`).join('\n')).digest('hex');
  const prev = memory.docDrift.hashes[code];
  const docMtime = fs.statSync(docPath).mtimeMs;
  if (prev && prev !== hash && docMtime < newest) {
    console.error(`DRIFT: ${code} changed (${prev.slice(0,7)} -> ${hash.slice(0,7)}) without updating ${doc}`);
    hadDrift = true;
  }
  memory.docDrift.hashes[code] = hash;
}

fs.writeFileSync(memoryPath, JSON.stringify(memory, null, 2));
if (hadDrift) {
  console.error('\nDrift detected. Update docs.');
  process.exit(2);
} else {
  console.log('No doc drift detected.');
}
