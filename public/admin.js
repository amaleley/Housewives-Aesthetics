document.addEventListener('DOMContentLoaded', () => {
  const COUNTRY = window.location.pathname.includes('adminuk') ? 'uk'
                : window.location.pathname.includes('adminus') ? 'us'
                : 'canada';

  const API_BASE = 'https://housewives-aesthetics.onrender.com';

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

  async function fetchCategories() {
    try {
      const response = await fetch(`${API_BASE}/api/categories?country=${COUNTRY}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Failed to fetch categories. Status: ${response.status}`);
        console.error('Response body:', errorText);
        alert('Failed to load categories. Please check the server or CORS settings.');
        return;
      }

      const categories = await response.json();

      if (!Array.isArray(categories)) {
        console.error('Categories response is not an array:', categories);
        return;
      }

      categorySelect.innerHTML = '<option value="" disabled selected>Select a category</option>';
      const activeCategories = categories.filter(cat => cat.isActive);

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

      existingCategoriesContainer.innerHTML = '<h2>Existing Categories</h2>';
      categories.forEach(category => {
        const div = document.createElement('div');
        div.className = 'category-item';
        div.innerHTML = `
          <strong>${category.name}</strong> - Status: <em>${category.isActive ? 'Active' : 'Terminated'}</em>
          ${category.isActive ? `<button data-id="${category._id}" class="terminate-btn">Terminate</button>` : ''}
        `;
        existingCategoriesContainer.appendChild(div);
      });

      document.querySelectorAll('.terminate-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const id = e.target.getAttribute('data-id');
          await terminateCategory(id);
        });
      });
    } catch (err) {
      console.error('Error fetching categories:', err);
      alert('A network error occurred while fetching categories.');
    }
  }

  categoryForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('category-name').value.trim();

    if (!name) {
      alert('Category name is required.');
      return;
    }

    try {
      const response = await fetch(`${API_BASE}/api/categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ name, country: COUNTRY })
      });

      if (response.ok) {
        alert('Category created!');
        categoryForm.reset();
        await fetchCategories();
      } else {
        const error = await response.json();
        // ✅ FIXED LINE: correct error object key
        alert(`Failed to create category: ${error.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error creating category:', err);
      alert('An error occurred while creating the category.');
    }
  });

  productForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const categoryId = categorySelect.value;
    const name = document.getElementById('product-name').value.trim();
    const description = document.getElementById('product-description').value.trim();
    const image = document.getElementById('product-image').files[0];
    const link = document.getElementById('affiliate-link').value.trim();

    if (!categoryId || !/^[a-f\d]{24}$/i.test(categoryId)) {
      alert('Please select a valid category.');
      console.warn("Invalid or missing categoryId:", categoryId);
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
      const response = await fetch(`${API_BASE}/api/products/${categoryId}`, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      let result;
      try {
        result = await response.json();
      } catch (jsonErr) {
        console.error('⚠️ Failed to parse JSON response:', jsonErr);
        const text = await response.text();
        console.warn('Response text:', text);
        throw new Error('Invalid server response. Could not parse JSON.');
      }

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

  async function terminateCategory(id) {
    try {
      const response = await fetch(`${API_BASE}/api/categories/${id}/terminate`, {
        method: 'PUT',
        credentials: 'include',
      });

      if (response.ok) {
        alert('Category terminated.');
        fetchCategories();
      } else {
        const error = await response.json();
        alert(`Failed to terminate category: ${error.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error terminating category:', err);
      alert('A network error occurred while terminating the category.');
    }
  }

  fetchCategories();
});




