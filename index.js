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

    // For demonstration purposes, we'll use hardcoded credentials.
    if (username === 'admin' && password === 'password123') {
        alert('Logged in successfully!');
        document.getElementById('login-form').style.display = 'none';
    } else {
        alert('Invalid credentials!');
    }
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
