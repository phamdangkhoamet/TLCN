import { Router } from "express";
const router = Router();

router.get("/", (_, res) => res.json({ ok: true, time: new Date() }));

export default router;
