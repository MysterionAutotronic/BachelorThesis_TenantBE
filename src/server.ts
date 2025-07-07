import express, { Request, Response } from 'express';
import { readFileSync } from 'fs';
import NodeCache from 'node-cache';
import { Handler } from 'express-serve-static-core';

/* ------------------------------------------------------------------ */
/* cache setup                                                        */
/* ------------------------------------------------------------------ */

const cache = new NodeCache({
    stdTTL: 0,
    checkperiod: 300,
});

const CONFIG_TTL = 60 * 60 * 24;

/* ------------------------------------------------------------------ */
/* express app                                                        */
/* ------------------------------------------------------------------ */

const app = express();
app.use(express.json());

const getConfig: Handler = async (req: Request, res: Response): Promise<void> => {
    const hit = cache.get('config');
    if (hit) {
        res.json({ cached: true, data: hit });
        return;
    }

    try {
        const rawConfig = readFileSync('data/config.json', 'utf-8');
        const parsed = JSON.parse(rawConfig);

        cache.set('config', parsed, CONFIG_TTL);
        res.json(parsed);
    } catch (e) {
        console.error('[config] load failed:', e);
        res.status(500).json({ error: 'Failed to load configuration' });
    }
}

app.get('/config', getConfig);

/* ------------------------------------------------------------------ */
/* start server                                                        */
/* ------------------------------------------------------------------ */

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 API ready on http://localhost:${PORT}`);
});
