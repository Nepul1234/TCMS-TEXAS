import express from 'express';
import { 
  createCourseMaterial,
  getCourseMaterials,
  getMaterialById,        
  updateCourseMaterial,   
  deleteCourseMaterial,   
  toggleMaterialStatus,  
  getMaterialStats       
} from '../controllers/course.material.controller.js';

const router = express.Router();

router.get('/course/:courseId', getCourseMaterials);
router.get('/course/:courseId/stats', getMaterialStats);  
router.get('/:materialId', getMaterialById);             
router.post('/', createCourseMaterial);
router.put('/:materialId', updateCourseMaterial);       
router.put('/:materialId/toggle', toggleMaterialStatus);  
router.delete('/:materialId', deleteCourseMaterial);     

export default router;