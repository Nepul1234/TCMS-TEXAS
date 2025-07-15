import express from 'express';
import { 
  upload, 
  uploadFilesToAzure, 
  deleteFileFromAzure, 
  listCourseFiles
} from '../controllers/azure.file.controller.js';


const router = express.Router();

// Upload files to Azure Blob Storage
router.post('/upload', upload.array('files', 10), uploadFilesToAzure);

// Delete file from Azure Blob Storage
router.delete('/delete', deleteFileFromAzure);

// List files for a course
router.get('/course/:courseId', listCourseFiles);

export default router;