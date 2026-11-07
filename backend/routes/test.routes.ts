import { Router } from 'express';
import { resetearBase, sembrarBase } from '../database/test-data';

export function crearTestRoutes(): Router {
    const router = Router();

    router.post('/reset', async (_req, res, next) => {
        try {
        await resetearBase();
        res.status(200).json({ ok: true });
        } catch (error) {
        next(error);
        }
    });

    router.post('/seed', async (_req, res, next) => {
        try {
        await sembrarBase();
        res.status(200).json({ ok: true });
        } catch (error) {
        next(error);
        }
    });

    return router;
}