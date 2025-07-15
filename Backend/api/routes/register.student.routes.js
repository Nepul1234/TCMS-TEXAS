import {registerNewUser} from '../controllers/registration.controller.js';
import { Router } from 'express';
const router = Router();


router.post('/registration',registerNewUser);

export default router;

