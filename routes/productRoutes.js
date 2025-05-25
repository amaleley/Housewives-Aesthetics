import express from 'express';
import multer from 'multer';
import { createProduct, getProductsByCategory } from '../controllers/productController.js';

const router = express.Router();

// ===== Multer Storage Setup =====
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // make sure 'uploads' folder exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// ===== Routes =====

// Create a new product under a specific category
router.post('/:categoryId/products', upload.single('image'), createProduct);

// Get all products under a specific category
router.get('/:categoryId/products', getProductsByCategory);

export default router;



