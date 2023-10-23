import http.server
import socketserver
import json
from decimal import Decimal
import mysql.connector
from urllib.parse import parse_qs
import threading
import sys
import uuid
from datetime import datetime


PORT = 8080
SESSION_STORE = {}

# Database connection function
def get_db_connection():
    return mysql.connector.connect(
        host="csce606.cs43a7mocfyt.us-west-1.rds.amazonaws.com",
        port=3306,
        user="root",
        password="xuanji1998",
        database="FoodOrder"
    )


class MyHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()

    def do_POST(self):
        conn = get_db_connection()
        cursor = conn.cursor()

        try:
            if self.path == '/admin/login':
                length = int(self.headers.get('content-length'))
                post_data = self.rfile.read(length)
                data = parse_qs(post_data.decode('utf-8'))

                username = data.get('username', [None])[0]
                password = data.get('password', [None])[0]

                cursor.execute("SELECT Password FROM Manager WHERE UserName=%s", (username,))
                stored_password = cursor.fetchone()
                if stored_password and password == stored_password[0]:
                    session_id = str(uuid.uuid4())
                    SESSION_STORE[session_id] = username
                    
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')
                    self.send_header('Set-Cookie', f'session_id={session_id}; HttpOnly')
                    self.end_headers()
                    self.wfile.write(json.dumps({"message": "Logged in successfully!"}).encode())
                else:
                    self.send_response(401)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"message": "Invalid credentials!"}).encode())

            elif self.path == '/check-table':
                length = int(self.headers.get('content-length'))
                post_data = self.rfile.read(length)
                data = json.loads(post_data.decode('utf-8'))

                table_id = data.get('tableID')
                print(f"Given table_id: {table_id}")

                cursor.execute("SELECT IsEmpty FROM Table_ WHERE TableID=%s", (table_id,))
                print(f"Fetching table with ID: {table_id}")

                table = cursor.fetchone()
                
                print(f"Fetched table data: {table}")

                if table:
                    is_empty = table[0] == 0
                    print(is_empty)
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"isEmpty": is_empty}).encode())
                    cursor.execute('UPDATE FoodOrder.Table_ SET IsEmpty = 1 WHERE TableID = %s', (table_id,))
                    conn.commit()
                else:
                    self.send_response(404)
                    print("not found ID")
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"message": "Table not found"}).encode())

            elif self.path == '/place-order':
                length = int(self.headers.get('content-length'))
                post_data =self.rfile.read(length)
                print(post_data.decode('utf-8'))
                data = eval(post_data.decode('utf-8'))

                # 在这里处理购物车数据和时间戳
                cart_contents = data.get('cartContents')
                table_id = data.get('tableID')
                current_time = data.get('currentTime').replace('/', '-')

                date_format_input = "%m-%d-%Y, %I:%M:%S %p"
                date_format_output = "%Y-%m-%d %H:%M:%S"
                converted_date = datetime.strptime(current_time, date_format_input).strftime(date_format_output)
                

                TotalAmount = 0
                for car in cart_contents:
                    print(car)
                    TotalAmount += car.get('price')

                # 在这里可以执行保存订单和处理付款的逻辑 str(current_time)
                insert_query = "INSERT INTO Order_ (TableID, OrderDate, TotalAmount, OrderStatus) VALUES (%s, %s, %s, %s)"
                data_to_insert = (int(table_id),converted_date, float(TotalAmount), "In Process")
                print(data_to_insert)
                cursor.execute(insert_query, data_to_insert)
                conn.commit()

                # 获取插入行的自增 ID
                inserted_id = cursor.lastrowid

                insert_order_line_query = "INSERT INTO OrderLine (ItemID, OrderID, Quantity, Subtotal) VALUES (%s, %s, %s, %s)"

                data_list = []
                for dt in cart_contents:
                    data_list.append((dt.get('id'), inserted_id, 1, dt.get('price')))

                cursor.executemany(insert_order_line_query, data_list)
                #提交事物
                conn.commit()

                #响应客户端
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                response_message = {"message": "Order placed successfully!", "table_id": table_id,
                                    "cartContents": cart_contents, "currentTime": current_time}
                self.wfile.write(json.dumps(response_message).encode())
                    
            elif self.path == '/delete-item':
                post_data = self.rfile.read(int(self.headers.get('content-length')))
                data = json.loads(post_data.decode('utf-8'))
                item_id = data.get('itemID')
                
                cursor.execute("DELETE FROM Menu WHERE ItemID=%s", (item_id,))
                conn.commit()
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"message": "Item deleted successfully!"}).encode())
                
            elif self.path == '/add-item':
                post_data = self.rfile.read(int(self.headers.get('content-length')))
                data = json.loads(post_data.decode('utf-8'))
                item_name = data.get('itemName')
                price = data.get('price')
                print(item_name)
                print(price)
                
                cursor.execute("INSERT INTO Menu (ItemName, Price) VALUES (%s, %s)", (item_name, price))
                conn.commit()
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"message": "Item added successfully!"}).encode())
            else:
                self.send_response(404)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"isEmpty": False}).encode())

        except mysql.connector.Error as err:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"message": f"Database error: {str(err)}"}).encode())

        finally:
            cursor.close()
            conn.close()

    def do_GET(self):
        conn = get_db_connection()
        cursor = conn.cursor()
        if self.path == '/get-menu':
            # 自定义JSON编码器，处理Decimal对象
            class DecimalEncoder(json.JSONEncoder):
                def default(self, o):
                    if isinstance(o, Decimal):
                        return float(o)
                    return super(DecimalEncoder, self).default(o)
            try:
                cursor.execute("SELECT * FROM Menu")
                menu = cursor.fetchall()

                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                # 使用自定义编码器将Decimal对象转换为JSON
                data = json.dumps(menu, cls=DecimalEncoder).encode()
                print(data)
                self.wfile.write(data)
                #self.wfile.write(json.dumps(menu).encode())
            except mysql.connector.Error as err:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"message": f"Database error: {str(err)}"}).encode())
                

        elif self.path == '/get-tables':
            try:
                cursor.execute("SELECT * FROM Table_")
                tables = cursor.fetchall()

                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(tables).encode())
            except mysql.connector.Error as err:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"message": f"Database error: {str(err)}"}).encode())
                
        elif self.path == '/some-protected-endpoint':
        # Get the session ID from the cookie
            cookie_header = self.headers.get('Cookie')
            if not cookie_header or 'session_id' not in cookie_header:
                self.send_response(401)
                self.end_headers()
                return

            session_id = cookie_header.split('=')[1]
            if session_id not in SESSION_STORE:
                self.send_response(401)
                self.end_headers()
                return
            
        elif self.path =='/order':
            self.send_response(200)
            self.send_header('Content-type', 'text/html')
            self.end_headers()
            with open('../order.html', 'rb') as file:
                self.wfile.write(file.read())
        
        else:
            self.send_response(404)
            self.end_headers()
            
    def do_OPTIONS(self):
        self.send_response(200, "ok")
        self.end_headers()


httpd = socketserver.TCPServer(("", PORT), MyHandler)
is_serving = True

def serve():
    while is_serving:
        httpd.handle_request()

server_thread = threading.Thread(target=serve)
server_thread.start()

print(f"Serving at port {PORT}. Press Ctrl+C to stop.")

try:
    server_thread.join()
except KeyboardInterrupt:
    print("\nShutting down server...")
    is_serving = False
    httpd.server_close()
    sys.exit(0)



