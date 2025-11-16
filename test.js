// After getting results, send requests
async function main() {
    const results = await processUrlsSequentially();
    
    // Filter only successful results and send requests
    const successfulResults = results.filter(result => result.status === 'success');
    
    for (const result of successfulResults) {
        try {
            console.log(`📤 Sending request for URL #${result.url_number}`);
            // ✅ Access safeParams directly from the result object
            const response = await makeApiRequest(result.safeParams);
            console.log(`✅ Request successful for URL #${result.url_number}`);
            
            // You can store the response back in the result if needed
            result.apiResponse = response;
            
        } catch (error) {
            console.error(`❌ Request failed for URL #${result.url_number}:`, error.message);
            result.requestStatus = 'failed';
            result.requestError = error.message;
        }
    }
    
    return results;
}