const CART_KEY = 'ec_cart';
const WISHLIST_KEY = 'ec_wishlist';

function keyFor(prefix) {
	const email = currentEmail() || 'guest';
	return `${prefix}_${email}`;
}
function getLS(prefix, fallback) {
	return JSON.parse(localStorage.getItem(keyFor(prefix)) || fallback);
}
function setLS(prefix, value) {
	localStorage.setItem(keyFor(prefix), JSON.stringify(value));
}

function getCart() {
	return getLS(CART_KEY, '[]');
}
function saveCart(items) {
	setLS(CART_KEY, items);
	updateCartCount();
	renderCartPage();
}
function getWishlist() {
	return getLS(WISHLIST_KEY, '[]');
}
function setWishlist(val) {
	setLS(WISHLIST_KEY, val);
}

async function fetchProducts() {
	const res = await fetch('products.json');
	return await res.json();
}

// Stars render
function starHtml(rating) {
	const full = Math.floor(rating),
		half = (rating - full) >= 0.5 ? 1 : 0;
	let out = '';
	for (let i = 0; i < full; i++) out += '★';
	if (half) out += '☆';
	while (out.length < 5) out += '☆';
	return `<span class="text-warning">${out}</span>`;
}

// ----- HOME PAGE -----
async function initHome() {
	const products = await fetchProducts();
	window._allProducts = products;

	// fill categories
	const cats = Array.from(new Set(products.map(p => p.category))).sort();
	const sel = document.getElementById('filterCategory');
	cats.forEach(c => {
		const o = document.createElement('option');
		o.value = c;
		o.textContent = c;
		sel.appendChild(o);
	});

	const search = document.getElementById('searchInput');
	const sortSel = document.getElementById('sortSelect');
	sel.addEventListener('change', renderGrid);
	sortSel.addEventListener('change', renderGrid);
	search.addEventListener('input', renderGrid);

	renderGrid();
	updateCartCount();
}

function filteredProducts() {
	const q = (document.getElementById('searchInput')?.value || '').toLowerCase();
	const cat = document.getElementById('filterCategory')?.value || '';
	let arr = window._allProducts || [];
	if (cat) arr = arr.filter(p => p.category === cat);
	if (q) arr = arr.filter(p =>
		(p.title + p.brand + (p.tags || []).join(' ')).toLowerCase().includes(q)
	);
	const sort = document.getElementById('sortSelect')?.value;
	if (sort === 'price-asc') arr.sort((a, b) => a.price - b.price);
	if (sort === 'price-desc') arr.sort((a, b) => b.price - a.price);
	if (sort === 'rating-desc') arr.sort((a, b) => b.rating - a.rating);
	if (sort === 'title-asc') arr.sort((a, b) => a.title.localeCompare(b.title));
	return arr;
}

function productCard(p) {
	const wl = getWishlist(); const wished = wl.includes(p.id);
	return `<div class="col">
    <div class="card h-100 product shadow-sm">
      <img src="${p.images[0]}" class="card-img-top p-3" style="height:200px;object-fit:contain" alt="${p.title}">
      <div class="card-body d-flex flex-column">
        <h6 class="card-title mb-1">${p.title}</h6>
        <div class="small text-muted mb-1">${p.brand}</div>
        <div>${starHtml(p.rating)} <span class="text-muted small">(${p.reviews.length})</span></div>
        <div class="fw-bold text-danger fs-6 mt-auto">$${p.price.toFixed(2)}</div>
        <div class="d-flex gap-2 mt-2">
          <button class="btn btn-sm btn-primary flex-grow-1" data-add="${p.id}">Add to Cart</button>
          <button class="btn btn-sm ${wished ? 'btn-danger' : 'btn-outline-secondary'}" title="Wishlist" data-wish="${p.id}">♥</button>
          <a class="btn btn-sm btn-outline-primary" href="product.html?id=${p.id}">View</a>
        </div>
      </div>
    </div>
  </div>`;
}

function renderGrid() {
	const grid = document.getElementById('productsGrid');
	if (!grid) return;
	const arr = filteredProducts();
	grid.innerHTML = arr.map(productCard).join('');
	// attach button events
	grid.querySelectorAll('[data-add]').forEach(btn => {
		btn.addEventListener('click', () => {
			const id = +btn.dataset.add;
			const p = (window._allProducts || []).find(x => x.id === id);
			addToCart(p, 1);
			btn.textContent = 'Added ✓';
			setTimeout(() => btn.textContent = 'Add to Cart', 800);
		});
	});
	grid.querySelectorAll('[data-wish]').forEach(btn => {
		btn.addEventListener('click', () => {
			const id = +btn.dataset.wish;
			const wl = getWishlist();
			if (wl.includes(id)) setWishlist(wl.filter(x => x !== id));
			else setWishlist([...wl, id]);
			renderGrid();
		});
	});
}

// cart ops
function addToCart(product, qty = 1) {
	const cart = getCart();
	const existing = cart.find(i => i.id === product.id);
	if (existing) existing.qty += qty;
	else cart.push({
		id: product.id,
		title: product.title,
		price: product.price,
		image: product.images[0],
		qty
	});
	saveCart(cart);
}
function updateCartCount() {
	const el = document.getElementById('cartCount');
	if (!el) return;
	const count = getCart().reduce((a, i) => a + i.qty, 0);
	el.textContent = count;
}

// ----- PRODUCT PAGE -----
async function initProduct() {
	updateCartCount();
	const params = new URLSearchParams(location.search);
	const id = +params.get('id') || null;
	const container = document.getElementById('productContainer');
	if (!container) return;
	const products = await fetchProducts();
	const p = products.find(x => x.id === id) || products[0];

	container.innerHTML = `<div class="col-md-5">
      <div class="border bg-white p-3">
        <img src="${p.images[0]}" class="img-fluid w-100" style="object-fit:contain;max-height:420px" alt="${p.title}">
      </div>
      <div class="d-flex gap-2 mt-2 flex-wrap">
        ${p.images.map(src => `<img src="${src}" class="border p-1" style="width:70px;height:70px;object-fit:contain">`).join('')}
      </div>
    </div>
    <div class="col-md-7">
      <h4>${p.title}</h4>
      <div class="text-muted mb-2">${p.brand} • ${p.category}</div>
      <div class="mb-2">${starHtml(p.rating)} <span class="text-muted">(${p.reviews.length} reviews)</span></div>
      <div class="fs-3 fw-bold text-danger mb-3">$${p.price.toFixed(2)}</div>
      <p>${p.description}</p>
      <button class="btn btn-primary me-2" id="btnAdd">Add to Cart</button>
      <a class="btn btn-warning" href="cart.html">Buy Now</a>
      <hr>
      <h6>Specifications</h6>
      <ul class="small">
        ${Object.entries(p.specs || {}).map(([k, v]) => `<li><strong>${k}:</strong> ${v}</li>`).join('')}
      </ul>
      <h6 class="mt-3">Top reviews</h6>
      <div class="small">
        ${p.reviews.slice(0, 2).map(r => `<div class="mb-2"><strong>${r.name}</strong> — ${'★'.repeat(r.stars)}${'☆'.repeat(5 - r.stars)}<br>${r.comment}</div>`).join('')}
      </div>
    </div>`;

	document.getElementById('btnAdd')?.addEventListener('click', () => addToCart(p, 1));
}

// ----- CART PAGE -----
async function initCart() {
	updateCartCount();
	renderCartPage();
}
function renderCartPage() {
	const wrap = document.getElementById('cartPage');
	if (!wrap) return;
	const cart = getCart();
	if (cart.length === 0) {
		wrap.innerHTML = '<div class="alert alert-info">Your cart is empty.</div>';
		return;
	}
	let subtotal = 0;
	wrap.innerHTML = cart.map(item => {
		subtotal += item.price * item.qty;
		return `<div class="card mb-2">
      <div class="card-body d-flex align-items-center gap-3">
        <img src="${item.image}" style="width:80px;height:80px;object-fit:contain">
        <div class="flex-grow-1">
          <div class="fw-semibold">${item.title}</div>
          <div class="text-danger">$${item.price.toFixed(2)}</div>
        </div>
        <div class="d-flex align-items-center gap-1">
          <button class="btn btn-sm btn-outline-secondary" data-dec="${item.id}">−</button>
          <span class="px-2">${item.qty}</span>
          <button class="btn btn-sm btn-outline-secondary" data-inc="${item.id}">+</button>
        </div>
        <button class="btn btn-sm btn-outline-danger" data-del="${item.id}">Remove</button>
      </div>
    </div>`;
	}).join('') + `<div class="d-flex justify-content-between align-items-center mt-3">
    <h5>Subtotal: $${subtotal.toFixed(2)}</h5>
    <button class="btn btn-success">Checkout</button>
  </div>`;

	// attach actions
	wrap.querySelectorAll('[data-inc]').forEach(b => b.onclick = () => qtyChange(+b.dataset.inc, +1));
	wrap.querySelectorAll('[data-dec]').forEach(b => b.onclick = () => qtyChange(+b.dataset.dec, -1));
	wrap.querySelectorAll('[data-del]').forEach(b => b.onclick = () => removeItem(+b.dataset.del));
}
function qtyChange(id, delta) {
	const cart = getCart();
	const it = cart.find(i => i.id === id);
	if (!it) return;
	it.qty = Math.max(1, it.qty + delta);
	saveCart(cart);
}
function removeItem(id) {
	let cart = getCart().filter(i => i.id !== id);
	saveCart(cart);
}

// Page bootstrap
document.addEventListener('DOMContentLoaded', () => {
	if (document.getElementById('productsGrid')) initHome();
	if (document.getElementById('productContainer')) initProduct();
	if (document.getElementById('cartPage')) initCart();
});