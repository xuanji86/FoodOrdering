import http.server
import socketserver
import json
import mysql.connector
from urllib.parse import parse_qs
from werkzeug.security import check_password_hash, generate_password_hash
from werkzeug.security import generate_password_hash, check_password_hash


PORT = 8080

class MyHandler(http.server.SimpleHTTPRequestHandler):

    def do_POST(self):
        if self.path == '/admin/login':
            # Get the length of the POST data and read it
            length = int(self.headers.get('content-length'))
            post_data = self.rfile.read(length)
            data = parse_qs(post_data.decode('utf-8'))

            # Extract username and password from the POST data
            username = data.get('username', [None])[0]
            password = data.get('password', [None])[0]

            # Print received username and password for debugging
            print("Received username:", username)
            print("Received password:", password)

            try:
                # Connect to the MySQL database
                conn = mysql.connector.connect(
                    host="csce606.cs43a7mocfyt.us-west-1.rds.amazonaws.com",
                    port=3306,
                    user="root",
                    password="xuanji1998",
                    database="FoodOrder"
                )

                cursor = conn.cursor()

                # Execute a SQL query to retrieve the stored password hash
                cursor.execute("SELECT Password FROM FoodOrder.Manager WHERE UserName=%s", (username,))
                stored_password = cursor.fetchone()
                print("Stored Password Hash:", stored_password[0])
                print("Entered Password Hash:", password)

                if stored_password[0] == password:
                    print("Password comparison result: Matched")
                    # If passwords match, send a successful response
                    self.send_response(200)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"message": "Logged in successfully!"}).encode())
                else:
                    # If passwords don't match, send a 401 Unauthorized response
                    print("Password comparison result: Not matched")
                    self.send_response(401)
                    self.send_header('Content-type', 'application/json')
                    self.end_headers()
                    self.wfile.write(json.dumps({"message": "Invalid credentials!"}).encode())

                cursor.close()
                conn.close()
            except mysql.connector.Error as err:
                # Handle database errors and send a 500 Internal Server Error response
                self.send_response(500)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"message": f"Database error: {str(err)}"}).encode())
        else:
            # If the request is not to /admin/login, send a 404 Not Found response
            self.send_response(404)
            self.end_headers()

# Create a TCP server on the specified port
with socketserver.TCPServer(("", PORT), MyHandler) as httpd:
    print("serving at port", PORT)
    httpd.serve_forever()
