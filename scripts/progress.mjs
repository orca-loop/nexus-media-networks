// Reads progress/PART-*.md, prints a summary and rewrites PROGRESS.md.  Run: npm run progress
import fs from 'node:fs';
import path from 'node:path';

const dir = 'progress';
const files = fs.readdirSync(dir).filter((f) => /^PART-\d\.md$/.test(f)).sort();
const icon = { 'DONE': '✅', 'IN PROGRESS': '🟨', 'NEEDS FIX': '⚠️', 'NOT STARTED': '⬜' };

const parts = files.map((f) => {
  const t = fs.readFileSync(path.join(dir, f), 'utf8');
  const get = (re, d) => ((t.match(re) || [])[1] || d).trim();
  return {
    f,
    title: get(/^# (.+)$/m, f),
    status: get(/^Status:\s*(.+)$/m, 'NOT STARTED').toUpperCase(),
    updated: get(/^Updated:\s*(.+)$/m, '-'),
    total: (t.match(/^- \[[ xX]\]/gm) || []).length,
    done: (t.match(/^- \[[xX]\]/gm) || []).length,
  };
});

const open = parts.filter((p) => p.status !== 'DONE');
let next;
if (parts[0] && parts[0].status !== 'DONE') next = 'Part 1 (engine) must be DONE before anything else.';
else if (open.length === 0) next = 'All parts are DONE. Next: run the final polish pass (see README), test on a real phone, then deploy.';
else next = 'Parts that can be built now (in parallel): ' + open.map((p) => p.title.split(':')[0]).join(', ') + '.';

const rows = parts.map((p) => `| ${p.title} | ${icon[p.status] || '❔'} ${p.status} | ${p.done}/${p.total} | ${p.updated} |`).join('\n');
const md = `# Build Progress (auto-generated, do not edit by hand)

Regenerate with \`npm run progress\`. Source of truth: the files in \`progress/\`.

| Part | Status | Checklist | Last updated |
|---|---|---|---|
${rows}

**NEXT:** ${next}
`;
fs.writeFileSync('PROGRESS.md', md);
console.log('\n' + md);
