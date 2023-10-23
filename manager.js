function showTab(tabId) {
    // Hide all sections
    document.getElementById('table-section').style.display = 'none';
    document.getElementById('menu-section').style.display = 'none';

    // Remove active class from all tab buttons
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => button.classList.remove('active'));

    // Show the selected section and mark the tab button as active
    document.getElementById(tabId).style.display = 'block';
    document.querySelector(`[onclick="showTab('${tabId}')"]`).classList.add('active');
    if (tabId === 'table-section') {
        loadTables();
    }
}

function loadTables() {
    fetch('http://127.0.0.1:8080/get-tables')
        .then(response => response.json())
        .then(tables => {
            const tableSection = document.getElementById('table-section');
            tableSection.innerHTML = ''; // Clear previous data
            tables.forEach(table => {
                const tableDiv = document.createElement('div');
                tableDiv.innerHTML = `Table ID: ${table.TableID} - Status: ${table.IsEmpty ? 'Empty' : 'Occupied'}`;
                tableSection.appendChild(tableDiv);
            });
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred. Please try again.');
        });
}
function getMenu() {
    fetch('http://127.0.0.1:8080/get-menu').then(response => response.json()).then(data => {
        const menuDiv = document.getElementById('menu');
        menuDiv.innerHTML = '';  // Clear previous items
        data.forEach(item => {
            const itemDiv = document.createElement('div');
            itemDiv.innerHTML = `${item.ItemName} - ${item.Price} <button onclick="deleteItem(${item.ItemID})">Delete</button>`;
            menuDiv.appendChild(itemDiv);
        });
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
            getMenu();  // Refresh the menu after deleting an item
        }
    });
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
            getMenu();  // Refresh the menu after adding a new item
        }
    });
}


getMenu();  // Call this function to populate the menu when the page loads

