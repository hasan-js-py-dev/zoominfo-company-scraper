// modules/urlParser.js
const querystring = require('querystring');
const url = require('url');
const { v4: uuidv4 } = require('uuid');


async function parseZoomInfoUrl(zoomInfoUrl) {
    try {
        // Parse the URL
        const parsedUrl = new URL(zoomInfoUrl);
        
        // Get the query parameter from the hash fragment
        const hash = parsedUrl.hash;
        
        if (!hash || !hash.includes('?')) {
            throw new Error('Invalid ZoomInfo URL format - missing query parameters in hash');
        }
        
        // Extract the query string from the hash
        const hashQueryString = hash.split('?')[1];
        const searchParams = new URLSearchParams(hashQueryString);
        
        // Get the encoded query parameter
        const encodedQuery = searchParams.get('query');
        
        if (!encodedQuery) {
            throw new Error('Query parameter not found in URL');
        }
        
        // URL-decode the Base64 string (convert %3D back to =)
        const urlDecodedString = decodeURIComponent(encodedQuery);
        
        // Decode Base64
        const decodedData = Buffer.from(urlDecodedString, 'base64').toString('utf-8').trim();
        
        // Parse JSON
        const queryParams = JSON.parse(decodedData);


    

         // ✅ FIX: Keep US_MetroRegion as STRING, don't convert to array
        if (queryParams.US_MetroRegion) {
            console.log('🔄 Processing US_MetroRegion:', queryParams.US_MetroRegion);
            
            // Just clean up the string, don't convert to array
            queryParams.metroRegion = queryParams.US_MetroRegion
                .split(',')
                .map(region => region.trim())
                .filter(region => region && region !== '')
                .join(','); // ← JOIN BACK TO STRING!
            
            console.log('✅ Converted to metroRegion string:', queryParams.metroRegion);
            delete queryParams.US_MetroRegion;
        }


        // ✅ NEW: Keep US_States as STRING, comma-separated (never an array)
if (queryParams.US_States) {
  console.log('🔄 Processing US_States:', queryParams.US_States);

  queryParams.state = String(queryParams.US_States)
    .split(',')
    .map(s => s.trim())
    .filter(s => s !== '')
    .join(','); // ← back to a single string like "California" or "California,Texas"

  console.log('✅ Converted to state string:', queryParams.state);
  delete queryParams.US_States; // remove original key
}



            


        
        return queryParams;
        
    } catch (error) {
        throw new Error(`Failed to parse URL: ${error.message}`);
    }
}




function createSafeSearchParams(urlParams, currentPage) 

{

    const sessionSearchUUID = uuidv4();
    
    // Start with all parameters from the URL
    const safeParams = { ...urlParams };
    
    // PROTECTED DEFAULTS - These will always override URL parameters



    safeParams.searchUUID = sessionSearchUUID;

    safeParams.rpp = 100;

    safeParams.locationSearchType = "HQ";

    safeParams.useUnifiedSearch = true;

    safeParams.timestamp = Date.now();

    safeParams.page = currentPage; 


    // ✅ FIX: Convert excludeNoCompany from "false" to "true"
    if (safeParams.excludeNoCompany === "false") {
        safeParams.excludeNoCompany = "true";
        console.log('✅ Fixed excludeNoCompany: "false" → "true"');
    }
    // Also handle if it's already true or undefined
    else if (!safeParams.excludeNoCompany || safeParams.excludeNoCompany === true) {
        safeParams.excludeNoCompany = "true";
    }


    
    return safeParams;
}

module.exports = {
    parseZoomInfoUrl,
    createSafeSearchParams
};