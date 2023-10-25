function loadTables() {
    fetch('http://127.0.0.1:8080/get-tables')
    .then(response => response.json())
    .then(table => {

        const dpy = document.querySelector('.containerp');

        // Get the menu container element
        const tableContainer = document.querySelector('.table');


        // Display the menu and allow users to add dishes to the cart
        table.forEach(tableData => {
            const tableId = tableData[0];
            const  tableStatus = tableData[1]? "Occupied":"Available";

            // Create a table item div
            const tableItem = document.createElement('div');
            tableItem.classList.add('table-item');

            const tableIdElement = document.createElement('span');
            tableIdElement.textContent = "Table: " + tableId;


            const tableStatusElement = document.createElement('span');
            tableStatusElement.textContent = "Status: "+ tableStatus;

            const removeButton = document.createElement('button');
            removeButton.textContent = 'Remove';
            removeButton.addEventListener('click', () => {
                    removeTable(tableId);
                }
            );
            const showOrderButton = document.createElement('button');
            showOrderButton.textContent = 'Order Details';

            // Append elements to the menu item div
            tableItem.appendChild(tableIdElement);
            tableItem.appendChild(tableStatusElement);
            tableItem.appendChild(removeButton);
            tableItem.appendChild(showOrderButton);

            // Append the table item to the menu container
            tableContainer.appendChild(tableItem);
        });
        dpy.style.display = 'flex';
    })
    .catch(error => {
        console.error('Error:', error);
        alert('An error occurred. Please try again.');
    });
}

function deleteItem(itemID) {
    fetch('http://127.0.0.1:8080/delete-item', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ itemID: itemID })
    }).then(response => {
        if (response.ok) {
            location.reload();  // Refresh the menu after deleting an item
        }
    });
}

function removeTable(tableID) {
    fetch('http://127.0.0.1:8080/remove-table', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tableID: tableID })
    }).then(response => {
        if (response.ok) {
            location.reload();  // Refresh the menu after deleting an item
        }
    }
    );
}
function addTable() {
    fetch('http://127.0.0.1:8080/add-table', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    }).then(response => {
        if (response.ok) {
            location.reload();  // Refresh the menu after deleting an item
        }
    }
    );
}


function addItem() {
    const itemName = document.getElementById('new-item-name').value;
    const itemPrice = document.getElementById('new-item-price').value;
    
    fetch('http://127.0.0.1:8080/add-item', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ itemName: itemName, price: itemPrice })
    }).then(response => {
        if (response.ok) {
            location.reload();  // Refresh the menu after adding a new item
        }
    });
}
function showMenu() {
    fetch('http://127.0.0.1:8080/get-menu')
        .then(response => response.json())
        .then(menu => {

            const dpy = document.querySelector('.containerp');

            // Get the menu container element
            const menuContainer = document.querySelector('.menu');


            // Display the menu and allow users to add dishes to the cart
            menu.forEach(dishData => {
                const dishName = dishData[1];
                const dishPrice = dishData[2];

                // Create a menu item div
                const menuItem = document.createElement('div');
                menuItem.classList.add('menu-item');
                // Create elements for dish name, price, and add button
                const dishNameElement = document.createElement('span');
                dishNameElement.textContent = dishName;

                const dishPriceElement = document.createElement('span');
                dishPriceElement.textContent = dishPrice;

                const removeButton = document.createElement('button');
                removeButton.textContent = 'remove';
                removeButton.addEventListener('click', () => {
                        deleteItem(dishId);
                    }
                );
                

                // Append elements to the menu item div
                menuItem.appendChild(dishNameElement);
                menuItem.appendChild(dishPriceElement);
                menuItem.appendChild(removeButton);

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


showMenu();  // Call this function to populate the menu when the page loads
loadTables();

