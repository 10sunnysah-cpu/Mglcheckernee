// api/proxy.js
export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Sirf POST allow
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // ─── MGL API ENDPOINT ───
  const targetUrl = 'https://www.mahanagargas.com/ajax/get-billing-details';

  try {
    // ─── BODY KO PROPERLY HANDLE KAREIN ───
    let bodyString = '';

    if (typeof req.body === 'string') {
      bodyString = req.body;
    } else if (req.body && typeof req.body === 'object') {
      const params = new URLSearchParams();
      for (const [key, value] of Object.entries(req.body)) {
        params.append(key, value);
      }
      bodyString = params.toString();
    } else {
      // Default fallback
      const params = new URLSearchParams();
      params.append('bpNumber', '1100081583');
      params.append('bp', '1100081583');
      params.append('bp_number', '1100081583');
      bodyString = params.toString();
    }

    console.log('Sending to MGL:', bodyString);

    // ─── MGL API CALL ───
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'Mozilla/5.0 (compatible; MGL-Fetcher/1.0)',
        'Accept': 'application/json, text/plain, */*',
      },
      body: bodyString,
    });

    const data = await response.text();

    // ─── RESPONSE WAPAS ───
    res.status(response.status).send(data);
  } catch (error) {
    console.error('Proxy error:', error);
    res.status(500).json({
      error: 'Internal server error',
      details: error.message,
      stack: error.stack,
    });
  }
}
