// routes/productRoutes.js
import express from 'express';
import multer from 'multer';
import { createProduct, getProductsByCategory } from '../controllers/productController.js';
import Product from '../models/productModel.js';

const router = express.Router();

// Multer configuration for storing uploaded images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage });

// ✅ Static route FIRST to avoid matching errors
router.get('/all-products', async (req, res) => {
  try {
    const products = await Product.find({});
    res.json(products);
  } catch (error) {
    console.error('Error fetching all products:', error);
    res.status(500).json({ message: 'Failed to fetch products.' });
  }
});

// ✅ Route to create a product under a category
router.post('/:categoryId', upload.single('image'), createProduct);

// ✅ Route to get all products in a category
router.get('/:categoryId', getProductsByCategory);

export default router;


