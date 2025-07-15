import {authMiddleware} from '../middleware/auth_middleware.js';

import { Router } from 'express';

const router = Router();

router.get("/dashboard", authMiddleware, (req, res) => {
    res.json({ message: "Welcome to the dashboard", user: req.user });
  });

export default router;
