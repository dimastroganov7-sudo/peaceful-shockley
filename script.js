// Состояние приложения (имитация)
let currentUser = null;
let cart = [];
let products = [
  { id: 1, name: 'Молоко 3.2%', image: 'https://placehold.co/400x400/007AFF/white?text=Молоко', price: '1 л', maxPerUser: 2, quantity: 10 },
  { id: 2, name: 'Гречка', image: 'https://placehold.co/400x400/34C759/white?text=Гречка', price: '900 г', maxPerUser: 3, quantity: 15 },
  { id: 3, name: 'Макароны', image: 'https://placehold.co/400x400/FF9500/white?text=Макароны', price: '500 г', maxPerUser: 2, quantity: 20 },
  { id: 4, name: 'Консервы', image: 'https://placehold.co/400x400/FF3B30/white?text=Консервы', price: '1 шт', maxPerUser: 4, quantity: 12 },
];
let timeSlots = [
  { id: 1, date: '2026-04-15', time: '10:00-12:00' },
  { id: 2, date: '2026-04-16', time: '14:00-16:00' },
];
let orders = [];
let address = 'ул. Ленина, 10 (склад фонда)';

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
  renderProducts();
  updateCartBadge();
  setupTabs();
  setupAdminTabs();
  loadTimeSlots();
});

// --- Авторизация ---
function login() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  if (email && password) {
    // Имитация: проверяем, не админ ли
    if (email === 'admin@test.com' && password === '12345') {
      currentUser = { name: 'Админ', role: 'admin', email };
      showAdminScreen();
    } else {
      currentUser = { name: 'Пользователь', role: 'user', email, firstName: 'Иван', lastName: 'Иванов', phone: '+79001234567' };
      showMainScreen();
      updateProfile();
    }
  } else {
    alert('Введите email и пароль');
  }
}

function register() {
  const firstName = document.getElementById('regFirstName').value;
  const lastName = document.getElementById('regLastName').value;
  const email = document.getElementById('regEmail').value;
  const password = document.getElementById('regPassword').value;
  const confirm = document.getElementById('regConfirm').value;
  const phone = document.getElementById('regPhone').value;
  const country = document.getElementById('countryCode').value;

  if (!firstName || !lastName || !email || !password || !confirm || !phone) {
    alert('Все поля обязательны');
    return;
  }
  if (!email.includes('@')) {
    alert('Email должен содержать @');
    return;
  }
  if (password !== confirm) {
    alert('Пароли не совпадают');
    return;
  }
  currentUser = { firstName, lastName, email, phone: country + phone, role: 'user' };
  showMainScreen();
  updateProfile();
}

function logout() {
  currentUser = null;
  cart = [];
  document.getElementById('authScreen').classList.add('active');
  document.getElementById('mainScreen').classList.remove('active');
  document.getElementById('adminScreen').classList.remove('active');
  showLogin();
}

function showRegister() {
  document.getElementById('loginForm').style.display = 'none';
  document.getElementById('registerForm').style.display = 'block';
}

function showLogin() {
  document.getElementById('loginForm').style.display = 'block';
  document.getElementById('registerForm').style.display = 'none';
}

// --- Интерфейс ---
function showMainScreen() {
  document.getElementById('authScreen').classList.remove('active');
  document.getElementById('mainScreen').classList.add('active');
  renderProducts();
  renderCart();
  renderOrders();
  updateCartBadge();
}

function showAdminScreen() {
  document.getElementById('authScreen').classList.remove('active');
  document.getElementById('mainScreen').classList.remove('active');
  document.getElementById('adminScreen').classList.add('active');
  renderAdminProducts();
}

function openAdminLogin() {
  document.getElementById('adminLoginModal').style.display = 'flex';
}

function closeModal(id) {
  document.getElementById(id).style.display = 'none';
}

function adminLogin() {
  const login = document.getElementById('adminLogin').value;
  const pass = document.getElementById('adminPassword').value;
  if (login === 'STROGANOVA' && pass === '12345') {
    currentUser = { name: 'Администратор', role: 'admin' };
    closeModal('adminLoginModal');
    showAdminScreen();
  } else {
    alert('Неверный логин или пароль');
  }
}

// --- Товары ---
function renderProducts() {
  const container = document.getElementById('productsContainer');
  container.innerHTML = products.map(p => {
    const inCart = cart.find(i => i.id === p.id);
    const qty = inCart ? inCart.quantity : 0;
    return `
      <div class="product-card">
        <img src="${p.image}" alt="${p.name}">
        <h4>${p.name}</h4>
        <p>${p.price}</p>
        ${qty === 0 ? 
          `<button class="btn secondary" onclick="addToCart(${p.id})">Получить помощь</button>` :
          `<div class="quantity-control">
            <button onclick="decreaseCart(${p.id})">−</button>
            <span>${qty}</span>
            <button onclick="increaseCart(${p.id})" ${qty >= p.maxPerUser ? 'disabled' : ''}>+</button>
          </div>`
        }
      </div>
    `;
  }).join('');
}

function addToCart(productId) {
  const product = products.find(p => p.id === productId);
  const existing = cart.find(i => i.id === productId);
  if (existing) {
    if (existing.quantity < product.maxPerUser) {
      existing.quantity++;
    }
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  renderProducts();
  updateCartBadge();
}

function decreaseCart(productId) {
  const item = cart.find(i => i.id === productId);
  if (item.quantity > 1) {
    item.quantity--;
  } else {
    cart = cart.filter(i => i.id !== productId);
  }
  renderProducts();
  updateCartBadge();
}

function increaseCart(productId) {
  const product = products.find(p => p.id === productId);
  const item = cart.find(i => i.id === productId);
  if (item.quantity < product.maxPerUser) {
    item.quantity++;
  }
  renderProducts();
  updateCartBadge();
}

function updateCartBadge() {
  const total = cart.reduce((sum, i) => sum + i.quantity, 0);
  document.getElementById('cartBadge').textContent = total;
}

// --- Корзина ---
function renderCart() {
  const container = document.getElementById('cartItems');
  if (cart.length === 0) {
    container.innerHTML = '<p style="text-align:center; padding:40px;">Корзина пуста</p>';
    return;
  }
  container.innerHTML = cart.map(item => `
    <div class="cart-item">
      <img src="${item.image}" alt="${item.name}">
      <div class="cart-item-details">
        <h4>${item.name}</h4>
        <p>${item.price}</p>
        <div class="cart-item-actions">
          <button onclick="decreaseCart(${item.id})">−</button>
          <span style="margin:0 16px;">${item.quantity}</span>
          <button onclick="increaseCart(${item.id})" ${item.quantity >= item.maxPerUser ? 'disabled' : ''}>+</button>
        </div>
      </div>
    </div>
  `).join('');
  document.getElementById('pickupAddress').textContent = address;
}

function loadTimeSlots() {
  const select = document.getElementById('timeSlotSelect');
  select.innerHTML = timeSlots.map(s => `<option value="${s.id}">${s.date} ${s.time}</option>`).join('');
}

function createOrder() {
  if (cart.length === 0) {
    alert('Корзина пуста');
    return;
  }
  const slotId = document.getElementById('timeSlotSelect').value;
  const slot = timeSlots.find(s => s.id == slotId);
  const orderNumber = 'БФ-' + Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  const order = {
    id: Date.now(),
    number: orderNumber,
    items: [...cart],
    slot: slot,
    date: new Date().toLocaleDateString(),
    status: 'Ожидает'
  };
  orders.push(order);
  cart = [];
  renderProducts();
  renderCart();
  updateCartBadge();
  renderOrders();
  alert(`Заказ ${orderNumber} создан!`);
  switchTab('orders');
}

// --- Профиль ---
function updateProfile() {
  if (currentUser) {
    document.getElementById('profileName').textContent = `${currentUser.firstName || 'Имя'} ${currentUser.lastName || ''}`;
    document.getElementById('profilePhone').textContent = currentUser.phone || '+7...';
  }
}

// --- Заказы ---
function renderOrders() {
  const container = document.getElementById('ordersList');
  if (orders.length === 0) {
    container.innerHTML = '<p style="padding:20px;">У вас пока нет заказов</p>';
    return;
  }
  container.innerHTML = orders.map(o => `
    <div style="background:white; border-radius:16px; padding:16px; margin-bottom:12px;">
      <div style="display:flex; justify-content:space-between;">
        <strong>${o.number}</strong>
        <span>${o.status}</span>
      </div>
      <p>${o.slot.date} ${o.slot.time}</p>
      <p>${o.items.length} позиций</p>
      <button class="btn secondary" onclick="copyOrderNumber('${o.number}')">Копировать номер</button>
    </div>
  `).join('');
}

function copyOrderNumber(number) {
  navigator.clipboard?.writeText(number);
  alert('Номер скопирован');
}

// --- Навигация ---
function setupTabs() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const tab = item.dataset.tab;
      switchTab(tab);
    });
  });
}

function switchTab(tabId) {
  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
  document.querySelector(`.nav-item[data-tab="${tabId}"]`).classList.add('active');
  document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
  document.getElementById(tabId + 'Tab').classList.add('active');
  if (tabId === 'cart') renderCart();
  if (tabId === 'orders') renderOrders();
}

// --- Админка (упрощённо) ---
function setupAdminTabs() {
  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.adminTab;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.admin-pane').forEach(p => p.classList.remove('active'));
      document.getElementById('admin' + tab.charAt(0).toUpperCase() + tab.slice(1)).classList.add('active');
    });
  });
}

function renderAdminProducts() {
  const container = document.getElementById('adminProductsList');
  container.innerHTML = products.map(p => `
    <div style="background:white; border-radius:16px; padding:12px; margin-bottom:8px; display:flex; justify-content:space-between;">
      <span>${p.name} (${p.quantity} шт)</span>
      <div>
        <button onclick="editProduct(${p.id})"><i class="fas fa-edit"></i></button>
        <button onclick="deleteProduct(${p.id})"><i class="fas fa-trash"></i></button>
      </div>
    </div>
  `).join('');
}

function openAddProductModal() {
  alert('Форма добавления товара (демо)');
}

function openAddSlotModal() {
  alert('Добавление слота времени');
}

// Вспомогательные функции для демо
function editProduct(id) { alert('Редактирование товара ' + id); }
function deleteProduct(id) { 
  products = products.filter(p => p.id !== id);
  renderAdminProducts();
  renderProducts();
}