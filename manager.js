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
