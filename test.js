// test.js
// This script demonstrates how you might invoke the URL processing and API
// logic. Note: makeApiRequest is not defined in this repository and would
// need to be implemented to perform API calls beyond what's in main.js.

async function main() {
  const processUrlsSequentially = require('./modules/urlProcessor');
  const results = await processUrlsSequentially();
  // Filter only successful results and send requests
  const successfulResults = results.filter(result => result.status === 'success');
  for (const result of successfulResults) {
    try {
      console.log(`📤 Sending request for URL #${result.url_number}`);
      // Access safeParams directly from the result object
      // Implement makeApiRequest() to perform further API calls
      // const response = await makeApiRequest(result.safeParams);
      console.log(`✅ Request successful for URL #${result.url_number}`);
      // You can store the response back in the result if needed
      // result.apiResponse = response;
    } catch (error) {
      console.error(`❌ Request failed for URL #${result.url_number}:`, error.message);
      result.requestStatus = 'failed';
      result.requestError  = error.message;
    }
  }
  return results;
}

// Only run if this file is executed directly
if (require.main === module) {
  main().catch(err => {
    console.error(err);
    process.exitCode = 1;
  });
}