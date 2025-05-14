import Category from '../models/categoryModel.js';
import Product from '../models/productModel.js';

// Create a new category
export const createCategory = async (req, res) => {
  try {
    const { name, country } = req.body;

    if (!name || !country) {
      return res.status(400).json({ error: 'Name and country are required.' });
    }

    const newCategory = new Category({
      name,
      country: country.toLowerCase(),
      isActive: true
    });

    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ error: 'Failed to create category' });
  }
};

// Get all active categories filtered by country
export const getCategories = async (req, res) => {
  try {
    const { country } = req.query;

    const filter = { isActive: true };
    if (country) {
      filter.country = country.toLowerCase();
    }

    const categories = await Category.find(filter).populate('products');
    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
};

// Soft-delete (terminate) a category
export const terminateCategory = async (req, res) => {
  const { id } = req.params;

  try {
    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    category.isActive = false;
    await category.save();

    res.json({ message: 'Category terminated successfully' });
  } catch (error) {
    console.error('Error terminating category:', error);
    res.status(500).json({ message: 'Error terminating category', error });
  }
};





  