import express from 'express';
import {
  createCategory,
  getCategories,
  terminateCategory
} from '../controllers/categoryController.js';

const router = express.Router();

router.post('/', createCategory);
router.get('/', getCategories);
router.put('/:id/terminate', terminateCategory);

export default router;

