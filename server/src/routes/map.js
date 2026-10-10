const express = require('express');
const router = express.Router();

// Memory cache for tiles to make loading instantaneous
const tileCache = new Map();
const MAX_CACHE_SIZE = 500;

// GET /api/map/tile?lyrs=m&x=47367&y=30401&z=16
router.get('/tile', async (req, res) => {
  const { lyrs = 'm', x, y, z } = req.query;

  if (x === undefined || y === undefined || z === undefined) {
    return res.status(400).send('Missing x, y, or z tile coordinates');
  }

  const cacheKey = `${lyrs}_${z}_${x}_${y}`;
  if (tileCache.has(cacheKey)) {
    const cached = tileCache.get(cacheKey);
    res.setHeader('Content-Type', cached.contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.send(cached.buffer);
  }

  // Subdomain rotation for speed
  const sub = Math.abs((parseInt(x, 10) + parseInt(y, 10)) % 4);
  const googleUrl = `https://mt${sub}.google.com/vt/lyrs=${encodeURIComponent(lyrs)}&x=${encodeURIComponent(x)}&y=${encodeURIComponent(y)}&z=${encodeURIComponent(z)}`;

  try {
    const response = await fetch(googleUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8'
      }
    });

    if (response.ok) {
      const buffer = Buffer.from(await response.arrayBuffer());
      const contentType = response.headers.get('content-type') || 'image/png';

      if (tileCache.size >= MAX_CACHE_SIZE) {
        // Evict oldest entry
        const firstKey = tileCache.keys().next().value;
        tileCache.delete(firstKey);
      }
      tileCache.set(cacheKey, { buffer, contentType });

      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.send(buffer);
    } else {
      console.warn(`[MapProxy] Google tile HTTP ${response.status} for ${z}/${x}/${y}, trying fallback...`);
    }
  } catch (err) {
    console.error(`[MapProxy] Error fetching Google tile:`, err.message);
  }

  // Resilient Fallback to OpenStreetMap if Google ever times out or fails
  try {
    const fallbackUrl = `https://tile.openstreetmap.org/${encodeURIComponent(z)}/${encodeURIComponent(x)}/${encodeURIComponent(y)}.png`;
    const fbResponse = await fetch(fallbackUrl, {
      headers: { 'User-Agent': 'HealixPhysioApp/2.0' }
    });

    if (fbResponse.ok) {
      const buffer = Buffer.from(await fbResponse.arrayBuffer());
      res.setHeader('Content-Type', 'image/png');
      res.setHeader('Cache-Control', 'public, max-age=86400');
      return res.send(buffer);
    }
  } catch (fallbackErr) {
    console.error(`[MapProxy] Fallback also failed:`, fallbackErr.message);
  }

  res.status(502).send('Failed to fetch map tile');
});

module.exports = router;
