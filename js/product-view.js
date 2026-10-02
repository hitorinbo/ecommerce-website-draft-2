const mainContent = document.getElementById('main-content');
const productView = document.getElementById('product-view');
const productViewImage = document.getElementById('product-view-image');
const productViewTitle = document.getElementById('product-view-title');
const productViewPrice = document.getElementById('product-view-price');
const productViewCategory = document.getElementById('product-view-category');
const productViewDescription = document.getElementById('product-view-description');
const originalPageTitle = document.title;

function renderProductView() {
	const productId = location.hash.startsWith('#product-view-')
		? decodeURIComponent(location.hash.slice('#product-view-'.length))
		: '';
	const card = [...document.querySelectorAll('.product-card')].find((item) => item.dataset.productId === productId);

	if (!card) {
		productView.hidden = true;
		mainContent.classList.remove('product-view-active');
		document.title = originalPageTitle;
		return;
	}

	const name = card.querySelector('h3').textContent.trim();
	const price = card.querySelector('.product-details p').textContent.trim();
	const image = card.querySelector('img');
	const category = card.dataset.category || 'New arrival';

	productView.dataset.productId = productId;
	productViewImage.src = image.src;
	productViewImage.alt = image.alt || name;
	productViewTitle.textContent = name;
	productViewPrice.textContent = price;
	productViewCategory.textContent = category.replace(/^./, (letter) => letter.toUpperCase());
	productViewDescription.textContent = `${name} is a cozy addition to your collection.`;
	productView.hidden = false;
	mainContent.classList.add('product-view-active');
	document.title = `${name} | Yume Land`;
	window.scrollTo(0, 0);
}

document.querySelectorAll('[data-product-view]').forEach((link) => {
	link.addEventListener('click', (event) => {
		const card = link.closest('.product-card');
		if (!card || !card.dataset.productId) return;
		link.href = `#product-view-${encodeURIComponent(card.dataset.productId)}`;
	});
});

document.querySelectorAll('.product-card').forEach((card) => {
	card.addEventListener('click', (event) => {
		if (event.target.closest('a, button, input, select, textarea')) return;
		if (!card.dataset.productId) return;
		location.hash = `product-view-${encodeURIComponent(card.dataset.productId)}`;
	});
});

document.querySelector('[data-product-back]').addEventListener('click', () => {
	location.hash = 'products';
});

window.addEventListener('hashchange', renderProductView);
renderProductView();