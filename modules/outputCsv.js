const fs = require('fs/promises');
const fssync = require('fs');
const path = require('path');
const os = require('os');

const FILE = path.resolve(process.cwd(), 'output.csv'); // keep as you had
const HEADER = 'company name,website,state';

const exists = () => fssync.existsSync(FILE);
const csv = (v='') => /[",\r\n]/.test(v) ? `"${String(v).replace(/"/g,'""')}"` : String(v);

async function ensureFile() {
  if (!exists()) {
    await fs.writeFile(FILE, HEADER + os.EOL, 'utf8');
    return;
  }
  const stat = await fs.stat(FILE);
  if (stat.size === 0) {
    await fs.writeFile(FILE, HEADER + os.EOL, 'utf8');
  }
}

async function ensureEndsWithNewline() {
  const stat = await fs.stat(FILE);
  if (stat.size === 0) return;
  const fh = await fs.open(FILE, 'r+');
  try {
    const b = Buffer.alloc(1);
    await fh.read(b, 0, 1, stat.size - 1);
    if (b[0] !== 10 && b[0] !== 13) await fh.write(Buffer.from(os.EOL), stat.size);
  } finally {
    await fh.close();
  }
}

// --- NEW: init once per process (cheap), then append per page immediately ---
let READY = false;
async function initOnce() {
  if (READY) return;
  await ensureFile();
  await ensureEndsWithNewline();
  READY = true;
}

/**
 * items: array like { name, domain, address:{ State } } or { companyName, website, state }
 * Call this AFTER each page fetch to write rows immediately.
 */
async function appendCompanies(items = []) {
  if (!items.length) return;
  await initOnce(); // header + newline ensured once
  const lines = items.map(it => {
    const company = it.companyName ?? it.name ?? '';
    const website = it.website ?? it.domain ?? '';
    const state   = it.state ?? it.address?.State ?? '';
    return [csv(company), csv(website), csv(state)].join(',');
  }).join(os.EOL) + os.EOL;
  await fs.appendFile(FILE, lines, 'utf8'); // writes immediately for this page
}

module.exports = { appendCompanies, ensureFile, FILE, initOnce };
