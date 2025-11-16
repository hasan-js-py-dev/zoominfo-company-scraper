// main.js
const processUrlsSequentially = require('./modules/urlProcessor');
const { createHeaders } = require('./modules/headers');

const { appendCompanies, ensureFile, initOnce } = require('./modules/outputCsv');

const axios = require('axios');

// Delay function
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// main.js - rebuilt pagination logic per spec
async function scrapeAllPagesForUrl(result) {
  const MAX_PAGES = 100;
  const DELAY_MS = 1000;

  const allCompanies = [];
  let pagesProcessed = 0;

  console.log(`\n🚀 Starting scrape for URL #${result.url_number}`);

  // Use a for-loop to simplify page math & off-by-one
  for (let page = 1; page <= MAX_PAGES; page++) {
    try {
      console.log(`📄 Processing page ${page}...`);

      const HEADERS = await createHeaders();
      const safeParams = { ...result.safeParams, page };

      const response = await axios.post(
        "https://app.zoominfo.com/profiles/graphql/companySearch",
        {
          operationName: "companySearch",
          variables: { searchFacadeParams: safeParams },
          query: `query companySearch($searchFacadeParams: CompanyArgs) {
            companySearch(searchFacadeParams: $searchFacadeParams) {
              maxResults
              totalResults
              data {
                name
                domain
                address { State }
              }
            }
          }`,
        },
        { headers: HEADERS }
      );

      const searchData = response?.data?.data?.companySearch;
      const pageData = Array.isArray(searchData?.data) ? searchData.data : [];

      // Per-page/meta logging (for visibility only)
      console.log(
        `ℹ️[URL #${result?.url_number ?? "?"}] API meta (page ${page}): maxResults=${searchData?.maxResults ?? "?"}, totalResults=${searchData?.totalResults ?? "?"}`
      );

      // Stop condition: empty page -> done with this URL
      if (pageData.length === 0) {
        console.log(`✅ No data on page ${page}. Finished this URL.`);
        break;
      }

     // ⬇️ WRITE THIS PAGE TO CSV IMMEDIATELY
      await appendCompanies(pageData);

      // Collect & log
      allCompanies.push(...pageData);
      pagesProcessed++;
      console.log(`✅ Page ${page}: ${pageData.length} companies`);
      console.log(`📊 Total collected so far: ${allCompanies.length}`);

      // No "reached total results" check — we keep going until empty page or 100 pages.

      // Delay before next page (skip delay after last page)
      if (page < MAX_PAGES) {
        console.log(`⏳ Waiting ${DELAY_MS / 1000}s before next page...`);
        await delay(DELAY_MS);
      }
    } catch (err) {
      // Any issue: stop execution here (let caller decide to abort all URLs)
      console.error(`❌ Error on page ${page}:`, err?.message || err);
      throw err; // <-- propagate to abort the run as requested
    }
  }

  // If we hit the hard cap, note it (optional)
  if (pagesProcessed === MAX_PAGES) {
    console.log(`🧭 Hit the page cap (${MAX_PAGES}). Moving to next URL.`);
  }

  return {
    url_number: result.url_number,
    totalPages: pagesProcessed,        // count of pages that had data
    totalCompanies: allCompanies.length,
    companies: allCompanies,
    status: "completed",
  };
}



async function main() {

      await initOnce(); // <-- add this


    const results = await processUrlsSequentially();
    
    const allScrapedData = [];
    
    for (const result of results) {
        if (result.status !== 'success') continue;
        
        try {
            const scrapeResult = await scrapeAllPagesForUrl(result);
            allScrapedData.push(scrapeResult);
            
            // Summary for this URL
            console.log(`\n📊 URL #${result.url_number} COMPLETED:`);
            console.log(`   Pages scraped: ${scrapeResult.totalPages}`);
            console.log(`   Companies found: ${scrapeResult.totalCompanies}`);
            
            // Optional: Save progress after each URL
            // require('fs').writeFileSync('progress.json', JSON.stringify(allScrapedData, null, 2));
            
        } catch (error) {
            console.error(`❌ Failed to scrape URL #${result.url_number}:`, error.message);
        }
        
        // Delay between different URLs
        console.log('⏳ Waiting 5s before next URL...');
        await delay(5000);
    }
    
    // Final summary
    console.log('\n🎉 ALL URLS COMPLETED!');
    console.log('📈 FINAL SUMMARY:');
    allScrapedData.forEach(data => {
        console.log(`   URL #${data.url_number}: ${data.totalCompanies} companies from ${data.totalPages} pages`);
    });
    
    const totalCompanies = allScrapedData.reduce((sum, data) => sum + data.totalCompanies, 0);
    console.log(`\n💰 TOTAL COMPANIES: ${totalCompanies}`);
    
    // Save final results
    const fs = require('fs');
    fs.writeFileSync('final_results.json', JSON.stringify(allScrapedData, null, 2));
    console.log('💾 Results saved to final_results.json');
}

main().catch(console.error);