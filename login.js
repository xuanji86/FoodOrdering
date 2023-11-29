function showLogin() {
    const loginForm = document.getElementById('login-form');
    if (loginForm.style.display === 'none' || loginForm.style.display === '') {
        loginForm.style.display = 'block';
    } else {
        loginForm.style.display = 'none';
    }
}

function checkLoginStatus() {
    const username = getCookie('loggedInUser');
    const adminButton = document.getElementById('admin-button');
    const dropdownContent = document.getElementById('dropdown-content');
    const startOrderingSection = document.getElementById('start-ordering');
    const orderQueueSection = document.getElementById('manager-section');

    dropdownContent.classList.add('hidden');

    if (username) {
        adminButton.innerText = username;
        adminButton.onclick = toggleDropdown;
        startOrderingSection.classList.add('hidden');
        orderQueueSection.classList.remove('hidden');
    } else {
        adminButton.innerText = 'Admin Login';
        adminButton.onclick = showLogin;
        startOrderingSection.classList.remove('hidden');
        orderQueueSection.classList.add('hidden');
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

function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Send a POST request to the backend
    fetch('https://13.57.108.72:8080/admin/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
    })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Logged in successfully!') {
                showAlert('Logged in successfully!');
                document.getElementById('login-form').style.display = 'none';

                // Set the cookie for the logged-in user
                setCookie('loggedInUser', username, 1);  // 1 day expiration

                // Change the button text to the logged-in username
                // const adminButton = document.getElementById('admin-button');
                // adminButton.innerText = username;
                checkLoginStatus();
            } else {
                showAlert('Invalid credentials!');
                console.log(data.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
            showAlert('An error occurred. Please try again.');
        });
}

function logout() {
    eraseCookie('loggedInUser');
    const adminButton = document.getElementById('admin-button');
    adminButton.innerText = 'Admin Login';
    adminButton.onclick = showLogin;
    const dropdownContent = document.getElementById('dropdown-content');
    dropdownContent.classList.add('hidden');
    checkLoginStatus();  // 调用这个函数来更新页面内容
}


window.onload = checkLoginStatus;

