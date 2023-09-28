function showLogin() {
    const loginForm = document.getElementById('login-form');
    if (loginForm.style.display === 'none' || loginForm.style.display === '') {
        loginForm.style.display = 'block';
    } else {
        loginForm.style.display = 'none';
    }
}
function setCookie(name, value, days) {
    let expires = "";
    if (days) {
        const date = new Date();
        date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
        expires = "; expires=" + date.toUTCString();
    }
    document.cookie = name + "=" + (value || "") + expires + "; path=/";
}

function getCookie(name) {
    const nameEQ = name + "=";
    const ca = document.cookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') c = c.substring(1, c.length);
        if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}

function eraseCookie(name) {
    document.cookie = name + '=; Max-Age=-99999999;';
}

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Send a POST request to the backend
    fetch('http://127.0.0.1:8080/admin/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Logged in successfully!') {
            alert('Logged in successfully!');
            document.getElementById('login-form').style.display = 'none';
            
            // Set the cookie for the logged-in user
            setCookie('loggedInUser', username, 1);  // 1 day expiration
            
            // Change the button text to the logged-in username
            // const adminButton = document.getElementById('admin-button');
            // adminButton.innerText = username;
            checkLoginStatus();
        } else {
            alert('Invalid credentials!');
            console.log(data.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    });
}

function startOrder() {
    const tableNumber = document.getElementById('table-number').value;
    if (tableNumber) {
        fetch('http://127.0.0.1:8080/check-table', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ tableID: tableNumber })
        })
        .then(response => response.json())
        .then(data => {
            if (data.exists) {
                // If table exists, show the menu and ordering options
                showMenu();
            } else {
                alert('Table does not exist.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        });
    } else {
        alert('Please enter a table number.');
    }
}
function checkLoginStatus() {
    const username = getCookie('loggedInUser');
    const adminButton = document.getElementById('admin-button');
    const dropdownContent = document.getElementById('dropdown-content');
    dropdownContent.classList.add('hidden');

    if (username) {
        adminButton.innerText = username;
        adminButton.onclick = toggleDropdown;
    } else {
        adminButton.innerText = 'Admin Login';
        adminButton.onclick = showLogin;
        dropdownContent.classList.add('hidden');
    }
}


function toggleDropdown() {
    const dropdownContent = document.getElementById('dropdown-content');
    if (dropdownContent.classList.contains('hidden')) {
        dropdownContent.classList.remove('hidden');
    } else {
        dropdownContent.classList.add('hidden');
    }
}

function logout() {
    eraseCookie('loggedInUser');
    const adminButton = document.getElementById('admin-button');
    adminButton.innerText = 'Admin Login';
    adminButton.onclick = showLogin;
    const dropdownContent = document.getElementById('dropdown-content');
    dropdownContent.classList.add('hidden');
}

let cart = [];

function showMenu() {
    fetch('http://127.0.0.1:8080/get-menu')
    .then(response => response.json())
    .then(menu => {
        // Display the menu and allow users to add dishes to the cart
        const menuDiv = document.getElementById('menu');
        menu.forEach(dish => {
            const dishDiv = document.createElement('div');
            dishDiv.innerHTML = `
                ${dish.DishName} - ${dish.Price} 
                <button onclick="addToCart(${dish.DishID}, '${dish.DishName}', ${dish.Price})">Add to Cart</button>
            `;
            menuDiv.appendChild(dishDiv);
        });
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    });
}

function addToCart(dishID, dishName, price) {
    cart.push({ dishID, dishName, price });
    // Update cart display or other UI elements if needed
}

function placeOrder() {
    // Send the cart data to the backend to process the order
}
window.onload = checkLoginStatus;
