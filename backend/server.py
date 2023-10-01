import http.server
import socketserver
import json
import mysql.connector
from urllib.parse import parse_qs
import threading
import sys
import uuid


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
                if password == stored_password[0]:
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
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"isEmpty": False}).encode())
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
        if self.path == '/get-menu':
            conn = get_db_connection()
            cursor = conn.cursor(dictionary=True)

            try:
                cursor.execute("SELECT * FROM MENU")
                menu = cursor.fetchall()

                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps(menu).encode())

            except mysql.connector.Error as err:
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"message": f"Database error: {str(err)}"}).encode())

            finally:
                cursor.close()
                conn.close()
        if self.path == '/some-protected-endpoint':
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



