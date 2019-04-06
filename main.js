(function() {
	'use strict';

	/*
	///////////////////////////////////
					VIEW
	///////////////////////////////////
	 */

	const view = (function() {

		const DOM = {
			aboutLink: document.querySelector('.link-about'),
			shopLink: document.querySelector('.link-shop'),

			cartLink: document.querySelector('.link-cart'),
			cartLinkCaret: document.querySelector('.link-cart__caret'),
			totalItems: document.querySelector('.total-items'),

			cart: document.querySelector('.cart'),
			cartEmptyMsg: document.querySelector('.cart__empty'),
			cartItemsContainer: document.querySelector('.items'),
			orderTotal: document.querySelector('.cart__total'),
			orderTotalNum: document.querySelector('.cart__total-num'),
			cartCheckoutBtn: document.querySelector('.cart__checkout-btn'),

			modal: document.querySelector('.modal'),
			checkoutItems: document.querySelector('.checkout__items'),
			exitIcon: document.querySelector('.exit__icon'),

			map: document.querySelector('.map'),
			alert: document.querySelector('.alert'),
			locationBtn: document.querySelector('.location__btn'),
			locationInput: document.querySelector('.location__input'),

			productsContainer: document.querySelector('.product__grid-container')
		};

		function getItemNode(name) {
			let items = document.querySelectorAll('.item');
			
			return [...items].find(item => item.firstElementChild.firstElementChild.textContent === name);
		}

		return {
			getDOMelements: function() {
				return DOM;
			},

			addItem: function({name, price, quantity}) {
				let item = document.createElement('div');
				item.classList.add('item');

				item.innerHTML =
					`
					<div class='item-inner'>
 						<div class='item__name'>${name}</div>
 						<div class='item__quantity'>x${quantity}</div>
 					</div>

 					<div class='item__price'>$${price}</div>
						
 					<ion-icon name="trash" class='item__delete-btn'>
 					</ion-icon>
					`;

				DOM.cartItemsContainer.appendChild(item);
			},

			updateItemQuantity: function(name, quantity) {
				let item = getItemNode(name);
				
				item.firstElementChild.children[1].textContent = `x${quantity}`;
			}
		};
	})();

	/*
	///////////////////////////////////
					MODEL
	///////////////////////////////////
	 */

	const model = (function() {
		const cart = [];
		let totalItems = 0;
		let totalPrice = 0;

		function getItemIndex(name) {
			return cart.findIndex(item => item.name === name);
		}

		function isItemInCart(name) {
			return cart.some(item => item.name === name);
		}

		return {
			addItem: function(name, price) {
				if (isItemInCart(name)) {
					let index = getItemIndex(name);
					cart[index].quantity++;
				} else {
					cart.push({
						name: name,
						price: price,
						quantity: 1
					});
				}
			},

			getItem: function(name) {
				let index = getItemIndex(name);
				return cart[index];
			},

			updateTotalItems: function() {
				totalItems = cart.map(item => item.quantity).reduce((acc, cur) => acc + cur);
			},

			updateTotalPrice: function() {
				totalPrice = cart.map(item => item.quantity * item.price).reduce((acc, cur) => acc + cur).toFixed(2);
			},

			testing: function() {
				console.log(cart);
				console.log('total price:', totalPrice);
				console.log('total items:', totalItems);
			}
		};
	})();

	/*
	///////////////////////////////////
				CONTROLLER
	///////////////////////////////////
	 */

	const controller = (function(view, model) {

		function setupEventListeners() {
			const DOM = view.getDOMelements();

			DOM.productsContainer.addEventListener('click', addItem);
		}

		function updateTotals() {
			model.updateTotalItems();
			model.updateTotalPrice();
		}

		function addItem(e) {
			// 1. Check if 'Add to Cart' button clicked
			if (!e.target.classList.contains('product__btn')) return;

			// 2. Get name and price
			const name = e.target.previousElementSibling.previousElementSibling.textContent;
			const price = e.target.previousElementSibling.textContent.substring(1);

			// 3. Add item to model
			model.addItem(name, price);

			// 4. Update totals in model
			updateTotals();

			// 5. Add item to UI
			const quantity = model.getItem(name).quantity;

			if (quantity > 1) {
				view.updateItemQuantity(name, quantity);
			} else {
				view.addItem(model.getItem(name));
			}

			// 6. Update totals in UI

			model.testing();
		}

		return {
			init: function() {
				console.log('Application has started...');
				setupEventListeners();
			}
		}
	})(view, model);

	controller.init();
})();

// (function() {
// 	'use strict';
// 	// variables
// 	const DOM = {
// 		aboutLink: document.querySelector('.link-about'),
// 		shopLink: document.querySelector('.link-shop'),

// 		cartLink: document.querySelector('.link-cart'),
// 		cartLinkCaret: document.querySelector('.link-cart__caret'),
// 		totalItems: document.querySelector('.total-items'),

// 		cart: document.querySelector('.cart'),
// 		cartEmptyMsg: document.querySelector('.cart__empty'),
// 		cartItemsContainer: document.querySelector('.items'),
// 		orderTotal: document.querySelector('.cart__total'),
// 		orderTotalNum: document.querySelector('.cart__total-num'),
// 		cartCheckoutBtn: document.querySelector('.cart__checkout-btn'),

// 		modal: document.querySelector('.modal'),
// 		checkoutItems: document.querySelector('.checkout__items'),
// 		exitIcon: document.querySelector('.exit__icon'),

// 		map: document.querySelector('.map'),
// 		alert: document.querySelector('.alert'),
// 		locationBtn: document.querySelector('.location__btn'),
// 		locationInput: document.querySelector('.location__input'),

// 		productsContainer: document.querySelector('.product__grid-container')
// 	};

// 	const map = {
// 		layout: null,

// 		location: {
// 			store: null,
// 			customer: null,
// 			setStore: function(loc) {
// 				this.store = loc
// 			},
// 			setCustomer: function(loc) {
// 				this.customer = loc
// 			}
// 		},

// 		markers: [],

// 		updateCustomerMarker: function(location) {
// 			const marker = new google.maps.Marker({
// 				map: this.layout,
// 				animation: google.maps.Animation.DROP,
// 				position: location
// 			});

// 			if (this.markers[1]) {
// 				this.markers[1].setMap(null)
// 			};
// 			this.markers[1] = marker;
// 		},

// 		computeMilesBetweenMarkers: function() {
// 			return google.maps.geometry.spherical.computeDistanceBetween(this.location.store, this.location.customer) * 0.00062137;
// 		}
// 	};

// 	const cart = {
// 		items: [],
// 		total: 0,

// 		getIndexOfItem: function(name) {
// 			return this.items.findIndex(item => item.name === name);
// 		},

// 		getTotalItems: function() {
// 			return this.items.map(el => el.quantity)
// 				.reduce((acc, cur) => acc + cur);
// 		},

// 		addItemToCart: function(name, price) {
// 			// Get index of item from array (returns -1 if no existence)
// 			let index = this.getIndexOfItem(name);

// 			// Add item to array if it doesn't yet exist or update quant.
// 			if (index === -1) {
// 				this.items.push({
// 					name: name,
// 					price: price,
// 					quantity: 1
// 				});

// 			} else {
// 				this.items[index].quantity++;
// 			}
// 		},

// 		addItemToUI: function(name, price) {
// 			DOM.orderTotal.classList.add('cart__total--display');
// 			DOM.cartCheckoutBtn.classList.add('cart__checkout-btn--display');

// 			const index = this.getIndexOfItem(name);
// 			const quantity = this.items[index].quantity
// 			console.log('quant', quantity)
// 			if (quantity > 1) {
// 				const element = this.getItemFromDOM(name);
// 				console.log(element)
// 				element[0].children[0].children[1].textContent = `x${quantity}`;

// 				return;
// 			}

// 			const container = DOM.cartItemsContainer;

// 			const html =
// 				`<div class='item'>

// 					<div class='item-inner'>
// 						<div class='item__name'>${name}</div>
// 						<div class='item__quantity'></div>
// 					</div>

// 					<div class='item__price'>$${price}</div>

// 					<ion-icon name="trash" class='item__delete-btn'>
// 					</ion-icon>

// 				</div>`;

// 			container.insertAdjacentHTML('beforeend', html);
// 		},

// 		getItemFromDOM: function(name) {
// 			const items = document.querySelectorAll('.item');

// 			let item = [...items].filter(item => {
// 				return item.firstElementChild.firstElementChild.textContent === name;
// 			});
// 			console.log(item);
// 			return item;
// 		},

// 		removeItem: function(name) {
// 			const index = this.getIndexOfItem(name);

// 			if (index === -1) return;

// 			this.items.splice(index, 1);
// 		},

// 		removeItemFromUI: function(name) {
// 			const element = this.getItemFromDOM(name);
// 			console.log('remove ItemFromUI', element);

// 			element.forEach(el => el.parentNode.removeChild(el));

// 			if (this.items.length === 0) {
// 				// Display 'cart empty' message
// 				document.querySelector('.cart__empty').classList.remove('cart__empty--hide');

// 				// Remove total and checkout button
// 				DOM.orderTotal.classList.remove('cart__total--display');
// 				DOM.cartCheckoutBtn.classList.remove('cart__checkout-btn--display');
// 			}


// 		},

// 		updateOrderTotal: function() {
// 			this.total = this.items.map(el => el.price * el.quantity).reduce((acc, cur) => acc + cur, 0).toFixed(2);
// 		},

// 		updateOrderTotalUI: function() {
// 			DOM.orderTotalNum.textContent = this.total;
// 		}
// 	};

// 	// event listeners
// 	DOM.aboutLink.addEventListener('click', scrollToSection);
// 	DOM.shopLink.addEventListener('click', scrollToSection);
// 	DOM.cartLink.addEventListener('click', changeCartDisplay);

// 	DOM.locationBtn.addEventListener('click', function() {
// 		const address = DOM.locationInput.value;
// 		geocodeAddress(address);
// 		DOM.locationInput.value = '';
// 	});
// 	DOM.productsContainer.addEventListener('click', addItemToCart);
// 	// DOM.cartItemsContainer.addEventListener('click', deleteItemFromCart);
// 	DOM.cartCheckoutBtn.addEventListener('click', displayCheckoutModal);
// 	window.addEventListener('click', hideCheckoutModal);

// 	// functions
// 	// geocodeAddress('Fairfax, VA');

// 	function initMap(center) {
// 		map.location.setStore(center);

// 		map.layout = new google.maps.Map(DOM.map, {
// 			center: center,
// 			zoom: 9
// 		});

// 		const marker = new google.maps.Marker({
// 			map: map.layout,
// 			position: center
// 		});

// 		map.markers.push(marker);

// 		const circle = new google.maps.Circle({
// 			map: map.layout,
// 			center: center,
// 			radius: 32186,
// 			fillColor: '#AA0000'
// 		});
// 	}

// 	function geocodeAddress(address) {
// 		const geocoder = new google.maps.Geocoder();

// 		geocoder.geocode({
// 			'address': address
// 		}, (results, status) => {
// 			if (status === 'OK') {
// 				const location = results[0].geometry.location;
// 				console.log(results);

// 				// initialize google map with store marker and radius so customer can view delivery area
// 				if (!map.layout) {
// 					initMap(location);
// 					return;
// 				}

// 				// update customer location information 
// 				map.updateCustomerMarker(location);
// 				map.location.setCustomer(location);

// 				// update UI
// 				displayMessage();

// 			} else {
// 				alert('Geocode was not successful for the following reason: ' + status);
// 			}
// 		});
// 	}

// 	function displayMessage() {
// 		// reset classes
// 		DOM.alert.classList.remove('alert--success');
// 		DOM.alert.classList.remove('alert--error');

// 		if (map.computeMilesBetweenMarkers() <= 20) {
// 			DOM.alert.classList.add('alert--success');
// 			DOM.alert.textContent = "Great news, we deliver to your location!";
// 		} else {
// 			DOM.alert.classList.add('alert--error');
// 			DOM.alert.textContent = "Sorry, we do not deliver to your address at this time.";
// 		}
// 	}

// 	function scrollToSection(e) {
// 		// obtain section to scroll to and get its y coordinate
// 		const sectionName = e.target.textContent.toLowerCase();
// 		const sectionEl = document.querySelector(`.${sectionName}`);
// 		const sectionYCoord = getYCoord(sectionEl);
// 		let start = pageYOffset;

// 		// utilize requestAnimationFrame to create a smooth scroll
// 		function scrollAnimation(timestamp) {
// 			window.scrollTo(0, start);

// 			if (start <= sectionYCoord - 70) {
// 				start += 20;
// 				window.requestAnimationFrame(scrollAnimation);
// 			} else if (start >= sectionYCoord - 50) {
// 				start -= 20;
// 				window.requestAnimationFrame(scrollAnimation);
// 			}
// 		}

// 		window.requestAnimationFrame(scrollAnimation);
// 	}

// 	function getYCoord(elem) {
// 		const box = elem.getBoundingClientRect();
// 		console.log(elem, box.top + pageYOffset);
// 		return box.top + pageYOffset;
// 	}

// 	function changeCartDisplay() {
// 		DOM.cart.classList.toggle('cart--slide-in');

// 		DOM.cartLinkCaret.classList.toggle('link-cart__caret--rotate-180');
// 	}

// 	function updateTotal() {
// 		// 1. Update total in cart object
// 		cart.updateOrderTotal();

// 		// 2. Update total in cart UI
// 		cart.updateOrderTotalUI();
// 	}

// 	function updateTotalItemsUI() {
// 		if (cart.items.length === 0) {
// 			DOM.totalItems.classList.remove('total-items--display');
// 		} else {
// 			DOM.totalItems.classList.add('total-items--display');
// 			DOM.totalItems.textContent = cart.getTotalItems();
// 		}
// 	}

// 	function addItemToCart(e) {
// 		// Stop function execution if user did not click on button
// 		if (!e.target.classList.contains('product__btn')) {
// 			return;
// 		}

// 		// 1. Obtain product name and price
// 		const name = e.target.parentNode.firstElementChild.textContent.trim();
// 		const price = parseFloat(e.target.parentNode.children[1].textContent.trim().substring(1));

// 		// 2. Add item to cart object
// 		cart.addItemToCart(name, price);

// 		// 3. Hide 'Cart is empty' message
// 		DOM.cartEmptyMsg.classList.add('cart__empty--hide');

// 		// 4. Update total items in cart tracker
// 		updateTotalItemsUI();

// 		// 5. Update order total in object and UI
// 		updateTotal();

// 		// 6. Add item to cart UI
// 		cart.addItemToUI(name, price);
// 	}

// 	function deleteItemFromCart(e) {
// 		// Check if delete button was clicked
// 		if (!e.target.classList.contains('item__delete-btn')) {
// 			return;
// 		}

// 		// 1. Get item name from DOM
// 		let name = e.target.parentNode.firstElementChild.firstElementChild.textContent;

// 		// 2. Remove item from cart object
// 		cart.removeItem(name);

// 		// 3. Update total items in cart tracker
// 		updateTotalItemsUI();

// 		// 4. Update order total in object and UI
// 		updateTotal();

// 		// 5. Remove item from cart UI
// 		cart.removeItemFromUI(name);

// 		// 6. Display 'Cart is empty' message if 0 items in cart
// 		if (!cart.items.length) DOM.cartEmptyMsg.classList.remove('cart__empty--hide');
// 	}

// 	function displayCheckoutModal() {
// 		// Append cart items to checkout modal
// 		let cartItems = document.querySelector('.items');

// 		let clone = cartItems.cloneNode(true);

// 		DOM.checkoutItems.innerHTML = '';

// 		DOM.checkoutItems.appendChild(clone);

// 		// Make modal visible and hide cart
// 		DOM.modal.style.display = 'block';

// 		DOM.cart.classList.remove('cart--slide-in');
// 		DOM.cartLinkCaret.classList.remove('link-cart__caret--rotate-180');
// 	}

// 	function hideCheckoutModal(e) {
// 		if (e.target == DOM.modal || e.target == DOM.exitIcon) {
// 			DOM.modal.style.display = 'none';
// 		}
// 	}

// 	window.addEventListener('click', function(e) {
// 		deleteItemFromCart(e);
// 	});

// })();