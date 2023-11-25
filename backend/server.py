import http.server
import socketserver
import json
from decimal import Decimal
from urllib.parse import parse_qs
import threading
import sys
import uuid
from datetime import datetime
import redis


PORT = 8080
SESSION_STORE = {}

def get_redis_connection():
    return redis.Redis(
        host='redis-11266.c321.us-east-1-2.ec2.cloud.redislabs.com',  # Your Redis Labs host address
        port=11266,  # Your Redis Labs port
        password='RchlGvyNFKBjT7OiwBfpOG3fNFSu0Eu2',  # Replace with your Redis Labs password
    )

class MyHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
        
    def do_POST(self):
        conn = get_redis_connection()

        try:
            if self.path == '/admin/login':
                length = int(self.headers.get('content-length'))
                post_data = self.rfile.read(length)
                data = parse_qs(post_data.decode('utf-8'))

                username = data.get('username', [None])[0]
                password = data.get('password', [None])[0]

                stored_password = conn.hget("managers", username)  # Assuming managers' passwords are stored in a hash

                if stored_password and password == stored_password.decode():
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

                is_empty = conn.hget(f"table:{table_id}", "IsEmpty")

                if is_empty is not None:
                    is_empty = is_empty.decode() == '1'  # Assuming '1' means empty, '0' means not empty
                    print(is_empty)
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"isEmpty": is_empty}).encode())
                        # Update the table status in Redis if necessary
                    if not is_empty:
                        conn.hset(f"table:{table_id}", "IsEmpty", '1')  # Marking the table as empty
                else:
                    self.send_response(404)
                    print("Table not found")
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"message": "Table not found"}).encode())
                    
            elif self.path == "/remove-table":
                length = int(self.headers.get('content-length'))
                post_data = self.rfile.read(length)
                data = json.loads(post_data.decode('utf-8'))

                table_id = data.get('tableID')
                print(f"Given table_id: {table_id}")
                
                if table_id is not None:
                    # Assuming each table is a key or a hash in Redis
                    result = conn.delete(f"table:{table_id}")

                    if result:  # Check if a key was actually deleted
                        last_table_id = conn.decr("last_table_id")
                        print(f"last_table_id decremented to: {last_table_id}")
                        self.send_response(200)
                        self.send_header('Content-type', 'application/json')
                        self.end_headers()
                        self.wfile.write(json.dumps({"message": "Table removed successfully!"}).encode())
                    else:
                        # The key did not exist
                        self.send_response(404)
                        print("Table not found")
                        self.send_header('Content-type', 'application/json')
                        self.end_headers()
                        self.wfile.write(json.dumps({"message": "Table not found"}).encode())
                else:
                    # No table_id provided
                    self.send_response(400)  # Bad Request
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"message": "No table ID provided"}).encode())
            
            elif self.path == "/add-table":
                # Increment the counter to get a new table ID
                new_table_id = conn.incr("last_table_id")

                # Assuming we use a hash to represent a table and '1' signifies the table is empty
                conn.hset(f"table:{new_table_id}", "IsEmpty", '1')

                # Respond to the client
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"message": "Table added successfully!", "tableID": new_table_id}).encode())
                
            elif self.path == '/add-item':
                post_data = self.rfile.read(int(self.headers.get('content-length')))
                data = json.loads(post_data.decode('utf-8'))
                item_name = data.get('itemName')
                price = data.get('price')
                print(item_name)
                print(price)
                

                # Assuming we use a hash to represent the entire menu
                # The hash could be named 'menu', with each field being an item name and its value being the price
                conn.hset("menu", item_name, price)

                # Respond to the client
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"message": "Item added successfully!"}).encode())
                
            elif self.path == '/delete-item':
                post_data = self.rfile.read(int(self.headers.get('content-length')))
                data = json.loads(post_data.decode('utf-8'))
                item_id = data.get('itemID')
        
                # Assuming each item in the menu is a field in a hash named 'menu'
                result = conn.hdel("menu", item_id)

                if result:  # Check if a field was actually deleted
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"message": "Item deleted successfully!"}).encode())
                else:
                    # The item did not exist in the menu
                    self.send_response(404)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"message": "Item not found"}).encode())
                    
            elif self.path == 'check-table':
                length = int(self.headers.get('content-length'))
                post_data = self.rfile.read(length)
                data = json.loads(post_data.decode('utf-8'))
                table_id = data.get('tableID')
                print(f"Given table_id: {table_id}")
                is_empty = conn.hget(f"table:{table_id}", "IsEmpty")
                if is_empty is not None:
                    is_empty = is_empty.decode() == '1'  # Assuming '1' means empty, '0' means not empty
                    print(is_empty)
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"isEmpty": is_empty}).encode())
                    if not is_empty:
                        conn.hset(f"table:{table_id}", "IsEmpty", '1')
                else:
                    self.send_response(404)
                    print("Table not found")
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"message": "Table not found"}).encode())
                
        except redis.exceptions.ConnectionError as err:
            self.send_response(500)
            self.send_header('Content-type', 'application/json')
            self.end_headers()
            self.wfile.write(json.dumps({"message": f"Redis connection error: {str(err)}"}).encode())
            
        finally:
            conn.close()
        
    def do_GET(self):
        conn = get_redis_connection()
        try: 
            if self.path == '/get-menu':
                # Assuming the entire menu is stored in a hash named 'menu'
                menu = conn.hgetall("menu")

                # Convert the menu data from bytes to a proper format
                formatted_menu = {item.decode(): float(price.decode()) for item, price in menu.items()}
                # Send the response
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                # No need for a custom JSON encoder as all values are now float or string
                data = json.dumps(formatted_menu).encode()
                print(data)
                self.wfile.write(data)
                
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
            
            elif self.path == '/get-tables':
                # Fetch all table keys. Assuming each table is stored as 'table:<id>'
                table_keys = conn.keys('table:*')

                tables = []
                for key in table_keys:
                    table_id = key.decode().split(':')[1]  # Extract table ID from key
                    table_data = conn.hgetall(key)
                    formatted_table_data = {field.decode(): value.decode() for field, value in table_data.items()}
                    formatted_table_data['TableID'] = table_id  # Add the table ID to the data
                    tables.append(formatted_table_data)

                # Send the response
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(tables).encode())
        except Exception as err:  # Catch any Redis-related errors
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"message": f"Error: {str(err)}"}).encode())
        finally:
            conn.close()
        
    def do_OPTIONS(self):
            self.send_response(200) 
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



