const fs = require('fs/promises');
const fssync = require('fs');
const path = require('path');
const os = require('os');

// The output CSV file lives at the project root
const FILE  = path.resolve(process.cwd(), 'output.csv');
const HEADER = 'url_number,company name,website,state';

// Check if file exists
const exists = () => fssync.existsSync(FILE);

// Escape values for CSV if they contain special characters
const csv = (v = '') =>
  /[",\r\n]/.test(v) ? `"${String(v).replace(/"/g, '""')}"` : String(v);

// Ensure the CSV file exists and has a header
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

// Ensure the file ends with a newline to append new rows cleanly
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

// Track initialization for the lifetime of the process
let READY = false;
async function initOnce() {
  if (READY) return;
  await ensureFile();
  await ensureEndsWithNewline();
  READY = true;
}

/**
 * Append an array of companies to the CSV. Each item can have fields:
 * { name, domain, address:{ State } } or { companyName, website, state }
 */
async function appendCompanies(items = [], urlNumber = '') {
  if (!items.length) return;
  await initOnce();
  const lines =
    items
      .map(it => {
        const company = it.companyName ?? it.name ?? '';
        const website = it.website ?? it.domain ?? '';
        const state   = it.state ?? it.address?.State ?? '';
        return [csv(urlNumber), csv(company), csv(website), csv(state)].join(',');
      })
      .join(os.EOL) + os.EOL;
  await fs.appendFile(FILE, lines, 'utf8');
}

module.exports = { appendCompanies, ensureFile, FILE, initOnce };