import { Request, Response, Router } from 'express';

const router = Router();

// Adzuna API search endpoint
router.post('/api/search-jobs', async (req: Request, res: Response) => {
  try {
    const { what, where, country } = req.body;

    const appId = process.env.ADZUNA_APP_ID;
    const appKey = process.env.ADZUNA_APP_KEY;

    if (!appId || !appKey) {
      return res.status(500).json({
        error: "Adzuna API credentials not configured. Please add ADZUNA_APP_ID and ADZUNA_APP_KEY to your .env file."
      });
    }

    // Build the Adzuna API URL
    const url = new URL(`https://api.adzuna.com/v1/api/jobs/${country}/search/1`);
    url.searchParams.append('app_id', appId);
    url.searchParams.append('app_key', appKey);
    url.searchParams.append('results_per_page', '20');
    url.searchParams.append('content-type', 'application/json');

    if (what) url.searchParams.append('what', what);
    if (where) url.searchParams.append('where', where);

    const response = await fetch(url.toString());
    const data = await response.json();

    return res.json({ results: data.results || [] });
  } catch (error) {
    console.error('Adzuna API error:', error);
    return res.status(500).json({ error: "Failed to search jobs" });
  }
});

export default router;