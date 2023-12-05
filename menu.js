function startOrder() {
    const tableNumber = document.getElementById('table-number').value;
    if (tableNumber) {
        fetch(baseUrl + '/check-table', {
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
                        showAlert("Welcome!")
                        setTimeout(function () {
                            if (window.electronAPI) {
                                window.electronAPI.openOrder(tableNumber)
                            } else {
                                window.location.href = '/order.html?TableID=' + tableNumber;

                            }

                        }, 500);

                    } else {
                        showAlert('Table is already occupied.');
                    }
                } else {
                    showAlert('Table does not exist.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showAlert('An error occurred. Please try again.');
            });
    } else {
        showAlert('Please enter a table number.');
    }
}


function showAlert(text) {
    var alertBox = document.getElementById("myAlert");

    alertBox.innerHTML = text;

    alertBox.style.display = "block";

    setTimeout(function () {
        alertBox.style.display = "none";
    }, 3000);
}
