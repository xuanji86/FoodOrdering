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
    fetch('https://13.57.108.72:8080/get-menu')
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
            Object.entries(menu).forEach(([dishName, dishPrice], index = 0) => {
                const dishId = index + 1;

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
                    shoppingCart.push({id: dishId, name: dishName, price: dishPrice});

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
            showAlert('An error occurred. Please try again.');
        });
}

// Get Place Order button and  Checkout button
const placeOrderButton = document.querySelector('#place-order-button');
const checkoutButton = document.querySelector('#checkout-button');


var OrderID = `${new URLSearchParams(new URL(window.location.href).search).get('TableID')}_${Date.now()}`;
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
    let totalAmount = 0;
    shoppingCart.forEach(item => {
        totalAmount += item.price;
    });

    console.log(tableID); // output value
    // sent the shopping cart and current time to backend.
    const data = {
        OrderID: OrderID,
        tableID: tableID,
        OrderDate: currentTime,
        totalAmount: totalAmount.toFixed(2),
        OrderStatus: 'In Process',
        cartContents: shoppingCart,
    };

    console.log(shoppingCart)
    // sent POST
    fetch('https://13.57.108.72:8080/place-order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then(response => {
            if (response.ok) {
                // Order placed successfully
                showAlert('Order placed successfully!');

            } else {
                showAlert('Failed to place the order. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showAlert('An error occurred while placing the order.');
        });
});

// Checkout 
checkoutButton.addEventListener('click', () => {
    // count total
    let totalAmount = 0;
    shoppingCart.forEach(item => {
        totalAmount += item.price;
    });

    // prepare data to be sent to the backend
    const orderData = {
        cartContents: shoppingCart,
        totalAmount: totalAmount.toFixed(2),
        OrderID: OrderID,
    };

    // send data to the backend using Fetch API
    fetch('https://13.57.108.72:8080/Checkout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // handle successful response from the backend
            // 显示购物车内容和总价格
            const cartContents = shoppingCart.map(item => `${item.name} - ${item.price}`).join('\n');
            showAlert(`Your Order:\n${cartContents}\nTotal Amount: $${totalAmount.toFixed(2)}`);
            shoppingCart.length = 0; // clean shopping cart
            window.location.reload()
        })
        .catch(error => {
            // handle errors
            console.error('Error:', error);
        });
});


showMenu()


function showAlert(text) {
    // 获取弹窗元素
    var alertBox = document.getElementById("myAlert");

    // 设置弹窗文本
    alertBox.innerHTML = text;

    // 显示弹窗
    alertBox.style.display = "block";

    // 3秒后自动关闭弹窗
    setTimeout(function () {
        alertBox.style.display = "none";
    }, 3000);
}
