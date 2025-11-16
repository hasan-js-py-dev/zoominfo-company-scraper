// modules/urlProcessor.js

const csvProcessor = require('./csvProcessor');

const { parseZoomInfoUrl, createSafeSearchParams } = require('./urlParser');

async function processUrlsSequentially() {

    try {

        const rows = await csvProcessor();

        const processedUrls = new Set();

        const results = [];

        for (const row of rows) {

            const { url_number, url } = row;
            
            if (processedUrls.has(url)) {

                console.log(`⏭️  Skipping duplicate URL #${url_number}`);

                continue;
            }

            console.log(`🔗 Starting URL #${url_number}`);
            
            try {

                // This await ensures completion before next iteration

                const queryParams = await parseZoomInfoUrl(url);

                const safeParams = await createSafeSearchParams(queryParams, 1);
                
                results.push({
                    url_number,
                    url,
                    safeParams,
                    status: 'success'
                });
                
                processedUrls.add(url);

                console.log(`✅ Finished URL #${url_number}`);
                
            } catch (error) {
                results.push({
                    url_number,
                    url,
                    error: error.message,
                    status: 'failed'
                });

                console.error(`❌ Failed URL #${url_number}:`, error.message);

                break;
            }
            
            // Optional: Add delay between requests if needed
            // await new Promise(resolve => setTimeout(resolve, 1000));
        }

        console.log(results);
        return results;
        
    } catch (error) {
        throw new Error(`URL processing failed: ${error.message}`);
    }
}

module.exports = processUrlsSequentially;