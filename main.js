(function() {
	'use strict';

	/*
	///////////////////////////////////
					VIEW
	///////////////////////////////////
	 */

	const view = (function() {

		const DOM = {
			body: document.getElementsByTagName('body')[0],
			googleScript: document.getElementById('googleScript'),

			links: document.querySelector('.links'),
			aboutLink: document.querySelector('.link-about'),
			shopLink: document.querySelector('.link-shop'),

			cartLink: document.querySelector('.link-cart'),
			cartLinkCaret: document.querySelector('.link__caret'),
			totalItems: document.querySelector('.total-items'),

			cart: document.querySelector('.cart'),
			cartEmptyMsg: document.querySelector('.cart__empty'),
			cartItemsContainer: document.querySelector('.items'),
			orderTotal: document.querySelectorAll('.order-total'),
			orderTotalNum: document.querySelectorAll('.order-total__num'),
			cartCheckoutBtn: document.querySelector('.cart__checkout-btn'),

			modal: document.querySelector('.modal'),
			exitIcon: document.querySelector('.exit__icon'),
			checkoutName: document.querySelector('.name__input'),
			checkoutPhone: document.querySelector('.phone__input'),
			radioButtonsContainer: document.querySelector('.checkout__shipment'),
			checkoutRadioButtons: document.querySelectorAll('.checkout__radio-btn'),
			checkoutAlert: document.querySelector('.checkout__alert'),
			checkoutAddress: document.querySelector('.checkout__address'),
			checkoutAddressInput: document.querySelector('.checkout__address-input'),
			checkoutItemsContainer: document.querySelector('.checkout__items'),
			checkoutOrderBtn: document.querySelector('.checkout__order-btn'),

			map: document.querySelector('.map'),
			deliveryAddressInput: document.querySelector('.delivery__address-input'),
			locationAlert: document.querySelector('.location__alert'),
			deliveryAddressBtn: document.querySelector('.delivery__address-btn'),
			deliverySearchContainer: document.querySelector('.delivery__search-container'),

			productsContainer: document.querySelector('.product__grid-container')
		};

		function getItemNodes(name) {
			let items = document.querySelectorAll('.item');

			return [...items].filter(item => item.firstElementChild.firstElementChild.textContent === name);
		}

		return {
			getDOMelements: function() {
				return DOM;
			},

			displayMap: function(location) {
				const map = new google.maps.Map(DOM.map, {
					center: location,
					zoom: 8.7
				});

				const circle = new google.maps.Circle({
					map: map,
					center: location,
					radius: 32186,
					fillColor: '#AA0000'
				});

				return map;
			},

			addMarker: function(map, location) {
				return new google.maps.Marker({
					map: map,
					animation: google.maps.Animation.DROP,
					position: location
				});
			},

			deleteMarker: function(marker) {
				marker.setMap(null);
			},

			addItem: function({
				name,
				price,
				quantity
			}) {
				let item = document.createElement('div');
				item.classList.add('item');

				item.innerHTML =
					`
					<div class='item-inner'>
 						<div class='item__name'>${name}</div>
 						<div class='item__quantity'>x${quantity}</div>
 					</div>

 					<div class='item__price'>$${price}</div>
					
 					<ion-icon name="trash" tabindex='0' class='item__delete-btn'>
 					</ion-icon>
 					<button class='item__decrement-btn'>-1</button>
					`;

				DOM.cartItemsContainer.appendChild(item);

				// append to checkout modal as well
				const clonedNode = item.cloneNode(true);
				DOM.checkoutItemsContainer.appendChild(clonedNode);
			},

			deleteItem: function(name) {
				getItemNodes(name).forEach((node) => node.remove());
			},

			updateItemQuantity: function({
				name,
				quantity
			}) {
				let items = getItemNodes(name);

				items.forEach((item) => {
					item.firstElementChild.children[1].textContent = `x${quantity}`;
				});
			},

			updateTotals: function({
				totalItems,
				totalPrice
			}) {
				DOM.totalItems.textContent = totalItems;
				[...DOM.orderTotalNum].forEach(el => el.textContent = totalPrice);
			},

			toggleTotalsDisplay: function() {
				DOM.totalItems.classList.toggle('total-items--display');
				[...DOM.orderTotal].forEach(el => el.classList.toggle('order-total--display'));
				DOM.cartEmptyMsg.classList.toggle('cart__empty--hide');
			},

			toggleCheckoutBtnDisplay: function() {
				DOM.cartCheckoutBtn.classList.toggle('cart__checkout-btn--display');
				DOM.checkoutOrderBtn.classList.toggle('checkout__order-btn--display');
			},

			toggleCartDisplay: function() {
				DOM.cart.classList.toggle('cart--slide-in');
				DOM.cartLinkCaret.classList.toggle('link__caret--rotate-180');
			},

			toggleCheckoutModalDisplay: function() {
				DOM.modal.classList.toggle('modal--display');
			},

			toggleCheckoutAddressDisplay: function() {
				DOM.checkoutAddress.classList.toggle('checkout__address--display');
			},

			toggleDeliverySearchContainerBorder: function() {
				DOM.deliverySearchContainer.classList.toggle('delivery__search-container--focus');
			},

			toggleAlert: function(node, msg, isError) {

				node.textContent = msg;
				node.classList.toggle('alert--display');

				if (isError) {
					node.classList.toggle('alert--error');
				} else {
					node.classList.toggle('alert--success');
				}
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
		let shipmentOption = null;
		let customerLatLng = null;
		let customerMarker = null;
		let customerAddress = null;
		let storeLatLng = null;
		let storeMarker = null;
		let map = null;
		let isCheckAddressFuncRunning = false;
		let isPlaceOrderFuncRunning = false;

		function getItemIndex(name) {
			return cart.findIndex(item => item.name === name);
		}

		return {
			addItem: function(name, price) {
				if (getItemIndex(name) !== -1) {
					cart[getItemIndex(name)].quantity++;
					return;
				}

				cart.push({
					name: name,
					price: price,
					quantity: 1
				});
			},

			deleteItem: function(name) {
				cart.splice(getItemIndex(name), 1);
			},

			decrementItem: function(name) {
				cart[getItemIndex(name)].quantity--;
			},

			updateTotals: function() {
				totalItems = cart.reduce((acc, cur) => acc + cur.quantity, 0);
				totalPrice = cart.reduce((acc, cur) => acc + (cur.quantity * cur.price), 0).toFixed(2);
			},

			getItem: function(name) {
				return cart[getItemIndex(name)];
			},

			getTotals: function() {
				return {
					totalItems,
					totalPrice
				};
			},

			set customerLatLng(value) {
				if (!value) return;
				customerLatLng = value;
			},

			get customerLatLng() {
				return customerLatLng;
			},

			set customerAddress(value) {
				if (!value) return;
				customerAddress = value;
			},

			get customerAddress() {
				return customerAddress;
			},

			set storeLatLng(value) {
				if (!value) return;
				storeLatLng = value;
			},

			get storeLatLng() {
				return storeLatLng;
			},

			set map(value) {
				if (!value) return;
				map = value;
			},

			get map() {
				return map;
			},

			set isCheckAddressFuncRunning(value) {
				isCheckAddressFuncRunning = value;
			},

			get isCheckAddressFuncRunning() {
				return isCheckAddressFuncRunning;
			},

			set isPlaceOrderFuncRunning(value) {
				isPlaceOrderFuncRunning = value;
			},

			get isPlaceOrderFuncRunning() {
				return isPlaceOrderFuncRunning;
			},


			isAddressWithin20Miles: function(customerLatLng) {
				return google.maps.geometry.spherical
					.computeDistanceBetween(this.storeLatLng, customerLatLng) * 0.00062137 <= 20;
			},

			getLatLng: function(address, geocoder) {
				return new Promise(function(resolve, reject) {
					geocoder.geocode({
						'address': address
					}, (results, status) => {
						if (status === 'OK') {
							resolve(results[0].geometry.location);
						} else {
							reject('Geocode was not successful for the following reason: ' + status);
						}
					});
				});
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

		const DOM = view.getDOMelements();

		function setupEventListeners() {
			const DOM = view.getDOMelements();

			DOM.productsContainer.addEventListener('click', addItem);
			DOM.body.addEventListener('click', handleEvent);
			DOM.links.addEventListener('click', scrollToSection);
			DOM.cartLink.addEventListener('click', view.toggleCartDisplay);
			DOM.cartCheckoutBtn.addEventListener('click', displayCheckoutModal);
			DOM.exitIcon.addEventListener('click', hideCheckoutModal);
			DOM.modal.addEventListener('dblclick', hideCheckoutModal);
			DOM.radioButtonsContainer.addEventListener('change', handleRadioBtnSelection);
			DOM.googleScript.onload = initMap;
			DOM.deliveryAddressInput.addEventListener('focus', view.toggleDeliverySearchContainerBorder);
			DOM.deliveryAddressInput.addEventListener('blur', view.toggleDeliverySearchContainerBorder);
			DOM.checkoutOrderBtn.addEventListener('click', placeOrder);
			// DOM.deliveryAddressBtn.addEventListener('click', checkAddress);
		}

		//  Start utility functions

		function hasClass(event, className) {
			return event.target.classList.contains(className);
		}

		// End utility functions

		function addItem(e) {
			// 1. Check if 'Add to Cart' button clicked
			if (!e.target.classList.contains('product__btn')) return;

			// 2. Get name and price
			const name = e.target.previousElementSibling.previousElementSibling.textContent;
			const price = e.target.previousElementSibling.textContent.substring(1);

			// 3. Add item to model
			model.addItem(name, price);

			// 4. Update totals in model
			model.updateTotals();

			// 5. Add item to UI
			const item = model.getItem(name);
			(item.quantity > 1) ? view.updateItemQuantity(item): view.addItem(item);

			// 6. Update and show totals in UI
			if (model.getTotals().totalItems === 1) {
				view.toggleTotalsDisplay();
				view.toggleCheckoutBtnDisplay();
			}

			view.updateTotals(model.getTotals());

			model.testing();
		}

		function deleteItem(e) {
			// 1. Get name
			const name = e.target.parentNode.firstElementChild.firstElementChild.textContent;

			// 2. Delete item based on name
			deleteItemByName(name);

			model.testing();
		}

		function deleteItemByName(name) {
			// 2. Delete item from model
			model.deleteItem(name);

			// 3. Update totals in model
			model.updateTotals();

			// 4. Delete item from UI
			view.deleteItem(name);

			// 5. Update totals in UI
			view.updateTotals(model.getTotals());

			//6. Hide totals if no more items in cart
			if (model.getTotals().totalItems === 0) {
				view.toggleTotalsDisplay();
				view.toggleCheckoutBtnDisplay();
			}
		}

		function decrementItem(e) {
			// 1. Get name from UI and item from model
			const name = e.target.parentNode.firstElementChild.firstElementChild.textContent;
			const item = model.getItem(name);

			// 2. Check if item quantity was 1 and delete if true
			if (item.quantity === 1) {
				deleteItemByName(name);
				return;
			}

			// 2. Decrement item quantity in model
			model.decrementItem(name);

			// 3. Update totals in model
			model.updateTotals();

			// 4. Decrement item quantity in UI
			view.updateItemQuantity(item);

			// 5. Update totals in UI
			view.updateTotals(model.getTotals());

			model.testing();
		}

		function handleEvent(e) {

			if (hasClass(e, 'item__delete-btn')) {
				deleteItem(e);
			} else if (hasClass(e, 'item__decrement-btn')) {
				decrementItem(e);
			} else if (hasClass(e, 'delivery__address-btn') || hasClass(e, 'delivery__address-icon')) {
				checkAddress(e);
			} else if (hasClass(e, 'checkout__address-btn')) {
				checkAddress(e);
			}
		}

		function displayCheckoutModal() {
			view.toggleCartDisplay();
			view.toggleCheckoutModalDisplay();
		}

		function hideCheckoutModal(e) {
			if (hasClass(e, 'modal') || hasClass(e, 'exit__icon')) {
				view.toggleCheckoutModalDisplay();
			}
		}

		function handleRadioBtnSelection(e) {
			if (e.target.value === 'delivery') {
				view.toggleCheckoutAddressDisplay();
				return;
			}

			if (DOM.checkoutAddress.classList.contains('checkout__address--display')) {
				view.toggleCheckoutAddressDisplay();
			}
		}

		function scrollToSection(e) {
			if (!hasClass(e, 'link-about') && !hasClass(e, 'link-shop')) return;

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

		function isAlertDoneDisplaying(node, msg, isError) {
			return new Promise(function(resolve) {
				view.toggleAlert(node, msg, isError);

				setTimeout(() => {
					view.toggleAlert(node, msg, isError);
					resolve(true);
				}, 4000);
			});
		}

		function checkAddress(e) {
			if (model.isCheckAddressFuncRunning) return;
			model.isCheckAddressFuncRunning = true;
			let address;
			let alertElement;

			if (hasClass(e, 'delivery__address-btn') || hasClass(e, 'delivery__address-icon')) {

				address = DOM.deliveryAddressInput.value;
				alertElement = DOM.locationAlert;

				DOM.deliveryAddressInput.value = '';

			} else if (hasClass(e, 'checkout__address-btn')) {

				address = DOM.checkoutAddressInput.value;
				alertElement = DOM.checkoutAlert;
			}

			// Send API request to get the latitude and longitude object
			let location = model.getLatLng(address, new google.maps.Geocoder());

			location.then((locationObj) => {
				// Check if inputed address is within 20 mile delivery zone
				if (!model.isAddressWithin20Miles(locationObj)) {

					let alertFinished = isAlertDoneDisplaying(alertElement, 'Sorry but we do not deliver to that address.', true);

					alertFinished.then(() => model.isCheckAddressFuncRunning = false);
					return;
				}

				// Add inputted address to model
				model.customerAddress = address;

				// Prefill address input in checkout modal
				DOM.checkoutAddressInput.value = model.customerAddress;

				// Check and delete if user inputted a previous address
				if (model.customerMarker) view.deleteMarker(model.customerMarker);

				// Save location in model for future reference
				model.customerLatLng = locationObj;

				// Add customer location marker to map and model
				model.customerMarker = view.addMarker(model.map, model.customerLatLng);

				let alertFinished = isAlertDoneDisplaying(alertElement, 'Great news, you are located within our delivery zone!', false);

				alertFinished.then(() => {
					model.isCheckAddressFuncRunning = false;
				});


			}, (reason) => {
				let alertFinished = isAlertDoneDisplaying(alertElement, 'Error, address not found!', true);

				alertFinished.then(() => {
					model.isCheckAddressFuncRunning = false;
				});
			});
		}

		function areInputFieldsFilled() {
			let msg;
			console.log(DOM.checkoutRadioButtons)
			if (!DOM.checkoutName.value) {
				msg = 'Error: Please enter a name.';
			} else if (!DOM.checkoutPhone.value) {
				msg = 'Error: Please enter a phone number.';
			} else if (!DOM.checkoutRadioButtons[0].checked && !DOM.checkoutRadioButtons[1].checked) {
				msg = 'Error: Please choose a shipment option.';
			} else if (DOM.checkoutRadioButtons[1].checked && !DOM.checkoutAddressInput.value) {
				msg = 'Error: Please enter an address.';
			} else {
				return true;
			}

			let alertFinished = isAlertDoneDisplaying(DOM.checkoutAlert, msg, true);

			alertFinished.then(() => {
				model.isPlaceOrderFuncRunning = false;
				return false;
			});
		}

		function placeOrder() {
			// prevent func from firing again while async tasks running
			if (model.isPlaceOrderFuncRunning) return;
			model.isPlaceOrderFuncRunning = true;

			if (!areInputFieldsFilled()) return;

			console.log('woowaahh made it this far')
		}

		function initMap() {
			// 1. Send API request to get the latitude and longitude object
			let location = model.getLatLng('10376 Main St, Fairfax, VA 22030', new google.maps.Geocoder());

			// Resolve promise 
			location.then(function(locationObj) {
				// 2. Add store lat/lng object to model
				model.storeLatLng = locationObj;

				// 3. Display map on UI using store location object
				let map = view.displayMap(model.storeLatLng);

				// 4. Add map reference to model
				model.map = map;

				// 5. Display google maps marker on UI representing store location
				let marker = view.addMarker(model.map, model.storeLatLng);

				// 6. Add marker to model
				model.storeMarker = marker;
			});
		}

		return {
			init: function() {
				console.log('Application has started...');
				setupEventListeners();
			}
		};
	})(view, model);

	controller.init();
})();