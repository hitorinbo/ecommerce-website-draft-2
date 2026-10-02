const cartStorageKey = 'yume-land-cart';
const cartModal = document.getElementById('cart-modal');
const cartPanel = cartModal.querySelector('.cart-panel');
const cartItems = cartModal.querySelector('.cart-items');
const cartEmpty = cartModal.querySelector('.cart-empty');
const cartButtons = document.querySelectorAll('.cart-link');
const cartClose = cartModal.querySelector('.cart-close');
let cart = JSON.parse(localStorage.getItem(cartStorageKey) || '[]');
let previousFocus;

function saveCart() {
	localStorage.setItem(cartStorageKey, JSON.stringify(cart));
}

function renderCart() {
	const itemCount = cart.reduce((count, item) => count + item.quantity, 0);
	const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

	document.querySelectorAll('.cart-count').forEach((count) => {
		count.textContent = itemCount;
	});
	cartButtons.forEach((button) => {
		button.setAttribute('aria-label', `Shopping cart, ${itemCount} ${itemCount === 1 ? 'item' : 'items'}`);
	});
	cartModal.querySelector('.cart-item-count').textContent = `(${itemCount})`;
	cartModal.querySelector('.cart-subtotal strong').textContent = `$${subtotal.toFixed(2)}`;
	cartEmpty.hidden = itemCount > 0;
	cartItems.replaceChildren();

	cart.forEach((item) => {
		const row = document.createElement('article');
		row.className = 'cart-row';
		row.innerHTML = '<img alt=""><div><h3></h3><p></p><div class="cart-quantity"><button type="button" data-cart-change="-1" aria-label="Decrease quantity">−</button><span></span><button type="button" data-cart-change="1" aria-label="Increase quantity">+</button></div></div><button class="cart-remove" type="button">Remove</button>';
		row.querySelector('img').src = item.image;
		row.querySelector('h3').textContent = item.name;
		row.querySelector('p').textContent = `$${item.price.toFixed(2)}`;
		row.querySelector('.cart-quantity span').textContent = item.quantity;
		row.dataset.cartId = item.id;
		cartItems.append(row);
	});
}

function openCart() {
	previousFocus = document.activeElement;
	cartModal.classList.add('is-open');
	cartModal.setAttribute('aria-hidden', 'false');
	document.body.style.overflow = 'hidden';
	cartPanel.focus();
}

function closeCart() {
	cartModal.classList.remove('is-open');
	cartModal.setAttribute('aria-hidden', 'true');
	document.body.style.overflow = '';
	previousFocus?.focus();
}

function addToCart(item) {
	const existing = cart.find((cartItem) => cartItem.id === item.id);
	if (existing) {
		existing.quantity += 1;
	} else {
		cart.push({ ...item, quantity: 1 });
	}
	saveCart();
	renderCart();
}

cartButtons.forEach((button) => button.addEventListener('click', openCart));
cartClose.addEventListener('click', closeCart);
cartModal.addEventListener('click', (event) => {
	if (event.target === cartModal) closeCart();
});

document.addEventListener('click', (event) => {
	const shopAddButton = event.target.closest('[data-cart-add]');
	const detailAddButton = event.target.closest('[data-cart-add-detail]');

	if (shopAddButton) {
		const card = shopAddButton.closest('.product-card');
		const name = card.querySelector('h3').textContent;
		addToCart({
			id: `${location.pathname}:${card.dataset.productId || name}`,
			name,
			price: Number(card.querySelector('.product-details p').textContent.replace('$', '')),
			image: card.querySelector('img').src
		});
		openCart();
	}

	if (detailAddButton) {
		const productView = document.getElementById('product-view');
		addToCart({
			id: `${location.pathname}:${productView.dataset.productId}`,
			name: document.getElementById('product-view-title').textContent,
			price: Number(document.getElementById('product-view-price').textContent.replace('$', '')),
			image: document.getElementById('product-view-image').src
		});
		openCart();
	}

	const quantityButton = event.target.closest('[data-cart-change]');
	if (quantityButton) {
		const item = cart.find((cartItem) => cartItem.id === quantityButton.closest('.cart-row').dataset.cartId);
		item.quantity += Number(quantityButton.dataset.cartChange);
		if (item.quantity < 1) cart = cart.filter((cartItem) => cartItem !== item);
		saveCart();
		renderCart();
	}

	const removeButton = event.target.closest('.cart-remove');
	if (removeButton) {
		const itemId = removeButton.closest('.cart-row').dataset.cartId;
		cart = cart.filter((item) => item.id !== itemId);
		saveCart();
		renderCart();
	}
});

document.addEventListener('keydown', (event) => {
	if (!cartModal.classList.contains('is-open')) return;
	if (event.key === 'Escape') {
		closeCart();
		return;
	}
	if (event.key !== 'Tab') return;

	const focusableElements = [...cartPanel.querySelectorAll('button:not(:disabled)')];
	const firstElement = focusableElements[0];
	const lastElement = focusableElements[focusableElements.length - 1];
	if (event.shiftKey && document.activeElement === firstElement) {
		event.preventDefault();
		lastElement.focus();
	} else if (!event.shiftKey && document.activeElement === lastElement) {
		event.preventDefault();
		firstElement.focus();
	}
});

renderCart();