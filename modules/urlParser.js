// modules/urlParser.js
const { v4: uuidv4 } = require('uuid');

/**
 * Parse a ZoomInfo search URL. The URL has a base64-encoded JSON query
 * embedded in the fragment. This function decodes and normalizes it.
 */
async function parseZoomInfoUrl(zoomInfoUrl) {
  try {
    const parsedUrl = new URL(zoomInfoUrl);
    const hash = parsedUrl.hash;
    if (!hash || !hash.includes('?')) {
      throw new Error('Invalid ZoomInfo URL format - missing query parameters in hash');
    }
    // Extract the query string from the hash
    const hashQueryString = hash.split('?')[1];
    const searchParams    = new URLSearchParams(hashQueryString);
    const encodedQuery    = searchParams.get('query');
    if (!encodedQuery) {
      throw new Error('Query parameter not found in URL');
    }
    // Decode base64 data
    const urlDecodedString = decodeURIComponent(encodedQuery);
    const decodedData      = Buffer.from(urlDecodedString, 'base64').toString('utf-8').trim();
    const queryParams      = JSON.parse(decodedData);
    // Keep US_MetroRegion as comma-separated string
    if (queryParams.US_MetroRegion) {
      console.log('🔄 Processing US_MetroRegion:', queryParams.US_MetroRegion);
      queryParams.metroRegion = String(queryParams.US_MetroRegion)
        .split(',')
        .map(region => region.trim())
        .filter(region => region)
        .join(',');
      console.log('✅ Converted to metroRegion string:', queryParams.metroRegion);
      delete queryParams.US_MetroRegion;
    }
    // Keep US_States as comma-separated string
    if (queryParams.US_States) {
      console.log('🔄 Processing US_States:', queryParams.US_States);
      queryParams.state = String(queryParams.US_States)
        .split(',')
        .map(s => s.trim())
        .filter(s => s)
        .join(',');
      console.log('✅ Converted to state string:', queryParams.state);
      delete queryParams.US_States;
    }
    return queryParams;
  } catch (error) {
    throw new Error(`Failed to parse URL: ${error.message}`);
  }
}

/**
 * Build a fresh search parameter object for each request. It enforces
 * certain defaults and overrides values that can be unsafe to reuse.
 */
function createSafeSearchParams(urlParams, currentPage) {
  const sessionSearchUUID = uuidv4();
  const safeParams = { ...urlParams };
  safeParams.searchUUID         = sessionSearchUUID;
  safeParams.rpp                = 100;
  safeParams.locationSearchType = 'HQ';
  safeParams.useUnifiedSearch   = true;
  safeParams.timestamp          = Date.now();
  safeParams.page               = currentPage;
  // Always exclude records with no company
  if (safeParams.excludeNoCompany === 'false') {
    safeParams.excludeNoCompany = 'true';
    console.log('✅ Fixed excludeNoCompany: "false" → "true"');
  } else if (!safeParams.excludeNoCompany || safeParams.excludeNoCompany === true) {
    safeParams.excludeNoCompany = 'true';
  }
  return safeParams;
}

module.exports = {
  parseZoomInfoUrl,
  createSafeSearchParams,
};