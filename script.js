const STORAGE_KEYS = {
  products: "voltify-products-v2",
  orders: "voltify-orders",
  users: "voltify-users",
  session: "voltify-session",
  cart: "voltify-cart"
};

const defaultProducts = [
  /* ── MOBILES ──────────────────────────────────────── */
  {
    id: "P-1001",
    name: "Tecno Spark Go 3",
    brand: "Tecno",
    category: "Mobile",
    price: 8499,
    description: "Budget smartphone with a 6.56-inch HD+ display, 5000mAh battery, 4GB RAM and 64GB storage running Android 14.",
    stock: 42,
    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "P-1002",
    name: "Moto G35 5G",
    brand: "Motorola",
    category: "Mobile",
    price: 9999,
    description: "6.72-inch Full-HD+ IPS LCD, 6nm Unisoc T760 chipset, 4GB RAM, 128GB storage and Android 14 with clean My UX.",
    stock: 35,
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "P-1003",
    name: "Tecno Spark Go 5G",
    brand: "Tecno",
    category: "Mobile",
    price: 10499,
    description: "Well-rounded budget 5G phone with premium design, dependable battery life, smooth gaming and good low-light photography.",
    stock: 28,
    image: "https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "P-1004",
    name: "Acer Super ZX",
    brand: "Acer",
    category: "Mobile",
    price: 11999,
    description: "High-resolution 120Hz display, decent everyday performance, clean software, and 33W fast charging with a braided cable.",
    stock: 19,
    image: "https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "P-1005",
    name: "iQOO Z10 Lite 5G",
    brand: "iQOO",
    category: "Mobile",
    price: 9999,
    description: "Most affordable phone in the Z10 lineup — 5G connectivity, solid build quality and smooth daily performance.",
    stock: 44,
    image: "https://images.unsplash.com/photo-1587614382346-4ec70e388b28?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "P-1006",
    name: "Realme Narzo 70 5G",
    brand: "Realme",
    category: "Mobile",
    price: 14999,
    description: "6.67-inch 120Hz AMOLED, Dimensity 6100+ processor, 5000mAh battery with 45W charging and 8GB RAM.",
    stock: 23,
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "P-1007",
    name: "Samsung Galaxy M15 5G",
    brand: "Samsung",
    category: "Mobile",
    price: 12999,
    description: "6.5-inch Super AMOLED display, Dimensity 6100+ SoC, triple rear camera and 6000mAh massive battery.",
    stock: 31,
    image: "https://images.unsplash.com/photo-1616348436168-de43ad0db179?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "P-1008",
    name: "Redmi Note 13 Pro+ 5G",
    brand: "Xiaomi",
    category: "Mobile",
    price: 26999,
    description: "200MP flagship-grade camera, 120Hz curved AMOLED, Dimensity 7200-Ultra and 120W HyperCharge.",
    stock: 16,
    image: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "P-1009",
    name: "OnePlus Nord CE 4 Lite",
    brand: "OnePlus",
    category: "Mobile",
    price: 19999,
    description: "6.67-inch FHD+ 120Hz display, Snapdragon 695 5G, 50MP AI dual camera and 5500mAh battery with 80W charging.",
    stock: 20,
    image: "https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "P-1010",
    name: "Poco X6 Pro 5G",
    brand: "Poco",
    category: "Mobile",
    price: 21999,
    description: "Dimensity 8300-Ultra, 6.67-inch 144Hz Flow AMOLED, 64MP triple camera and 67W turbo charging.",
    stock: 18,
    image: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?auto=format&fit=crop&w=800&q=80"
  },
  /* ── LAPTOPS ──────────────────────────────────────── */
  {
    id: "P-2001",
    name: "Acer Aspire Lite 15",
    brand: "Acer",
    category: "Laptop",
    price: 36990,
    description: "15.6-inch Full-HD IPS, Intel Core i3-1215U, 8GB DDR4, 512GB SSD — perfect everyday laptop.",
    stock: 14,
    image: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "P-2002",
    name: "HP Pavilion 15",
    brand: "HP",
    category: "Laptop",
    price: 49990,
    description: "15.6-inch FHD micro-edge display, Intel Core i5-12th Gen, 16GB RAM, 512GB SSD with HP Fast Charge.",
    stock: 10,
    image: "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "P-2003",
    name: "Lenovo IdeaPad Slim 3",
    brand: "Lenovo",
    category: "Laptop",
    price: 42990,
    description: "14-inch FHD IPS, AMD Ryzen 5 7520U, 16GB LPDDR5, 512GB SSD and up to 9 hours battery life.",
    stock: 12,
    image: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "P-2004",
    name: "Dell Inspiron 15",
    brand: "Dell",
    category: "Laptop",
    price: 55990,
    description: "15.6-inch FHD+ touch display, Intel Core i5-13th Gen, 16GB RAM, 512GB SSD and Windows 11.",
    stock: 8,
    image: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "P-2005",
    name: "ASUS VivoBook 16X",
    brand: "ASUS",
    category: "Laptop",
    price: 58990,
    description: "16-inch 2.5K OLED 120Hz display, Intel Core i5-12500H, 16GB DDR5, 512GB NVMe SSD.",
    stock: 7,
    image: "https://images.unsplash.com/photo-1484788984921-03950022c38b?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "P-2006",
    name: "Acer Nitro V 15",
    brand: "Acer",
    category: "Laptop",
    price: 74990,
    description: "Gaming laptop with Intel Core i5-13th Gen, NVIDIA RTX 4050, 144Hz IPS display and 16GB DDR5.",
    stock: 6,
    image: "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "P-2007",
    name: "ASUS TUF Gaming F15",
    brand: "ASUS",
    category: "Laptop",
    price: 79990,
    description: "Core i7-13th Gen, RTX 4060 8GB, 15.6-inch 144Hz FHD IPS, 16GB DDR5 — built for demanding gamers.",
    stock: 5,
    image: "https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "P-2008",
    name: "HP Omen 16",
    brand: "HP",
    category: "Laptop",
    price: 109990,
    description: "AMD Ryzen 9-7945HX, RX 7700S 8GB, 16.1-inch QHD 165Hz — pro-level gaming performance.",
    stock: 4,
    image: "https://images.unsplash.com/photo-1603302576837-37561b2e2302?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "P-2009",
    name: "Dell XPS 13 Plus",
    brand: "Dell",
    category: "Laptop",
    price: 149990,
    description: "13.4-inch OLED touch display, Intel Core i7-12th Gen, 32GB LPDDR5, 1TB NVMe — premium ultrabook.",
    stock: 3,
    image: "https://images.unsplash.com/photo-1611078489935-0cb964de46d6?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "P-2010",
    name: "MacBook Air M2",
    brand: "Apple",
    category: "Laptop",
    price: 114990,
    description: "Apple M2 chip, 13.6-inch Liquid Retina display, 8GB RAM, 256GB SSD — fanless silent performance.",
    stock: 9,
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80"
  },
  /* ── ACCESSORIES ──────────────────────────────────── */
  {
    id: "P-3001",
    name: "boAt Rockerz 450 Pro",
    brand: "boAt",
    category: "Accessories",
    price: 1299,
    description: "On-ear wireless headphones with 40H playtime, ENx technology for voice calls and foldable design.",
    stock: 65,
    image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "P-3002",
    name: "Voltify 65W GaN Charger",
    brand: "Voltify",
    category: "Accessories",
    price: 2499,
    description: "Compact GaN dual-port fast charger compatible with phones, tablets, earbuds and USB-C laptops.",
    stock: 48,
    image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "P-3003",
    name: "boAt Wave Call 2 Smartwatch",
    brand: "boAt",
    category: "Accessories",
    price: 1799,
    description: "1.83-inch HD display, Bluetooth calling, 100+ sports modes, SpO2 and heart rate monitoring.",
    stock: 37,
    image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "P-3004",
    name: "Fire-Boltt Ninja Call Pro",
    brand: "Fire-Boltt",
    category: "Accessories",
    price: 1299,
    description: "1.69-inch full-touch display, Bluetooth calling, 120+ watch faces, IP68 water resistance.",
    stock: 52,
    image: "https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "P-3005",
    name: "Logitech MK295 Silent Wireless",
    brand: "Logitech",
    category: "Accessories",
    price: 2495,
    description: "Silent keyboard and mouse combo with 90% less click noise, 2-year battery life for keyboard.",
    stock: 29,
    image: "https://images.unsplash.com/photo-1625591342274-013866180e05?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "P-3006",
    name: "Sony WH-1000XM5",
    brand: "Sony",
    category: "Accessories",
    price: 24990,
    description: "Industry-leading noise cancelling headphones with 30-hour battery, Speak-to-Chat and LDAC Hi-Res audio.",
    stock: 11,
    image: "https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "P-3007",
    name: "Anker PowerCore 20000",
    brand: "Anker",
    category: "Accessories",
    price: 2799,
    description: "20000mAh power bank with 22.5W fast charging, dual USB-A and 1 USB-C port, slim profile.",
    stock: 40,
    image: "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "P-3008",
    name: "Razer DeathAdder V3",
    brand: "Razer",
    category: "Accessories",
    price: 4499,
    description: "Ultra-lightweight 59g ergonomic gaming mouse, Focus Pro 30K sensor, optical switches and 90-hour battery.",
    stock: 18,
    image: "https://images.unsplash.com/photo-1527814050087-3793815479db?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "P-3009",
    name: "JBL Flip 6 Speaker",
    brand: "JBL",
    category: "Accessories",
    price: 13999,
    description: "Portable Bluetooth 5.1 speaker with IP67 waterproof, 12-hour playtime and PartyBoost pairing.",
    stock: 22,
    image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?auto=format&fit=crop&w=800&q=80"
  },
  {
    id: "P-3010",
    name: "SanDisk Ultra 256GB USB 3.0",
    brand: "SanDisk",
    category: "Accessories",
    price: 1199,
    description: "256GB USB 3.0 flash drive with up to 130MB/s read speed and SanDisk SecureAccess software.",
    stock: 75,
    image: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=800&q=80"
  }
];

const defaultOrders = [
  {
    id: "ORD-1001",
    customerName: "Demo Customer",
    customerEmail: "user@voltify.com",
    address: "Bangalore, Karnataka",
    notes: "",
    items: [{ productId: "P-1001", name: "Nebula X Pro", quantity: 1, price: 54999 }],
    total: 54999,
    status: "Pending",
    createdAt: "2026-04-11T12:00:00.000Z"
  },
  {
    id: "ORD-1002",
    customerName: "Priya Shah",
    customerEmail: "priya@example.com",
    address: "Mumbai, Maharashtra",
    notes: "Evening delivery preferred",
    items: [
      { productId: "P-1003", name: "Pulse Buds Max", quantity: 1, price: 6999 },
      { productId: "P-1005", name: "Halo Charger 65W", quantity: 1, price: 2499 }
    ],
    total: 9498,
    status: "Shipped",
    createdAt: "2026-04-10T09:15:00.000Z"
  }
];

const defaultUsers = [
  { id: "U-1", name: "Voltify Admin", email: "admin@voltify.com", password: "Admin@123", role: "admin" },
  { id: "U-2", name: "Demo Customer", email: "user@voltify.com", password: "User@123", role: "customer" }
];

const state = {
  products: [],
  orders: [],
  users: [],
  cart: [],
  session: null,
  selectedCategory: "All",
  searchTerm: ""
};

const elements = {
  categoryGrid: document.getElementById("categoryGrid"),
  productGrid: document.getElementById("productGrid"),
  cartCount: document.getElementById("cartCount"),
  cartButton: document.getElementById("cartButton"),
  cartDrawer: document.getElementById("cartDrawer"),
  closeCartButton: document.getElementById("closeCartButton"),
  cartItems: document.getElementById("cartItems"),
  cartTotal: document.getElementById("cartTotal"),
  productModal: document.getElementById("productModal"),
  productModalContent: document.getElementById("productModalContent"),
  authModal: document.getElementById("authModal"),
  authButton: document.getElementById("authButton"),
  closeAuthButton: document.getElementById("closeAuthButton"),
  checkoutButton: document.getElementById("checkoutButton"),
  checkoutModal: document.getElementById("checkoutModal"),
  closeCheckoutButton: document.getElementById("closeCheckoutButton"),
  loginForm: document.getElementById("loginForm"),
  registerForm: document.getElementById("registerForm"),
  checkoutForm: document.getElementById("checkoutForm"),
  toast: document.getElementById("toast"),
  inventoryTable: document.getElementById("inventoryTable"),
  ordersTable: document.getElementById("ordersTable"),
  productForm: document.getElementById("productForm"),
  sessionBadge: document.getElementById("sessionBadge"),
  logoutButton: document.getElementById("logoutButton"),
  categoryFilter: document.getElementById("categoryFilter"),
  searchInput: document.getElementById("searchInput"),
  trackOrderForm: document.getElementById("trackOrderForm"),
  trackOrderInput: document.getElementById("trackOrderInput"),
  trackingResult: document.getElementById("trackingResult"),
  demoLoginButton: document.getElementById("demoLoginButton")
};

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function persist(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function loadState() {
  state.products = readStorage(STORAGE_KEYS.products, defaultProducts);
  state.orders = readStorage(STORAGE_KEYS.orders, defaultOrders);
  state.users = readStorage(STORAGE_KEYS.users, defaultUsers);
  state.cart = readStorage(STORAGE_KEYS.cart, []);
  state.session = readStorage(STORAGE_KEYS.session, null);
}

function formatCurrency(amount) {
  const displayAmount = Number(amount || 0) * 0.012;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2
  }).format(displayAmount);
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.classList.add("show");
  window.clearTimeout(showToast.timer);
  showToast.timer = window.setTimeout(() => elements.toast.classList.remove("show"), 2400);
}

function renderCategories() {
  const categoryStats = ["Mobile", "Laptop", "Accessories"].map((category) => {
    const products = state.products.filter((item) => item.category === category);
    return {
      category,
      count: products.length,
      headline:
        category === "Mobile"
          ? "Discover fast, camera-ready phones with clear pricing and stock visibility."
          : category === "Laptop"
            ? "Compare workhorse and creator-grade laptops designed for performance."
            : "Round out every purchase with chargers, earbuds, and essentials."
    };
  });

  elements.categoryGrid.innerHTML = categoryStats.map(({ category, count, headline }) => `
    <article class="category-card" data-category="${escapeHtml(category)}">
      <div class="category-icon"></div>
      <p class="eyebrow">${escapeHtml(category)}</p>
      <h3>${count} products</h3>
      <p>${escapeHtml(headline)}</p>
      <button class="secondary-button full-width" type="button" onclick="filterCategory('${category}')">Shop ${escapeHtml(category)}</button>
    </article>
  `).join("");
}

function getFilteredProducts() {
  return state.products.filter((product) => {
    const matchesCategory = state.selectedCategory === "All" || product.category === state.selectedCategory;
    const haystack = `${product.name} ${product.brand} ${product.category}`.toLowerCase();
    return matchesCategory && haystack.includes(state.searchTerm.toLowerCase());
  });
}

function renderProducts() {
  const products = getFilteredProducts();
  elements.productGrid.innerHTML = products.length ? products.map((product) => `
    <article class="product-card">
      <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}">
      <div class="product-body">
        <div class="product-meta">
          <span class="chip">${escapeHtml(product.category)}</span>
          <span class="${product.stock < 8 ? "stock warning" : "stock"}">${product.stock} in stock</span>
        </div>
        <h3>${escapeHtml(product.name)}</h3>
        <p>${escapeHtml(product.description)}</p>
        <div class="chip-row">
          <span class="chip">${escapeHtml(product.brand)}</span>
          <span class="chip">${formatCurrency(product.price)}</span>
        </div>
        <div class="price-line">
          <strong class="price">${formatCurrency(product.price)}</strong>
          <div class="table-actions">
            <button class="secondary-button" type="button" onclick="openProductModal('${product.id}')">View</button>
            <button class="primary-button" type="button" onclick="addToCart('${product.id}')">Add to cart</button>
          </div>
        </div>
      </div>
    </article>
  `).join("") : `<div class="empty-state">No products match the current filter.</div>`;
}

function renderCategoryFilter() {
  const categories = ["All", ...new Set(state.products.map((product) => product.category))];
  elements.categoryFilter.innerHTML = categories.map((category) => `
    <option value="${escapeHtml(category)}" ${state.selectedCategory === category ? "selected" : ""}>${escapeHtml(category)}</option>
  `).join("");
}

function renderCart() {
  const enrichedCart = state.cart.map((item) => ({
    ...item,
    product: state.products.find((candidate) => candidate.id === item.productId)
  }));

  elements.cartCount.textContent = String(state.cart.reduce((total, item) => total + item.quantity, 0));

  if (!enrichedCart.length) {
    elements.cartItems.innerHTML = `<div class="empty-state">Your cart is empty. Add products from the catalog to begin checkout.</div>`;
    elements.cartTotal.textContent = formatCurrency(0);
    return;
  }

  elements.cartItems.innerHTML = enrichedCart.map(({ product, quantity }) => `
    <article class="cart-item">
      <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}">
      <div>
        <strong>${escapeHtml(product.name)}</strong>
        <p>${formatCurrency(product.price)} x ${quantity}</p>
      </div>
      <button class="ghost-button" type="button" onclick="removeFromCart('${product.id}')">Remove</button>
    </article>
  `).join("");

  const total = enrichedCart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  elements.cartTotal.textContent = formatCurrency(total);
}

function renderInventoryTable() {
  if (state.session?.role !== "admin") {
    elements.inventoryTable.innerHTML = `<div class="empty-state">Login as admin to manage the product catalogue and inventory.</div>`;
    return;
  }

  elements.inventoryTable.innerHTML = state.products.map((product) => `
    <div class="table-row">
      <div>
        <strong>${escapeHtml(product.name)}</strong>
        <div>${escapeHtml(product.brand)} · ${escapeHtml(product.category)} · ${formatCurrency(product.price)}</div>
      </div>
      <div class="table-actions">
        <span class="${product.stock < 8 ? "warning" : "stock"}">${product.stock} in stock</span>
        <button class="secondary-button" type="button" onclick="editProduct('${product.id}')">Edit</button>
        <button class="ghost-button" type="button" onclick="deleteProduct('${product.id}')">Delete</button>
      </div>
    </div>
  `).join("");
}

function renderOrdersTable() {
  if (state.session?.role !== "admin") {
    elements.ordersTable.innerHTML = `<div class="empty-state">Admin-only order management is protected until an admin session is active.</div>`;
    return;
  }

  elements.ordersTable.innerHTML = state.orders.slice().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((order) => `
    <div class="table-row">
      <div>
        <strong>${escapeHtml(order.id)}</strong>
        <div>${escapeHtml(order.customerName)} · ${formatCurrency(order.total)} · ${new Date(order.createdAt).toLocaleDateString("en-IN")}</div>
      </div>
      <div class="table-actions">
        ${["Pending", "Shipped", "Delivered"].map((status) => `
          <button class="status-button ${order.status === status ? "primary-button" : "secondary-button"}" type="button" onclick="updateOrderStatus('${order.id}', '${status}')">${status}</button>
        `).join("")}
      </div>
    </div>
  `).join("");
}

function updateSessionView() {
  if (!state.session) {
    elements.sessionBadge.textContent = "Not logged in";
    elements.authButton.textContent = "Login / Register";
    return;
  }
  elements.sessionBadge.textContent = `${state.session.name} · ${state.session.role}`;
  elements.authButton.textContent = state.session.role === "admin" ? "Admin active" : "Customer logged in";
}

function openProductModal(productId) {
  const product = state.products.find((item) => item.id === productId);
  if (!product) return;

  elements.productModalContent.innerHTML = `
    <div class="modal-header">
      <div>
        <p class="eyebrow">${escapeHtml(product.category)}</p>
        <h2>${escapeHtml(product.name)}</h2>
      </div>
      <button class="icon-button" type="button" onclick="document.getElementById('productModal').close()">×</button>
    </div>
    <div class="modal-hero">
      <img src="${escapeHtml(product.image)}" alt="${escapeHtml(product.name)}">
      <div class="modal-copy">
        <div class="chip-row">
          <span class="chip">${escapeHtml(product.brand)}</span>
          <span class="chip">${product.stock} units available</span>
        </div>
        <p>${escapeHtml(product.description)}</p>
        <div class="price-line">
          <strong class="price">${formatCurrency(product.price)}</strong>
          <button class="primary-button" type="button" onclick="addToCart('${product.id}')">Add to cart</button>
        </div>
      </div>
    </div>
  `;
  elements.productModal.showModal();
}

function addToCart(productId) {
  const product = state.products.find((item) => item.id === productId);
  if (!product) return;

  const existing = state.cart.find((item) => item.productId === productId);
  if (existing) {
    if (existing.quantity >= product.stock) {
      showToast("No more stock available for this item.");
      return;
    }
    existing.quantity += 1;
  } else {
    state.cart.push({ productId, quantity: 1 });
  }

  persist(STORAGE_KEYS.cart, state.cart);
  renderCart();
  showToast(`${product.name} added to cart.`);
}

function removeFromCart(productId) {
  state.cart = state.cart.filter((item) => item.productId !== productId);
  persist(STORAGE_KEYS.cart, state.cart);
  renderCart();
}

function openCart() {
  elements.cartDrawer.classList.add("open");
  elements.cartDrawer.setAttribute("aria-hidden", "false");
}

function closeCart() {
  elements.cartDrawer.classList.remove("open");
  elements.cartDrawer.setAttribute("aria-hidden", "true");
}

function placeOrder(formData) {
  if (!state.cart.length) {
    showToast("Add at least one item before checkout.");
    return;
  }

  const items = state.cart.map((item) => {
    const product = state.products.find((candidate) => candidate.id === item.productId);
    return { productId: product.id, name: product.name, quantity: item.quantity, price: product.price };
  });

  const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const order = {
    id: `ORD-${1000 + state.orders.length + 1}`,
    customerName: formData.name,
    customerEmail: formData.email,
    address: formData.address,
    notes: formData.notes,
    items,
    total,
    status: "Pending",
    createdAt: new Date().toISOString()
  };

  for (const cartItem of state.cart) {
    const product = state.products.find((item) => item.id === cartItem.productId);
    product.stock = Math.max(0, product.stock - cartItem.quantity);
  }

  state.orders.push(order);
  state.cart = [];
  persist(STORAGE_KEYS.orders, state.orders);
  persist(STORAGE_KEYS.products, state.products);
  persist(STORAGE_KEYS.cart, state.cart);

  renderAll();
  elements.checkoutModal.close();
  closeCart();
  elements.trackOrderInput.value = order.id;
  trackOrder(order.id);
  showToast(`Order placed successfully. Reference: ${order.id}`);
}

function trackOrder(orderId) {
  const order = state.orders.find((item) => item.id.toLowerCase() === orderId.toLowerCase());
  if (!order) {
    elements.trackingResult.innerHTML = `<div class="danger">No order found for ${escapeHtml(orderId)}.</div>`;
    return;
  }

  const tone = order.status === "Delivered" ? "stock" : order.status === "Shipped" ? "warning" : "";
  elements.trackingResult.innerHTML = `
    <div class="header-line">
      <strong>${escapeHtml(order.id)}</strong>
      <span class="${tone}">${escapeHtml(order.status)}</span>
    </div>
    <p>${escapeHtml(order.customerName)} · ${escapeHtml(order.customerEmail)}</p>
    <p>${escapeHtml(order.address)}</p>
    <p>${order.items.map((item) => `${item.name} x ${item.quantity}`).join(", ")}</p>
    <strong>Total: ${formatCurrency(order.total)}</strong>
  `;
}

function login(email, password) {
  const user = state.users.find((item) => item.email.toLowerCase() === email.toLowerCase() && item.password === password);
  if (!user) {
    showToast("Invalid email or password.");
    return;
  }

  state.session = { id: user.id, name: user.name, email: user.email, role: user.role };
  persist(STORAGE_KEYS.session, state.session);
  updateSessionView();
  renderInventoryTable();
  renderOrdersTable();
  elements.authModal.close();
  showToast(user.role === "admin" ? "Admin session active. Dashboard unlocked." : "Customer login successful.");

  if (user.role === "admin") {
    document.getElementById("admin").scrollIntoView({ behavior: "smooth" });
  }
}

function registerUser(name, email, password) {
  if (state.users.some((item) => item.email.toLowerCase() === email.toLowerCase())) {
    showToast("An account with that email already exists.");
    return;
  }

  state.users.push({ id: `U-${state.users.length + 1}`, name, email, password, role: "customer" });
  persist(STORAGE_KEYS.users, state.users);
  showToast("Customer account created. You can log in now.");
}

function logout() {
  state.session = null;
  persist(STORAGE_KEYS.session, null);
  updateSessionView();
  renderInventoryTable();
  renderOrdersTable();
  elements.productForm.reset();
  showToast("You have been logged out.");
}

function saveProduct(formData) {
  if (state.session?.role !== "admin") {
    showToast("Admin login required to manage products.");
    return;
  }

  const existingIndex = state.products.findIndex((item) => item.id === formData.id);
  const payload = {
    id: formData.id || `P-${1000 + state.products.length + 1}`,
    name: formData.name,
    brand: formData.brand,
    category: formData.category,
    price: Number(formData.price),
    description: formData.description,
    stock: Number(formData.stock),
    image: formData.image
  };

  if (existingIndex >= 0) {
    state.products[existingIndex] = payload;
    showToast("Product updated.");
  } else {
    state.products.push(payload);
    showToast("Product added to the catalogue.");
  }

  persist(STORAGE_KEYS.products, state.products);
  elements.productForm.reset();
  document.getElementById("productId").value = "";
  renderAll();
}

function editProduct(productId) {
  if (state.session?.role !== "admin") {
    showToast("Admin login required.");
    return;
  }

  const product = state.products.find((item) => item.id === productId);
  if (!product) return;

  document.getElementById("productId").value = product.id;
  document.getElementById("productName").value = product.name;
  document.getElementById("productBrand").value = product.brand;
  document.getElementById("productCategory").value = product.category;
  document.getElementById("productPrice").value = product.price;
  document.getElementById("productStock").value = product.stock;
  document.getElementById("productImage").value = product.image;
  document.getElementById("productDescription").value = product.description;
  showToast("Product loaded into the admin form.");
}

function deleteProduct(productId) {
  if (state.session?.role !== "admin") {
    showToast("Admin login required.");
    return;
  }

  state.products = state.products.filter((item) => item.id !== productId);
  state.cart = state.cart.filter((item) => item.productId !== productId);
  persist(STORAGE_KEYS.products, state.products);
  persist(STORAGE_KEYS.cart, state.cart);
  renderAll();
  showToast("Product removed from the catalogue.");
}

function updateOrderStatus(orderId, status) {
  if (state.session?.role !== "admin") {
    showToast("Admin login required.");
    return;
  }

  const order = state.orders.find((item) => item.id === orderId);
  if (!order) return;
  order.status = status;
  persist(STORAGE_KEYS.orders, state.orders);
  renderOrdersTable();
  if (elements.trackOrderInput.value.trim().toLowerCase() === orderId.toLowerCase()) trackOrder(orderId);
  showToast(`Order ${orderId} updated to ${status}.`);
}

function filterCategory(category) {
  state.selectedCategory = category;
  elements.categoryFilter.value = category;
  renderProducts();
  document.getElementById("catalog").scrollIntoView({ behavior: "smooth" });
}

function bindEvents() {
  elements.cartButton.addEventListener("click", openCart);
  elements.closeCartButton.addEventListener("click", closeCart);
  elements.authButton.addEventListener("click", () => elements.authModal.showModal());
  elements.closeAuthButton.addEventListener("click", () => elements.authModal.close());
  elements.checkoutButton.addEventListener("click", () => {
    if (!state.cart.length) {
      showToast("Your cart is empty.");
      return;
    }
    elements.checkoutModal.showModal();
  });
  elements.closeCheckoutButton.addEventListener("click", () => elements.checkoutModal.close());
  elements.logoutButton.addEventListener("click", logout);
  elements.demoLoginButton.addEventListener("click", () => {
    elements.authModal.showModal();
    document.getElementById("loginEmail").value = "admin@voltify.com";
    document.getElementById("loginPassword").value = "Admin@123";
  });

  elements.loginForm.addEventListener("submit", (event) => {
    event.preventDefault();
    login(document.getElementById("loginEmail").value.trim(), document.getElementById("loginPassword").value);
  });

  elements.registerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    registerUser(
      document.getElementById("registerName").value.trim(),
      document.getElementById("registerEmail").value.trim(),
      document.getElementById("registerPassword").value
    );
    elements.registerForm.reset();
  });

  elements.checkoutForm.addEventListener("submit", (event) => {
    event.preventDefault();
    placeOrder({
      name: document.getElementById("checkoutName").value.trim(),
      email: document.getElementById("checkoutEmail").value.trim(),
      address: document.getElementById("checkoutAddress").value.trim(),
      notes: document.getElementById("checkoutNotes").value.trim()
    });
    elements.checkoutForm.reset();
  });

  elements.productForm.addEventListener("submit", (event) => {
    event.preventDefault();
    saveProduct({
      id: document.getElementById("productId").value.trim(),
      name: document.getElementById("productName").value.trim(),
      brand: document.getElementById("productBrand").value.trim(),
      category: document.getElementById("productCategory").value,
      price: document.getElementById("productPrice").value,
      stock: document.getElementById("productStock").value,
      image: document.getElementById("productImage").value.trim(),
      description: document.getElementById("productDescription").value.trim()
    });
  });

  elements.categoryFilter.addEventListener("change", (event) => {
    state.selectedCategory = event.target.value;
    renderProducts();
  });

  elements.searchInput.addEventListener("input", (event) => {
    state.searchTerm = event.target.value.trim();
    renderProducts();
  });

  elements.trackOrderForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const value = elements.trackOrderInput.value.trim();
    if (!value) {
      showToast("Enter an order reference.");
      return;
    }
    trackOrder(value);
  });

  [elements.authModal, elements.productModal, elements.checkoutModal].forEach((modal) => {
    modal.addEventListener("click", (event) => {
      const rect = modal.getBoundingClientRect();
      const inDialog = rect.top <= event.clientY && event.clientY <= rect.top + rect.height && rect.left <= event.clientX && event.clientX <= rect.left + rect.width;
      if (!inDialog) modal.close();
    });
  });
}

function renderAll() {
  renderCategoryFilter();
  renderCategories();
  renderProducts();
  renderCart();
  renderInventoryTable();
  renderOrdersTable();
  updateSessionView();
}

loadState();
bindEvents();
renderAll();

window.filterCategory = filterCategory;
window.openProductModal = openProductModal;
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.editProduct = editProduct;
window.deleteProduct = deleteProduct;
window.updateOrderStatus = updateOrderStatus;
