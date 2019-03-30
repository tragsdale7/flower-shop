(function() {
	'use strict';

	// variables
	const DOM = {
		map: document.querySelector('.map'),
		about: document.querySelector('.nav__about'),
		aboutHeader: document.querySelector('.about__header'),
		shop: document.querySelector('.nav__shop'),
		cart: document.querySelector('.cart'),
		cartIcon: document.querySelector('.cart-item__caret'),
		cartBtn: document.querySelector('.cart-item'),
		cartItemsContainer: document.querySelector('.items'),
		cartTracker: document.querySelector('.cart-item__tracker'),
		alert: document.querySelector('.alert'),
		locationBtn: document.querySelector('.location__btn'),
		locationInput: document.querySelector('.location__input'),
		productsContainer: document.querySelector('.product__grid-container')
	};

	const map = {
		layout: null,

		location: {
			store: null,
			customer: null,
			setStore: function(loc) {
				this.store = loc
			},
			setCustomer: function(loc) {
				this.customer = loc
			}
		},

		markers: [],

		updateCustomerMarker: function(location) {
			const marker = new google.maps.Marker({
				map: this.layout,
				animation: google.maps.Animation.DROP,
				position: location
			});

			if (this.markers[1]) {
				this.markers[1].setMap(null)
			};
			this.markers[1] = marker;
		},

		computeMilesBetweenMarkers: function() {
			return google.maps.geometry.spherical.computeDistanceBetween(this.location.store, this.location.customer) * 0.00062137;
		}
	};

	const cart = {
		items: [],

		addItem: function(name, price){
			// add item to array if it doesn't already exist
			if (!this.isItemAlreadyInCart(name)) {
				this.items.push({name: name, price: price, quantity: 1});
			} else {
				const index = this.getIndexOfItem(name);

				this.items[index].quantity++;

				console.log(this.items);
			}
		},

		isItemAlreadyInCart: function(name) {
			const found = this.items.find( item => item.name === name );
			
			return found;
		},

		getIndexOfItem: function(name) {
			const index = this.items.findIndex( item => item.name === name );

			return index;
		},

		getItemFromDOM: function(name) {
			const elements = document.querySelectorAll('.item');

			let element = [...elements].find( el => {
				return el.firstElementChild.textContent === name;
			});
			
			return element;
		},

		addItemToUI: function(name, price) {

			const index = this.getIndexOfItem(name);
			const quantity = this.items[index].quantity

			if (quantity > 1) {
				const element = this.getItemFromDOM(name);

				element.children[1].textContent = `x${quantity}`;

				return;
			}
			
			const container = DOM.cartItemsContainer;

			const html = 
				`<div class='item'>
					
					<div class='item__name'>${name}</div>

					<div class='item__quantity'></div>

					<div class='item__price'>
						${price}
						<span class='delete delete__part'>
							<ion-icon name="trash" class='delete__icon delete__part'>
							</ion-icon>
						</span>
					</div>

				</div>`;

			container.insertAdjacentHTML('beforeend', html);
		},

		removeItem: function(name) {
			const index = this.getIndexOfItem(name);

			this.items.splice(index, 1);

			console.log(this.items);
		},

		removeItemFromUI: function(name) {
			const element = this.getItemFromDOM(name);

			// animate a fade out before removing
			element.style.opacity = '0';
			
			setTimeout( () => {
				element.parentNode.removeChild(element);
				console.log(this);
				if (this.items.length === 0) {
					const emptyMsg = document.querySelector('.cart__empty');

					emptyMsg.classList.remove('cart__empty--hide');
				}
			}, 400);
			
		},

		getTotalQuantity: function() {
			return this.items.map(el => el.quantity)
				.reduce((acc, cur) => acc + cur);	
		}
	};

	// event listeners
	DOM.about.addEventListener('click', scrollToSection);

	DOM.shop.addEventListener('click', scrollToSection);

	DOM.locationBtn.addEventListener('click', function() {
		const address = DOM.locationInput.value;
		geocodeAddress(address);
		DOM.locationInput.value = '';
	});

	DOM.productsContainer.addEventListener('click', addItemToCart);

	DOM.cartItemsContainer.addEventListener('click', deleteItemFromCart);

	DOM.cartBtn.addEventListener('click', changeCartDisplay);

	// functions
	// geocodeAddress('Fairfax, VA');

	function initMap(center) {
		map.location.setStore(center);

		map.layout = new google.maps.Map(DOM.map, {
			center: center,
			zoom: 9
		});

		const marker = new google.maps.Marker({
			map: map.layout,
			position: center
		});

		map.markers.push(marker);

		const circle = new google.maps.Circle({
			map: map.layout,
			center: center,
			radius: 32186,
			fillColor: '#AA0000'
		});
	}

	function geocodeAddress(address) {
		const geocoder = new google.maps.Geocoder();

		geocoder.geocode({
			'address': address
		}, (results, status) => {
			if (status === 'OK') {
				const location = results[0].geometry.location;
				console.log(results);

				// initialize google map with store marker and radius so customer can view delivery area
				if (!map.layout) {
					initMap(location);
					return;
				}

				// update customer location information 
				map.updateCustomerMarker(location);
				map.location.setCustomer(location);

				// update UI
				displayMessage();

			} else {
				alert('Geocode was not successful for the following reason: ' + status);
			}
		});
	}

	function displayMessage() {
		// reset classes
		DOM.alert.classList.remove('alert--success');
		DOM.alert.classList.remove('alert--error');

		if (map.computeMilesBetweenMarkers() <= 20) {
			DOM.alert.classList.add('alert--success');
			DOM.alert.textContent = "Great news, we deliver to your location!";
		} else {
			DOM.alert.classList.add('alert--error');
			DOM.alert.textContent = "Sorry, we do not deliver to your address at this time.";
		}
	}

	function scrollToSection(e) {
		// obtain section to scroll to and get its y coordinate
		const sectionName = e.target.textContent.toLowerCase();
		const sectionEl = document.querySelector(`.${sectionName}`);
		const sectionYCoord = getYCoord(sectionEl);
		let start = pageYOffset;

		// utilize requestAnimationFrame to create a smooth scroll
		function scrollAnimation(timestamp) {
			window.scrollTo(0, start);

			if (start <= sectionYCoord - 70) {
				start += 20;
				window.requestAnimationFrame(scrollAnimation);
			} else if (start >= sectionYCoord - 50) {
				start -= 20;
				window.requestAnimationFrame(scrollAnimation);
			}
		}

		window.requestAnimationFrame(scrollAnimation);
	}

	function getYCoord(elem) {
		const box = elem.getBoundingClientRect();
		console.log(elem, box.top + pageYOffset);
		return box.top + pageYOffset;
	}

	function changeCartDisplay() {
		DOM.cart.classList.toggle('cart--display');

		DOM.cartIcon.classList.toggle('caret--rotate-180');
	}

	function addItemToCart(e) {
		// stop function execution if user did not click on button
		if (!e.target.classList.contains('product__btn')) {
			return;
		}

		// 1. obtain product name and price
		const name = e.target.parentNode.firstElementChild.textContent.trim();

		const price = parseFloat(e.target.parentNode.children[1].textContent.trim().substring(1));
		
		// 2. Add item to cart object
		cart.addItem(name, price);

		// 3. Hide empty cart msg if at least 1 item is in cart and disply isn't already hidden
		const emptyMsg = document.querySelector('.cart__empty');
		
		if (cart.items.length > 0 && getComputedStyle(emptyMsg).display !== 'none') {
			emptyMsg.classList.toggle('cart__empty--hide');
		}

		// 4. Update number of items in cart
		if (cart.items.length > 0) {
			DOM.cartTracker.style.display = 'flex';
			DOM.cartTracker.textContent = cart.getTotalQuantity();
		}

		// 4. Add item to cart UI
		cart.addItemToUI(name, price);
	}

	function deleteItemFromCart(e) {
		let name;
		let el = e.target;

		if (!e.target.classList.contains('delete__part')){
			return;
		}

		// 1. Get item name from DOM
		if(el.classList.contains('delete')) {
			name = el.parentNode.parentNode.firstElementChild.textContent;
		} else {
			name = el.parentNode.parentNode.parentNode.firstElementChild.textContent;
		}

		// 2. Remove item from cart object
		cart.removeItem(name);

		// 3. Update number of items in cart
		if (cart.items.length === 0) {
			DOM.cartTracker.style.display = 'none';
		} else {
			DOM.cartTracker.textContent = cart.getTotalQuantity();
		}
		
		// 4. Remove item from cart UI
		cart.removeItemFromUI(name);
	}
})();