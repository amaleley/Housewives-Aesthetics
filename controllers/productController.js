import Product from '../models/productModel.js';
import Category from '../models/categoryModel.js';

// Create a new product under a specific category
export const createProduct = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const { name, description, link } = req.body;

    // Ensure file is uploaded
    if (!req.file) {
      return res.status(400).json({ message: 'Product image is required.' });
    }

    const image = req.file.filename;

    // Validate required fields
    if (!name || !description || !link) {
      return res.status(400).json({ message: 'Name, description, and link are required.' });
    }

    // Check if the category exists and is active
    const category = await Category.findById(categoryId);
    if (!category || !category.isActive) {
      return res.status(404).json({ message: 'Active category not found.' });
    }

    // Create and save the new product
    const newProduct = new Product({
      category: categoryId,
      name,
      description,
      image,
      link
    });

    await newProduct.save();

    // Add the product to the category's product list
    category.products.push(newProduct._id);
    await category.save();

    res.status(201).json(newProduct);
  } catch (error) {
    console.error('❌ Error creating product:', error);
    res.status(500).json({ message: error.message || 'Failed to create product.' });
  }
};

// Get all products under a specific category
export const getProductsByCategory = async (req, res) => {
  const { categoryId } = req.params;

  try {
    const products = await Product.find({ category: categoryId });
    res.status(200).json(products);
  } catch (error) {
    console.error('❌ Error fetching products:', error);
    res.status(500).json({ message: 'Failed to fetch products.' });
  }
};



