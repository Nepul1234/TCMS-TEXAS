import express from 'express';
import { getAllUserData,deactivateUser } from '../controllers/user.data.controller.js';

const router = express.Router()

router.get('/getAllUserData', getAllUserData);
router.post('/deactivateUser',deactivateUser);

export default router;