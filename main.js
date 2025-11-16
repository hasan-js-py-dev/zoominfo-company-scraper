// main.js
const processUrlsSequentially = require('./modules/urlProcessor');
const { createHeaders } = require('./modules/headers');
const { appendCompanies, ensureFile, initOnce } = require('./modules/outputCsv');

const axios = require('axios');

// Delay helper
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Scrape all pages for a given URL result
async function scrapeAllPagesForUrl(result) {
  const MAX_PAGES = 100;
  const DELAY_MS  = 1000;
  const allCompanies = [];
  let pagesProcessed = 0;

  console.log(`\n🚀 Starting scrape for URL #${result.url_number}`);

  // Iterate up to the hard cap or until no results
  for (let page = 1; page <= MAX_PAGES; page++) {
    try {
      console.log(`📄 Processing page ${page}...`);
      // Fresh headers per request
      const HEADERS = await createHeaders();
      // Merge current page into safe params
      const safeParams = { ...result.safeParams, page };
      // Send GraphQL request
      const response = await axios.post(
        'https://app.zoominfo.com/profiles/graphql/companySearch',
        {
          operationName: 'companySearch',
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
      // Extract data safely
      const searchData = response?.data?.data?.companySearch;
      const pageData   = Array.isArray(searchData?.data) ? searchData.data : [];
      console.log(
        `ℹ️[URL #${result?.url_number ?? '?'}] API meta (page ${page}): maxResults=${searchData?.maxResults ?? '?'}, totalResults=${searchData?.totalResults ?? '?'}`
      );
      // Stop if no data
      if (pageData.length === 0) {
        console.log(`✅ No data on page ${page}. Finished this URL.`);
        break;
      }
      // Write page to CSV and collect
      await appendCompanies(pageData, result.url_number);
      allCompanies.push(...pageData);
      pagesProcessed++;
      console.log(`✅ Page ${page}: ${pageData.length} companies`);
      console.log(`📊 Total collected so far: ${allCompanies.length}`);
      // Delay before next page except on last iteration
      if (page < MAX_PAGES) {
        console.log(`⏳ Waiting ${DELAY_MS / 1000}s before next page...`);
        await delay(DELAY_MS);
      }
    } catch (err) {
      console.error(`❌ Error on page ${page}:`, err?.message || err);
      throw err;
    }
  }
  // Note when hitting the hard cap
  if (pagesProcessed === MAX_PAGES) {
    console.log(`🧭 Hit the page cap (${MAX_PAGES}). Moving to next URL.`);
  }
  return {
    url_number: result.url_number,
    totalPages: pagesProcessed,
    totalCompanies: allCompanies.length,
    companies: allCompanies,
    status: 'completed',
  };
}

// Main entrypoint
async function main() {
  await initOnce();
  const results = await processUrlsSequentially();
  const allScrapedData = [];
  for (const result of results) {
    if (result.status !== 'success') continue;
    try {
      const scrapeResult = await scrapeAllPagesForUrl(result);
      allScrapedData.push(scrapeResult);
      console.log(`\n📊 URL #${result.url_number} COMPLETED:`);
      console.log(`   Pages scraped: ${scrapeResult.totalPages}`);
      console.log(`   Companies found: ${scrapeResult.totalCompanies}`);
    } catch (error) {
      console.error(`❌ Failed to scrape URL #${result.url_number}:`, error.message);
    }
    console.log('⏳ Waiting 5s before next URL...');
    await delay(5000);
  }
  // Final summary
  console.log('\n🎉 ALL URLS COMPLETED!');
  console.log('📈 FINAL SUMMARY:');
  allScrapedData.forEach(data => {
    console.log(
      `   URL #${data.url_number}: ${data.totalCompanies} companies from ${data.totalPages} pages`
    );
  });
  const totalCompanies = allScrapedData.reduce(
    (sum, data) => sum + data.totalCompanies,
    0
  );
  console.log(`\n💰 TOTAL COMPANIES: ${totalCompanies}`);
  const fs = require('fs');
  fs.writeFileSync('final_results.json', JSON.stringify(allScrapedData, null, 2));
  console.log('💾 Results saved to final_results.json');
}

main().catch(console.error);