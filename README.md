# FoodOrdering
## 1. Introduction
This is a food ordering system based on HTML+JS, the desktop application created by electron. 

## 2. Environment
python3.9 nodejs 18.10.0
### install py library
```
pip3 install pymongo
pip3 install certifi
pip3 install redis
```

### install electron
```
npm install
```

## 3. Server configuration

### 3.1 MongoDB
```
def get_mongo_connection():
    try:
        connection_string = "replace with your mongodb connection string"
        client = MongoClient(connection_string, tlsCAFile=certifi.where())
        return client
    except ConnectionFailure as e:
        print(f"MongoDB connection error: {str(e)}")
        return None
```

### 3.2 Redis
```
def get_redis_connection():
    return redis.Redis(
        host= '' replace with your redis server ip address,
        port=,  # Your Redis Labs port
        password='' replace with your redis password,
    )
```

### 3.3 Hosting
You have to host the frontend on your own server or cloud server, otherwise the desktop application will not work.
#### 3.3.1 Backend
You have to host the server on your own server or cloud server, we suggest using AWS EC2 to host the server.
If you want to use https, you have to get a certificate from a certificate authority, and update the server.py file with the certificate path.

```
context = ssl.SSLContext(ssl.PROTOCOL_TLS_SERVER)
context.load_cert_chain('path/to/fullchain.pem', 'path/to/privkey.pem')

```

Replace the baseUrl in env.js with your server ip address



To start the server, run the following command:
```
sudo python3 server.py
```



#### 3.3.2 Frontend
We are suggesting using AWS Amplify to host the frontend, you can also host it on your own server or cloud server.

https://docs.aws.amazon.com/amplify/?id=docs_gateway


## 4. Desktop application
### 4.1 How to run
```
npm run package
```






