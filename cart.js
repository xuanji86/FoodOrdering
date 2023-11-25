
const shoppingCart = [];
let totalAmount = 0;

function updateCartTotal() {
    const totalElement = document.getElementById('cart-total');
    totalElement.textContent = totalAmount.toFixed(2);
}

function removeCartItem(cartItem, index) {

    const removedItem = shoppingCart.splice(index, 1)[0];


    cartItem.remove();

    // delete the item price in shooping cart
    totalAmount -= parseFloat(removedItem.price);
    updateCartTotal();
}


function showMenu() {
    fetch('http://127.0.0.1:8080/get-menu')
        .then(response => response.json())
        .then(menu => {

            const dpy = document.querySelector('.containerp');

            // Get the menu container element
            const menuContainer = document.querySelector('.menu');

            // Get the cart container element
            const cartContainer = document.querySelector('.cart-items');

            //Get the total element
            const totalElement = document.getElementById('cart-total');

            // Display the menu and allow users to add dishes to the cart
            Object.entries(menu).forEach(([dishName, dishPrice], index=0) =>  {
                const dishId = index+1;

                // Create a menu item div
                const menuItem = document.createElement('div');
                menuItem.classList.add('menu-item');

                const dishIdElement = document.createElement('span');
                dishIdElement.textContent = dishId;
                // Create elements for dish name, price, and add button
                const dishNameElement = document.createElement('span');
                dishNameElement.textContent = dishName;

                const dishPriceElement = document.createElement('span');
                dishPriceElement.textContent = dishPrice;

                const addButton = document.createElement('button');
                addButton.textContent = 'add';
                addButton.addEventListener('click', () => {
                    // Add the selected dish to the cart data structure
                    shoppingCart.push({ id: dishId, name: dishName, price: dishPrice });

                    // Update the cart's DOM elements
                    const cartItem = document.createElement('div');
                    cartItem.classList.add('item');
                    cartItem.innerHTML = `<span>${dishId}</span> <span>${dishName}</span> <span>${dishPrice}</span> <button class="remove-button">remove</button>`;
                    cartContainer.appendChild(cartItem);

                    // Calculate the total amount and update the display
                    totalAmount += parseFloat(dishPrice);
                    updateCartTotal();

                    // Add a click event for the "Remove" button
                    const removeButton = cartItem.querySelector('.remove-button');
                    removeButton.addEventListener('click', () => {
                        removeCartItem(cartItem, shoppingCart.length - 1);
                    });
                });

                // Append elements to the menu item div
                menuItem.appendChild(dishIdElement);
                menuItem.appendChild(dishNameElement);
                menuItem.appendChild(dishPriceElement);
                menuItem.appendChild(addButton);

                // Append the menu item to the menu container
                menuContainer.appendChild(menuItem);
            });
            dpy.style.display = 'flex';
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        });
}

// Get Place Order button and  Checkout button
const placeOrderButton = document.querySelector('#place-order-button');
const checkoutButton = document.querySelector('#checkout-button');

// Place Order 
placeOrderButton.addEventListener('click', () => {
    // get Current Time
    const currentTime = new Date().toLocaleString();
    // get current URL
    const url = new URL(window.location.href);
    // create URLSearchParams 
    const params = new URLSearchParams(url.search);
    // Get "TableID" value
    const tableID = params.get('TableID');

    console.log(tableID); // output value
    // sent the shopping cart and current time to backend.
    const data = {
        tableID: tableID,
        cartContents: shoppingCart,
        currentTime: currentTime,
    };

    console.log(shoppingCart)
    // sent POST
    fetch('http://127.0.0.1:8080/place-order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then(response => {
            if (response.ok) {
                // Order placed successfully
                alert('Order placed successfully!');

            } else {
                alert('Failed to place the order. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while placing the order.');
        });
});

// Checkout 
checkoutButton.addEventListener('click', () => {
    // count total
    let totalAmount = 0;
    shoppingCart.forEach(item => {
        totalAmount += item.price;
    });

    // show price
    const cartContents = shoppingCart.map(item => `${item.name} - ${item.price}`).join('\n');
    alert(`Your Order:\n${cartContents}\nTotal Amount: $${totalAmount.toFixed(2)}`);
    window.location.href = 'index.html';

    shoppingCart.length = 0; // clean shoopinf cart


});

showMenu()