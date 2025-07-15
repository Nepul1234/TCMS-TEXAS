import { Router } from 'express';
import authMiddleware from '../middleware/auth_middleware.js';

const router = Router();

router.get("/dashboard", authMiddleware, (req, res) => {
    res.json({ message: "Welcome to the dashboard", user: req.user });
  });

export default router;