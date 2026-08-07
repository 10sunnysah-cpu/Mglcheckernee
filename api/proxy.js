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

  // MGL API endpoint
  const targetUrl = 'https://www.mahanagargas.com/ajax/get-billing-details';

  try {
    // ─── VERCEL SE RAW BODY KAISE LEIN ───
    // Vercel mein body string format mein aati hai
    let bodyString = '';

    if (req.body) {
      // Agar req.body object hai toh stringify karein
      if (typeof req.body === 'object') {
        // URLSearchParams ke liye
        if (req.body instanceof URLSearchParams) {
          bodyString = req.body.toString();
        } else {
          // Plain object ko URL encoded string mein convert karein
          const params = new URLSearchParams();
          for (const [key, value] of Object.entries(req.body)) {
            params.append(key, value);
          }
          bodyString = params.toString();
        }
      } else {
        bodyString = req.body;
      }
    }

    // ─── DEFAULT PARAMS (agar body empty hai) ───
    if (!bodyString) {
      // Default BP number daalein
      const defaultParams = new URLSearchParams();
      defaultParams.append('bpNumber', '1100081583');
      defaultParams.append('bp', '1100081583');
      defaultParams.append('bp_number', '1100081583');
      bodyString = defaultParams.toString();
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
