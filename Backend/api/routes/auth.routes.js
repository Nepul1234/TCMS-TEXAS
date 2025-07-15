import {signin, verifyToken} from '../controllers/auth.controller.js';
import { Router } from 'express';
const router = Router();


router.post('/signin',signin);
router.post('/verify', verifyToken);

export default router;
