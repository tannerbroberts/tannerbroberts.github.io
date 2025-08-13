#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const root = process.cwd();
const processDoc = path.join(root, 'docs/meta/PROCESS.md');
const breadcrumbMap = path.join(root, 'docs/breadcrumb-map.json');
const codeMap = path.join(root, 'docs/code-to-doc-map.json');
const readme = path.join(root, 'README.md');

function hashFile(p){
  if(!fs.existsSync(p)) return 'missing';
  return crypto.createHash('sha1').update(fs.readFileSync(p,'utf8')).digest('hex').slice(0,8);
}

function summarizeProcess(){
  if(!fs.existsSync(processDoc)) return 'Process doc missing.';
  const txt = fs.readFileSync(processDoc,'utf8');
  const sections = ['Purpose','Pillars','Change Workflow','Drift Detection Strategy','Link & Anchor Integrity','AI Context Generation','Future Enhancements'];
  const out = [];
  for (const s of sections){
    const rx = new RegExp(`^##? ${s}[^\n]*\n([\s\S]*?)(\n## |\n---|$)`,'m');
    const m = txt.match(rx);
    if(m){
      const body = m[1].trim().split('\n').slice(0,5).join('\n');
      out.push(`### ${s}\n${body}${body.endsWith('…')?'':'\n'}`);
    }
  }
  return out.join('\n');
}

function summarizeCoverage(){
  if(!fs.existsSync(codeMap)) return 'Coverage map missing';
  const map = JSON.parse(fs.readFileSync(codeMap,'utf8'));
  const rows = map.mappings.map(m=>`- ${m.code} → ${m.doc}`);
  return `### Code → Doc Coverage\n${rows.join('\n')}`;
}

function summarizeStats(){
  let mdCount = 0; let authoritative = 0;
  if(fs.existsSync(breadcrumbMap)){
    const map = JSON.parse(fs.readFileSync(breadcrumbMap,'utf8'));
    mdCount = Object.keys(map).filter(k=>!k.startsWith('_')).length;
  }
  if(fs.existsSync(processDoc)){
    // heuristic: count 'Authoritative:' occurrences
    const txt = fs.readFileSync(processDoc,'utf8');
    authoritative += (txt.match(/Authoritative:/g)||[]).length; // at least process doc
  }
  return `### Stats\n- Mapped markdown files: ${mdCount}\n- Process doc hash: ${hashFile(processDoc)}\n- Coverage map hash: ${hashFile(codeMap)}\n- Breadcrumb map hash: ${hashFile(breadcrumbMap)}`;
}

function buildSummary(){
  const parts = [summarizeStats(), summarizeProcess(), summarizeCoverage()].filter(Boolean);
  if(!parts.length) parts.push('No governance data available.');
  parts.push('\n_Last updated: '+ new Date().toISOString() +'_');
  return parts.join('\n\n');
}

function updateReadme(){
  if(!fs.existsSync(readme)) throw new Error('README.md not found');
  const content = fs.readFileSync(readme,'utf8');
  const start = '<!-- GOV-SUMMARY:BEGIN -->';
  const end = '<!-- GOV-SUMMARY:END -->';
  const startIdx = content.indexOf(start);
  const endIdx = content.indexOf(end);
  if(startIdx === -1 || endIdx === -1){
    console.error('Markers not found in README. Aborting.');
    process.exit(1);
  }
  const before = content.slice(0, startIdx + start.length);
  const after = content.slice(endIdx);
  const summary = buildSummary();
  const block = `\n<!-- Auto-generated governance summary. Do not edit inside markers; run \`npm run docs:gov\` -->\n${summary}\n`;
  const updated = before + block + after;
  fs.writeFileSync(readme, updated);
  console.log('Governance summary updated (slice mode).');
}

updateReadme();
