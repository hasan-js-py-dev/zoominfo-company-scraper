// modules/headers.js

/**
 * Fetch or generate ZoomInfo authentication tokens.
 * In the original repository these values were long JWTs and session IDs.
 * Replace the placeholder strings below with your own valid tokens.
 */
async function getAuthTokens() {
  return {
    accessToken: 'eyJraWQiOiJRR1lDUW10UGJyQU5weTY0VTkyLW9CT1luZ3RVR1pXUEFjX0NHTGdQckdrIiwiYWxnIjoiUlMyNTYifQ.eyJ2ZXIiOjEsImp0aSI6IkFULlpDQ1U5eXFpN3haY2VTbHd2anVJZzVNZjdJcUdwZmRLQWhWcGQybTRGcmsub2FyM2NmZzNrblB6UGdlTk02OTciLCJpc3MiOiJodHRwczovL29rdGEtbG9naW4uem9vbWluZm8uY29tL29hdXRoMi9kZWZhdWx0IiwiYXVkIjoiYXBpOi8vZGVmYXVsdCIsInN1YiI6ImZnZmdmd3NAZHJvcGdhZGdldHNiZC5jb20iLCJpYXQiOjE3NjMyMTA3MzAsImV4cCI6MTc2MzI5NzEzMCwiY2lkIjoiMG9hOTlkc21ibkF4bGV2RjM2OTYiLCJ1aWQiOiIwMHV0ejhoam1zRTRxMG9kWjY5NyIsInNjcCI6WyJvZmZsaW5lX2FjY2VzcyIsInByb2ZpbGUiLCJvcGVuaWQiLCJlbWFpbCJdLCJhdXRoX3RpbWUiOjE3NjMyMTA3MjksImxhc3ROYW1lIjoiQWhtZWQiLCJ6aVNlc3Npb25UeXBlIjotMywiemlHcm91cElkIjowLCJ6aUNvbXBhbnlQcm9maWxlSWQiOiIiLCJ6aVBsYXRmb3JtcyI6WyJDT01NVU5JVFkiXSwiemlBZG1pblJvbGVzIjoiIiwiemlVc2VybmFtZSI6ImZnZmdmd3NAZHJvcGdhZGdldHNiZC5jb20iLCJmaXJzdE5hbWUiOiJTdWpvbiIsInppUm9sZXMiOiJCcVFnUnNnNWdFRUF3QmdBd0dVQUFBQUVBQUFBQUFBUUFBQUFBQUFBQUFBQUFBQkFBQUFBQUFBd0FBQUFBQUFBQUFBSSIsInppVXVpZCI6IjQwNGE3MGEzLTFjYzItNDNhNS1iM2FhLTQ1NTk4ZGM5OTIzYSIsInppVXNlcklkIjozMzA2Mjc0Nywic2ZDb250YWN0SWQiOiIwMDM3eTAwMDAxTjhjN0tBQVIiLCJ6aUluYWN0aXZpdHkiOjYwNDgwMCwibm9Db3BpbG90V1NBY2Nlc3MiOnRydWUsInppVGVuYW50SWQiOjIxMzU0NzkzLCJlbWFpbCI6ImZnZmdmd3NAZHJvcGdhZGdldHNiZC5jb20iLCJzZkFjY291bnRJZCI6IjAwMTd5MDAwMDFPYUNoN0FBRiIsInppTW9uZ29Vc2VySWQiOiIzMzA2Mjc0NyJ9.T0PjsKTpUVB33WSirdfhaMbQf1n1O0DjncNbdVwO26VsBKKeU6FlgLCiWYqbfjAHFKeABt0R9Y_uTq_VjZwWr5vD8pntItKt7zCoSCRubU_1ltJKQvMQV_7eIA20sNzMj_oL-A__NVc_Do6p6lVvYZyTfxELUaCfccNOCsPd6GUvjUzg7UI0rNyLTqkYDXP0ZqxzcSSpAI520-oo17HBxwaKJGFU4rUrZ3iAsXaHvI7N53w3XVoyA-fQMBGdUYVkPZDdAT-lqHnReMPxSSGfqsBUqYMfsAKPAs9NFudfeDL0lsqBPFc740AJfSmmnjMdKU0lX3VACzAAj-aYVUQl5A',
    sessionId:   'buPBac3tevcB-G0eyJI5FEn6NQCDTwpv8-uWF3vKS6JLIb8x9Mtdb2RZB8fjdOi4R3jC024v5SFGXc_BBRDQIA3SGGWHjsOYCqigFp-z07i69pE8NEOuYKbersyAvwk0',
    ziid:        'buPBac3tevcB-G0eyJI5FEn6NQCDTwpv8-uWF3vKS6JLIb8x9Mtdb2RZB8fjdOi4R3jC024v5SHTkrHrVhq2QA',
  };
}

/**
 * Construct headers required for ZoomInfo GraphQL requests.
 */
async function createHeaders() {
  try {
    const { accessToken, sessionId, ziid } = await getAuthTokens();
    const HEADERS = {
      'Content-Type': 'application/json',
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      Origin: 'https://app.zoominfo.com',
      Referer: 'https://app.zoominfo.com/',
      Cookie: `ziaccesstoken=${accessToken}; ziid=${ziid}; zisession=${sessionId}`,
      'x-ziaccesstoken': accessToken,
      'x-ziid': ziid,
      'x-zisession': sessionId,
    };
    return HEADERS;
  } catch (error) {
    throw new Error(`Failed to create headers: ${error.message}`);
  }
}

module.exports = { createHeaders };