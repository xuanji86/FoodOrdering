function showLogin() {
    const loginForm = document.getElementById('login-form');
    if (loginForm.style.display === 'none' || loginForm.style.display === '') {
        loginForm.style.display = 'block';
    } else {
        loginForm.style.display = 'none';
    }
}

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Send a POST request to the backend
    fetch('/admin/login', {
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
        } else {
            alert('Invalid credentials!');
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
        alert(`Starting order for table ${tableNumber}`);
        // You can add more logic here to handle the ordering process.
    } else {
        alert('Please enter a table number.');
    }
}
