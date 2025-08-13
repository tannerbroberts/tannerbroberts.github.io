#!/usr/bin/env node
/**
 * Build a machine-readable documentation graph used to prime AI agent prompts.
 * Output: docs/doc-graph.json
 * Structure:
 * {
 *   generated: ISO_DATE,
 *   nodes: [
 *     {
 *       path,          // relative file path
 *       title,         // first H1 text
 *       breadcrumb,    // parsed breadcrumb line
 *       size,          // bytes
 *       headings: [h2,h3...],
 *       openQuestions: [...lines containing 'Open Questions' section bullet points],
 *       excerpt: "first N non-empty lines (<=800 chars)",
 *       lastModifiedEpoch
 *     }
 *   ]
 * }
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'docs', 'doc-graph.json');
const MAP = path.join(ROOT, 'docs', 'breadcrumb-map.json');
const MAX_EXCERPT_CHARS = 800;

function relativize(p){return p.replace(ROOT+path.sep,'').replace(/\\/g,'/');}

async function collect(dir){
  const out=[]; const entries=await fs.readdir(dir,{withFileTypes:true});
  for(const e of entries){
    if(e.name.startsWith('.')) continue;
    const full=path.join(dir,e.name);
    if(e.isDirectory()) out.push(...await collect(full));
    else if(e.isFile() && e.name.endsWith('.md')) out.push(full);
  }
  return out;
}

function parse(content){
  const lines=content.split(/\r?\n/);
  let title=null, breadcrumb=null; const headings=[]; const openQuestions=[]; let inOpen=false;
  for(let i=0;i<lines.length;i++){
    const l=lines[i];
    if(!title){
      const m=l.match(/^#\s+(.+)/); if(m){ title=m[1].trim(); continue; }
    }
    if(!breadcrumb){
      const b=l.match(/^Breadcrumb:\s*(.+)$/); if(b){ breadcrumb=b[1].trim(); continue; }
    }
    const h=l.match(/^(##+)\s+(.+)/); if(h){ headings.push(h[2].trim()); }
    if(/Open Questions/i.test(l)) { inOpen=true; continue; }
    if(inOpen){
      if(/^\s*-\s+/.test(l)) openQuestions.push(l.trim().replace(/^[-*]\s+/,''));
      else if(l.trim()===''){ /* keep going */ } else if(/^#/ .test(l)) inOpen=false;
    }
  }
  const excerptLines=[]; for(const l of lines){ if(l.trim()){ excerptLines.push(l.trim()); } if(excerptLines.join(' ').length>MAX_EXCERPT_CHARS) break; }
  return { title, breadcrumb, headings, openQuestions, excerpt: excerptLines.join(' ').slice(0,MAX_EXCERPT_CHARS)};
}

async function main(){
  const mapRaw=JSON.parse(await fs.readFile(MAP,'utf8'));
  const files=[...new Set(Object.keys(mapRaw).filter(k=>!k.startsWith('_')) )];
  // include any additional docs/*.md not in map
  const allDocs=await collect(path.join(ROOT,'docs'));
  const extra=allDocs.map(relativize).filter(f=>!files.includes(f));
  files.push(...extra);
  const nodes=[];
  for(const rel of files){
    const full=path.join(ROOT, rel);
    try {
      const stat=await fs.stat(full);
      const content=await fs.readFile(full,'utf8');
      const parsed=parse(content);
      nodes.push({
        path: rel,
        title: parsed.title || null,
        breadcrumb: parsed.breadcrumb || mapRaw[rel] || null,
        size: stat.size,
        headings: parsed.headings,
        openQuestions: parsed.openQuestions,
        excerpt: parsed.excerpt,
        lastModifiedEpoch: Math.floor(stat.mtimeMs)
      });
    } catch(e){
      nodes.push({ path: rel, error: e.message });
    }
  }
  const out={ generated:new Date().toISOString(), nodes };
  await fs.writeFile(OUT, JSON.stringify(out,null,2)+"\n");
  console.log(`Wrote ${nodes.length} doc nodes to ${relativize(OUT)}`);
}

main().catch(e=>{ console.error(e); process.exit(1); });
