// 1. 定义一个购物车数据结构
const shoppingCart = [];

function showMenu() {
    fetch('http://127.0.0.1:8080/get-menu')
        .then(response => response.json())
        .then(menu => {

            const dpy = document.querySelector('.containerp');

            // Get the menu container element
            const menuContainer = document.querySelector('.menu');

            // Get the cart container element
            const cartContainer = document.querySelector('.cart-items');

            // Display the menu and allow users to add dishes to the cart
            menu.forEach(dishData => {
                const dishId = dishData[0];
                const dishName = dishData[1];
                const dishPrice = dishData[2];

                // Create a menu item div
                const menuItem = document.createElement('div');
                menuItem.classList.add('menu-item');

                const dishIdElement = document.createElement('span');
                dishIdElement.textContent = dishId;
                // Create elements for dish name, price, and add button
                const dishNameElement = document.createElement('span');
                dishNameElement.textContent = dishName;

                const dishPriceElement = document.createElement('span');
                dishPriceElement.textContent = dishPrice;

                const addButton = document.createElement('button');
                addButton.textContent = 'Add';
                addButton.addEventListener('click', () => {
                    // 2. 将选定的菜品添加到购物车数据结构
                    shoppingCart.push({ id: dishId, name: dishName, price: dishPrice });

                    // 3. 更新购物车的DOM元素
                    const cartItem = document.createElement('div');
                    cartItem.classList.add('item');
                    cartItem.innerHTML = `<span>${dishId}</span> <span>${dishName}</span> <span>${dishPrice}</span>`;
                    cartContainer.appendChild(cartItem);
                });

                // Append elements to the menu item div
                menuItem.appendChild(dishIdElement);
                menuItem.appendChild(dishNameElement);
                menuItem.appendChild(dishPriceElement);
                menuItem.appendChild(addButton);

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

// 获取 Place Order 按钮和 Checkout 按钮的元素
const placeOrderButton = document.querySelector('#place-order-button');
const checkoutButton = document.querySelector('#checkout-button');

// Place Order 按钮点击事件处理程序
placeOrderButton.addEventListener('click', () => {
    // 获取当前时间
    const currentTime = new Date().toLocaleString();
    // 获取当前页面的 URL
    const url = new URL(window.location.href);
    // 创建 URLSearchParams 对象以解析 URL 查询参数
    const params = new URLSearchParams(url.search);
    // 获取参数 "TableID" 的值
    const tableID = params.get('TableID');

    console.log(tableID); // 输出参数值
    // 将购物车内容和当前时间发送到后端
    const data = {
        tableID: tableID,
        cartContents: shoppingCart, // 假设购物车数据存在 shoppingCart 变量中
        currentTime: currentTime,
    };

    console.log(shoppingCart)
    // 发送 POST 请求到后端
    fetch('http://127.0.0.1:8080/place-order', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then(response => {
            if (response.ok) {
                // 订单成功提交
                alert('Order placed successfully!');
                // 可以在这里清空购物车等其他操作
            } else {
                alert('Failed to place the order. Please try again.');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('An error occurred while placing the order.');
        });
});

// Checkout 按钮点击事件处理程序
checkoutButton.addEventListener('click', () => {
    // 计算购物车中菜品的总价格
    let totalAmount = 0;
    shoppingCart.forEach(item => {
        totalAmount += item.price;
    });

    // 显示购物车内容和总价格
    const cartContents = shoppingCart.map(item => `${item.name} - ${item.price}`).join('\n');
    alert(`Your Order:\n${cartContents}\nTotal Amount: $${totalAmount.toFixed(2)}`);

    // 在这里可以添加付款逻辑，例如调用支付接口
    // 如果有支付集成，你可以在这里触发付款过程

    // 清空购物车或者进行其他必要的清理操作
    shoppingCart.length = 0; // 清空购物车

    // 如果有付款成功的确认，可以显示成功消息
    // alert('Payment successful!');
});

showMenu()