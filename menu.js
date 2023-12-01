function startOrder() {
    const tableNumber = document.getElementById('table-number').value;
    if (tableNumber) {
        fetch(baseUrl + '/check-table', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({tableID: tableNumber})
        })
            .then(response => response.json())
            .then(data => {
                if (data.hasOwnProperty("isEmpty")) {
                    if (data.isEmpty) {
                        // If table exists and is empty, show the menu and ordering options
                        showAlert("welcom!")
                        setTimeout(function () {
                            // window.location.href = '/order.html?TableID=' + tableNumber;
                            // createWindow('/order.html?TableID=' + tableNumber)
                            window.electronAPI.openOrder(tableNumber)
                        }, 500);
                        //showMenu();
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


// function showMenu() {
//     fetch('http://127.0.0.1:8080/get-menu')
//         .then(response => response.json())
//         .then(menu => {
//             // Display the menu and allow users to add dishes to the cart
//             const menuDiv = document.getElementById('menu');
//             menu.forEach(dish => {
//                 const dishDiv = document.createElement('div');
//                 dishDiv.innerHTML = `
//                 ${dish.DishName} - ${dish.Price} 
//                 <button onclick="addToCart(${dish.DishID}, '${dish.DishName}', ${dish.Price})">Add to Cart</button>
//             `;
//                 menuDiv.appendChild(dishDiv);
//             });
//         })
//         .catch(error => {
//             console.error('Error:', error);
//             showAlert('An error occurred. Please try again.');
//         });
// }

// function addToCart(dishID, dishName, price) {
//     cart.push({ dishID, dishName, price });
// }

// function placeOrder() {

// }
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
