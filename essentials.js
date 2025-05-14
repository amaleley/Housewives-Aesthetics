const isLocal = ['localhost', '127.0.0.1'].includes(window.location.hostname);
const API_BASE_URL = isLocal ? 'http://localhost:5000' : window.location.origin;

const COUNTRY = window.location.pathname.includes('indexuk') || window.location.pathname.includes('essentialsuk') ? 'uk'
  : window.location.pathname.includes('indexus') || window.location.pathname.includes('essentialsus') ? 'us'
  : 'canada';

const FLAG_EMOJIS = {
  uk: '🇬🇧',
  us: '🇺🇸',
  canada: '🇨🇦'
};

document.addEventListener('DOMContentLoaded', () => {
  const regionSelect = document.getElementById('regionSelect');
  const regionLabel = document.querySelector("label[for='regionSelect']");

  if (regionSelect) {
    regionSelect.value = COUNTRY.charAt(0).toUpperCase() + COUNTRY.slice(1);
  }

  if (regionLabel) {
    regionLabel.textContent = `Shop in: ${FLAG_EMOJIS[COUNTRY] || COUNTRY.toUpperCase()}`;
  }
});

document.getElementById('regionSelect')?.addEventListener('change', function () {
  const region = this.value;

  if (region === 'UK') {
    window.location.href = 'indexuk.html';
  } else if (region === 'US') {
    window.location.href = 'indexus.html';
  } else if (region === 'Canada') {
    window.location.href = 'index.html';
  }
});

document.addEventListener('DOMContentLoaded', async () => {
  const categoriesContainer = document.getElementById('categories');
  const productsContainer = document.getElementById('products');
  const loadingSpinner = document.getElementById('loading');
  const noProductsMessage = document.getElementById('no-products');
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearch');

  let allProducts = [];

  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/categories?country=${COUNTRY}`);
      const categories = await response.json();
      const activeCategories = categories.filter(category => category.isActive);

      categoriesContainer.innerHTML = '';
      activeCategories.forEach(category => {
        const categoryButton = document.createElement('button');
        categoryButton.textContent = category.name;
        categoryButton.className = 'category-button';
        categoryButton.addEventListener('click', () => fetchProductsByCategory(category._id));
        categoriesContainer.appendChild(categoryButton);
      });

      if (activeCategories.length > 0) {
        fetchProductsByCategory(activeCategories[0]._id);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchProductsByCategory = async (categoryId) => {
    try {
      loadingSpinner.style.display = 'block';
      productsContainer.innerHTML = '';
      noProductsMessage.classList.add('hidden');

      const response = await fetch(`${API_BASE_URL}/api/products/${categoryId}`);
      const products = await response.json();

      allProducts = products;
      showProducts(products);
    } catch (error) {
      console.error('Error fetching products:', error);
      productsContainer.innerHTML = '<p>Error loading products.</p>';
    } finally {
      loadingSpinner.style.display = 'none';
    }
  };

  const showProducts = (products) => {
    productsContainer.innerHTML = '';

    if (products.length === 0) {
      noProductsMessage.classList.remove('hidden');
      return;
    }

    noProductsMessage.classList.add('hidden');

    products.forEach(product => {
      const productCard = document.createElement('div');
      productCard.className = 'product';

      const image = document.createElement('img');
      image.src = `${API_BASE_URL}/uploads/${product.image}`;
      image.alt = product.name;

      const name = document.createElement('h4');
      name.textContent = product.name;

      const details = document.createElement('div');
      details.className = 'product-details';

      const description = document.createElement('p');
      description.textContent = product.description;

      const shopButton = document.createElement('a');
      shopButton.href = product.link;
      shopButton.textContent = 'Shop';
      shopButton.target = '_blank';
      shopButton.className = 'shop-button';

      details.appendChild(description);
      details.appendChild(shopButton);

      productCard.appendChild(image);
      productCard.appendChild(name);
      productCard.appendChild(details);

      productCard.addEventListener('click', () => {
        const wasActive = productCard.classList.contains('active');
        document.querySelectorAll('.product').forEach(p => p.classList.remove('active'));
        if (!wasActive) productCard.classList.add('active');
      });

      productsContainer.appendChild(productCard);
    });
  };

  const searchProducts = (query) => {
    const filtered = allProducts.filter(product =>
      product.name.toLowerCase().includes(query.toLowerCase())
    );
    showProducts(filtered);
  };

  searchInput.addEventListener('input', () => {
    searchProducts(searchInput.value);
  });

  clearSearchBtn?.addEventListener('click', () => {
    searchInput.value = '';
    showProducts(allProducts);
  });

  loadingSpinner.style.display = 'block';
  await fetchCategories();
  loadingSpinner.style.display = 'none';
});













  
  