document.addEventListener('DOMContentLoaded', () => {
  const COUNTRY = window.location.pathname.includes('adminuk') ? 'uk'
                : window.location.pathname.includes('adminus') ? 'us'
                : 'canada';

  const categoryForm = document.getElementById('category-form');
  const productForm = document.getElementById('product-form');
  const categorySelect = document.getElementById('product-category');
  const existingCategoriesContainer = document.getElementById('existingCategories');

  const countrySelector = document.getElementById('countrySelector');
  if (countrySelector) {
    const currentFile = window.location.pathname.split('/').pop();
    countrySelector.value = currentFile;
    countrySelector.addEventListener('change', (e) => {
      window.location.href = e.target.value;
    });
  }

  // Fetch categories for select and list
  async function fetchCategories() {
    try {
      const response = await fetch('http://localhost:5000/api/categories');
      const categories = await response.json();

      if (!Array.isArray(categories)) {
        console.error('Categories response is not an array:', categories);
        return;
      }

      // Filter by country
      const filteredCategories = categories.filter(cat => cat.country === COUNTRY);

      // Populate dropdown only if there are active categories
      categorySelect.innerHTML = '<option value="" disabled selected>Select a category</option>';

      const activeCategories = filteredCategories.filter(cat => cat.isActive); // Corrected to isActive

      if (activeCategories.length === 0) {
        const option = document.createElement('option');
        option.disabled = true;
        option.textContent = 'No active categories';
        categorySelect.appendChild(option);
      } else {
        activeCategories.forEach(category => {
          const option = document.createElement('option');
          option.value = category._id;
          option.textContent = category.name;
          categorySelect.appendChild(option);
        });
      }

      // Populate list of existing categories
      existingCategoriesContainer.innerHTML = '<h2>Existing Categories</h2>';
      filteredCategories.forEach(category => {
        const div = document.createElement('div');
        div.className = 'category-item';
        div.innerHTML = `
          <strong>${category.name}</strong> - Status: <em>${category.isActive ? 'Active' : 'Terminated'}</em>
          ${category.isActive ? `<button data-id="${category._id}" class="terminate-btn">Terminate</button>` : ''}
        `;
        existingCategoriesContainer.appendChild(div);
      });

      // Re-bind terminate buttons
      document.querySelectorAll('.terminate-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const id = e.target.getAttribute('data-id');
          await terminateCategory(id);
        });
      });
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }

  // Create category
  categoryForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('category-name').value;

    try {
      const response = await fetch('http://localhost:5000/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, country: COUNTRY })
      });

      if (response.ok) {
        alert('Category created!');
        categoryForm.reset();
        await fetchCategories();
      } else {
        const error = await response.json();
        alert(`Failed to create category: ${error.message}`);
      }
    } catch (err) {
      console.error('Error creating category:', err);
    }
  });

  // Create product
  productForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const categoryId = categorySelect.value;
    const name = document.getElementById('product-name').value.trim();
    const description = document.getElementById('product-description').value.trim();
    const image = document.getElementById('product-image').files[0];
    const link = document.getElementById('affiliate-link').value.trim();

    if (!categoryId) {
      alert('Please select a category.');
      return;
    }
    if (!name || !description || !image || !link) {
      alert('Please fill in all product fields.');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('image', image);
    formData.append('link', link);
    formData.append('country', COUNTRY);

    try {
      const response = await fetch(`http://localhost:5000/api/products/${categoryId}`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      if (response.ok) {
        console.log('Product created:', result);
        alert('Product created!');
        productForm.reset();
      } else {
        alert(`Failed to create product: ${result.message || 'Unknown error'}`);
        console.error('Product creation error:', result);
      }
    } catch (err) {
      console.error('Error creating product:', err);
      alert('An error occurred while creating the product.');
    }
  });

  // Soft delete category
  async function terminateCategory(id) {
    try {
      const response = await fetch(`http://localhost:5000/api/categories/${id}/terminate`, {
        method: 'PUT'
      });

      if (response.ok) {
        alert('Category terminated.');
        fetchCategories();
      } else {
        alert('Failed to terminate category.');
      }
    } catch (err) {
      console.error('Error terminating category:', err);
    }
  }

  // Initial load
  fetchCategories();
});

