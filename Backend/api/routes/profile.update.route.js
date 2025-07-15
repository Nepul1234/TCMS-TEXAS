import express from 'express'
import { adminProfileUpdate, studentProfileUpdate, teacherProfileUpdate,adminProfilePhotoUpdate, superAdminProfilePhotoUpdate,superAdminProfileUpdate } from '../controllers/profile.update.controller.js';
const router = express.Router();
import multer from 'multer';
import { verifyToken } from '../utils/verifyUser.js';

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.put('/adminProfileUpdate',verifyToken, adminProfileUpdate);
router.put('/studentProfileUpdate',verifyToken, studentProfileUpdate);
router.put('/teacherProfileUpdate',verifyToken, teacherProfileUpdate);
router.put('/superAdminProfileUpdate',verifyToken,  superAdminProfileUpdate); // Assuming super admin uses the same update as admin
router.put('/superAdminProfilePictureUpdate',upload.single('profile_picture'),verifyToken, superAdminProfilePhotoUpdate); // Assuming super admin uses the same update as admin
router.put('/updateAdminProfilePicture',upload.single('profile_picture'), verifyToken, adminProfilePhotoUpdate);


export default router;
