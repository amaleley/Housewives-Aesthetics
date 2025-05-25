import express from 'express';
import {
  createCategory,
  getCategories,
  terminateCategory
} from '../controllers/categoryController.js';

const router = express.Router();

// Debug/test route
router.get('/test', (req, res) => {
  res.json({ message: 'Test route working' });
});

router.post('/', createCategory);
router.get('/', getCategories);
router.put('/:id/terminate', terminateCategory);

export default router;



