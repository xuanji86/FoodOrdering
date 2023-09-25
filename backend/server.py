import http.server
import socketserver
import json
import cgi
import mysql.connector
from urllib.parse import parse_qs
from werkzeug.security import check_password_hash, generate_password_hash

PORT = 8080

class MyHandler(http.server.SimpleHTTPRequestHandler):

    def do_POST(self):
        if self.path == '/admin/login':
            length = int(self.headers.get('content-length'))
            post_data = self.rfile.read(length)
            data = parse_qs(post_data.decode('utf-8'))

            username = data.get('username', [None])[0]
            password = data.get('password', [None])[0]

            conn = mysql.connector.connect(
                host="localhost",
                user="root",
                password="your_password",
                database="restaurantDB"
            )
            cursor = conn.cursor()
            cursor.execute("SELECT password FROM admins WHERE username=%s", (username,))
            stored_password = cursor.fetchone()

            if stored_password and check_password_hash(stored_password[0], password):
                self.send_response(200)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"message": "Logged in successfully!"}).encode())
            else:
                self.send_response(401)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"message": "Invalid credentials!"}).encode())

            cursor.close()
            conn.close()

        else:
            self.send_response(404)
            self.end_headers()

with socketserver.TCPServer(("", PORT), MyHandler) as httpd:
    print("serving at port", PORT)
    httpd.serve_forever()
