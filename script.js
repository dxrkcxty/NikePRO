// Клас для роботи з товарами
class ProductManager {
    constructor() {
        this.products = JSON.parse(localStorage.getItem('products')) || [];
        this.currentPage = 1;
        this.productsPerPage = 4;
        this.setupEventListeners();
        this.renderProducts();
    }

    // Збереження товарів в LocalStorage
    saveProducts() {
        localStorage.setItem('products', JSON.stringify(this.products));
    }

    // Додавання нового товару
    addProduct(product) {
        this.products.push(product);
        this.saveProducts();
        this.renderProducts();
    }

    // Оновлення товару
    updateProduct(id, updatedProduct) {
        const index = this.products.findIndex(p => p.id === id);
        if (index !== -1) {
            this.products[index] = { ...this.products[index], ...updatedProduct };
            this.saveProducts();
            this.renderProducts();
        }
    }

    // Видалення товару
    deleteProduct(id) {
        this.products = this.products.filter(p => p.id !== id);
        this.saveProducts();
        this.renderProducts();
    }

    // Фільтрація товарів
    filterProducts(searchTerm) {
        return this.products.filter(product => 
            Object.values(product).some(value => 
                String(value).toLowerCase().includes(searchTerm.toLowerCase())
            )
        );
    }

    // Сортування товарів
    sortProducts(products, sortBy) {
        return [...products].sort((a, b) => {
            if (sortBy === 'price') {
                return a.price - b.price;
            }
            return String(a[sortBy]).localeCompare(String(b[sortBy]));
        });
    }

    // Відображення товарів
    renderProducts(products = this.products) {
        const container = document.getElementById('productsContainer');
        container.innerHTML = '';

        // PAGINATION
        const pageProducts = this.getProductsForPage(products);
        pageProducts.forEach(product => {
            const card = document.createElement('div');
            card.className = 'product-card';
            card.innerHTML = `
                <img src="${product.image}" alt="${product.brand}" class="product-image">
                <div class="product-info">
                    <p><strong>Бренд:</strong> ${product.brand}</p>
                    <p><strong>Тип:</strong> ${product.type}</p>
                    <p><strong>Розмір:</strong> ${product.size}</p>
                    <p><strong>Колір:</strong> ${product.color}</p>
                    <p><strong>Ціна:</strong> ${product.price} грн</p>
                </div>
                <div class="product-actions">
                    <button class="btn" onclick="productManager.editProduct('${product.id}')">Редагувати</button>
                    <button class="btn btn-danger" onclick="productManager.confirmDelete('${product.id}')">Видалити</button>
                </div>
            `;
            container.appendChild(card);
        });
        this.renderPagination(products);
    }

    getProductsForPage(products) {
        const start = (this.currentPage - 1) * this.productsPerPage;
        return products.slice(start, start + this.productsPerPage);
    }

    renderPagination(products) {
        let pagination = document.getElementById('pagination');
        if (!pagination) {
            pagination = document.createElement('div');
            pagination.id = 'pagination';
            pagination.className = 'pagination';
            productsContainer.parentNode.appendChild(pagination);
        }
        pagination.innerHTML = '';
        const totalPages = Math.ceil(products.length / this.productsPerPage);
        if (totalPages <= 1) {
            pagination.style.display = 'none';
            return;
        }
        pagination.style.display = 'flex';
        // Prev button
        const prevBtn = document.createElement('button');
        prevBtn.textContent = '<';
        prevBtn.disabled = this.currentPage === 1;
        prevBtn.className = 'pagination-btn';
        prevBtn.onclick = () => {
            this.currentPage--;
            this.renderProducts(products);
        };
        pagination.appendChild(prevBtn);
        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.textContent = i;
            pageBtn.className = 'pagination-btn' + (i === this.currentPage ? ' active' : '');
            pageBtn.onclick = () => {
                this.currentPage = i;
                this.renderProducts(products);
            };
            pagination.appendChild(pageBtn);
        }
        // Next button
        const nextBtn = document.createElement('button');
        nextBtn.textContent = '>';
        nextBtn.disabled = this.currentPage === totalPages;
        nextBtn.className = 'pagination-btn';
        nextBtn.onclick = () => {
            this.currentPage++;
            this.renderProducts(products);
        };
        pagination.appendChild(nextBtn);
    }

    // Налаштування обробників подій
    setupEventListeners() {
        // Пошук
        document.getElementById('searchInput').addEventListener('input', (e) => {
            this.currentPage = 1;
            const filteredProducts = this.filterProducts(e.target.value);
            this.renderProducts(filteredProducts);
        });

        // Сортування
        document.getElementById('sortSelect').addEventListener('change', (e) => {
            this.currentPage = 1;
            const sortBy = e.target.value;
            if (sortBy) {
                const sortedProducts = this.sortProducts(this.products, sortBy);
                this.renderProducts(sortedProducts);
            } else {
                this.renderProducts();
            }
        });

        // Додавання товару
        document.getElementById('addProductBtn').addEventListener('click', () => {
            this.openProductModal();
        });

        // Закриття модального вікна
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', () => {
                document.getElementById('productModal').style.display = 'none';
                document.getElementById('deleteModal').style.display = 'none';
            });
        });

        // Обробка форми
        document.getElementById('productForm').addEventListener('submit', (e) => {
            e.preventDefault();
            const form = e.target;
            const productData = {
                id: form.productId.value || Date.now().toString(),
                brand: form.brand.value,
                type: form.type.value,
                size: form.size.value,
                color: form.color.value,
                price: parseFloat(form.price.value),
                image: form.image.value
            };

            if (form.productId.value) {
                this.updateProduct(productData.id, productData);
            } else {
                this.addProduct(productData);
            }

            document.getElementById('productModal').style.display = 'none';
            form.reset();
        });

        // Підтвердження видалення
        document.getElementById('confirmDelete').addEventListener('click', () => {
            const id = document.getElementById('confirmDelete').dataset.id;
            this.deleteProduct(id);
            document.getElementById('deleteModal').style.display = 'none';
        });

        document.getElementById('cancelDelete').addEventListener('click', () => {
            document.getElementById('deleteModal').style.display = 'none';
        });
    }

    // Відкриття модального вікна для додавання/редагування
    openProductModal(product = null) {
        const modal = document.getElementById('productModal');
        const form = document.getElementById('productForm');
        const title = document.getElementById('modalTitle');

        if (product) {
            title.textContent = 'Редагувати товар';
            form.productId.value = product.id;
            form.brand.value = product.brand;
            form.type.value = product.type;
            form.size.value = product.size;
            form.color.value = product.color;
            form.price.value = product.price;
            form.image.value = product.image;
        } else {
            title.textContent = 'Додати новий товар';
            form.reset();
            form.productId.value = '';
        }

        modal.style.display = 'block';
    }

    // Редагування товару
    editProduct(id) {
        const product = this.products.find(p => p.id === id);
        if (product) {
            this.openProductModal(product);
        }
    }

    // Підтвердження видалення
    confirmDelete(id) {
        const modal = document.getElementById('deleteModal');
        document.getElementById('confirmDelete').dataset.id = id;
        modal.style.display = 'block';
    }
}

// Ініціалізація менеджера товарів
const productManager = new ProductManager(); 