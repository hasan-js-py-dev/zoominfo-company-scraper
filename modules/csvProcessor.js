// modules/csvProcessor.js

const path = require('path');
const fs   = require('fs');
const Papa = require('papaparse');

// Read and parse the input.csv file. Ensures headers and returns row data.
async function csvProcessor() {
  // Resolve input.csv relative to project root
  const filePath = path.join(__dirname, '..', 'input.csv');
  // Ensure the file exists
  if (!fs.existsSync(filePath)) {
    throw new Error('❌ File not found');
  }
  console.log('✅ CSV path:', filePath);
  // Read file contents
  const fileData = fs.readFileSync(filePath, 'utf-8');
  // Parse CSV
  const parsed = Papa.parse(fileData, {
    header: true,
    skipEmptyLines: true,
  });
  // Check headers
  const headers = parsed.meta.fields;
  const expectedHeaders = ['url_number', 'url'];
  for (const header of expectedHeaders) {
    if (!headers.includes(header)) {
      throw new Error(`❌ Missing required header: ${header}`);
    }
  }
  console.log('✅ Headers are valid:', headers);
  console.log('✅ Rows parsed:', parsed.data);
  return parsed.data;
}

module.exports = csvProcessor;