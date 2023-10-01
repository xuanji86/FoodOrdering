let cart = [];

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
                if (data.hasOwnProperty("isEmpty")) {
                    if (data.isEmpty) {
                        // If table exists and is empty, show the menu and ordering options
                        alert("welcom!")
                        showMenu();
                    } else {
                        alert('Table is already occupied.');
                    }
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
}

function placeOrder() {

}
