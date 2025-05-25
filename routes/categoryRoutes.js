import express from 'express';
import {
  createCategory,
  getCategories,
  terminateCategory
} from '../controllers/categoryController.js';

const router = express.Router();

// Create a new category
router.post('/', createCategory);

// Get all categories
router.get('/', (req, res) => {
  res.send('Categories endpoint is working!');
});


// Soft-delete (terminate) a category by ID
router.put('/:id/terminate', terminateCategory);

export default router;


