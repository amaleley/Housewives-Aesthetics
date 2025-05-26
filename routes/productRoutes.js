import express from 'express';
import multer from 'multer';
import { createProduct, getProductsByCategory } from '../controllers/productController.js';

const router = express.Router();

// ===== Multer Storage Setup =====
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Ensure this folder exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// ===== Routes =====

// ✅ Match frontend POST to /api/products/:categoryId
router.post('/:categoryId', upload.single('image'), createProduct);

// GET all products by category (optional)
router.get('/:categoryId/products', getProductsByCategory);

export default router;




