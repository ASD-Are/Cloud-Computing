# MongoDB and Application Deployment on GKE

## Introduction
This project deploys MongoDB with persistent storage on Google Kubernetes Engine (GKE) and two applications, Student Server (Node.js) and Bookshelf (Python/Flask).

## Table of Contents
1. Set Up the Environment
2. Download Programs and Documentation
3. Process of Program Execution
4. Documentation of Execution Results

## 1. Set Up the Environment

### Prerequisites
- Google Cloud Platform (GCP) account
- Google Cloud SDK (gcloud)
- kubectl
- Docker
- Node.js
- Python with Flask

### Installation
1. **Google Cloud SDK**: [Install Guide](https://cloud.google.com/sdk/docs/install)
2. **kubectl**: [Install Guide](https://kubernetes.io/docs/tasks/tools/install-kubectl/)
3. **Docker**: [Install Guide](https://docs.docker.com/get-docker/)
4. **Node.js**: [Install Guide](https://nodejs.org/en/download/)

## 2. Download Programs and Documentation

### Clone Repository
```bash
git clone https://github.com/ASD-Are/Cloud-Computing/tree/main/Signature%20Project%20MongoDB_PythonFlaskWebFramework_RESTAPI_GKE
cd Signature%20Project%20MongoDB_PythonFlaskWebFramework_RESTAPI_GKE
```

### Documentation
- [Kubernetes Docs](https://kubernetes.io/docs/home/)
- [MongoDB Docs](https://docs.mongodb.com/)
- [Node.js Docs](https://nodejs.org/en/docs/)
- [Flask Docs](https://flask.palletsprojects.com/)


# Implementation
## Step 1: Create MongoDB Using Persistent Volume on GKE and Insert Records

### 1. Create a Cluster on GKE
Create a Kubernetes cluster named `kubia` using Google Kubernetes Engine (GKE) with 0 nodes.

### 2. Create a Persistent Volume
```bash
gcloud compute disks create mongodb --size=10GiB --zone=us-central1-a
```
Create a persistent disk of size 10GiB named `mongodb` in the `us-central1` zone.

### 3. Create MongoDB Deployment
```bash
kubectl apply -f mongodb-deployment.yaml
```
Deploy MongoDB to the Kubernetes cluster using the configuration specified in the `mongodb-deployment.yaml` file.

In case you get an error like below, follow the steps to fix that:
```bash
gcloud container clusters get-credentials mongodb-using-persi-vol-gke --region us-central1
```
Fetching cluster endpoint and auth data. Kubeconfig entry generated for `mongodb-using-persi-vol-gke`.

`mongodb-deployment.yaml`:
```yaml
apiVersion: v1
kind: PersistentVolume
metadata:
  name: mongodb-pv
spec:
  capacity:
    storage: 10Gi
  accessModes:
    - ReadWriteOnce
  gcePersistentDisk:
    pdName: mongodb
    fsType: ext4
---
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: mongodb-pvc
spec:
  accessModes:
    - ReadWriteOnce
  resources:
    requests:
      storage: 10Gi
---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mongodb-deployment
spec:
  selector:
    matchLabels:
      app: mongodb
  strategy:
    type: Recreate
  template:
    metadata:
      labels:
        app: mongodb
    spec:
      containers:
      - image: mongo
        name: mongo
        ports:
        - containerPort: 27017
        volumeMounts:
        - name: mongodb-data
          mountPath: /data/db
      volumes:
      - name: mongodb-data
        persistentVolumeClaim:
          claimName: mongodb-pvc
```

### 4. Check Deployment Pod
```bash
kubectl get pods
```
List all pods in the current namespace to check if the MongoDB pod is running.

### 5. Create MongoDB Service
`mongodb-service.yaml`:
```yaml
apiVersion: v1
kind: Service
metadata:
  name: mongodb-service
spec:
  type: LoadBalancer
  ports:
    - port: 27017
      targetPort: 27017
  selector:
    app: mongodb
```
```bash
kubectl apply -f mongodb-service.yaml
```
Create a service for MongoDB to allow external access to the MongoDB instance using the configuration in `mongodb-service.yaml`.

### 6. Check Service Status
```bash
kubectl get svc
```
List all services in the current namespace to check the status of the MongoDB service.

### 7. Test MongoDB Connection
```bash
kubectl exec -it mongodb-deployment-694c495656-28wjl -- bash
```
Execute an interactive bash shell on the MongoDB pod to test the connection using the external IP.
```bash
mongosh --host 34.71.187.5 --port 27017
```

### 8. Exit MongoDB Pod
```bash
exit
```

### 9. Insert Records into MongoDB
Create a Node.js script to connect to MongoDB and insert sample student records into the database.
```javascript
const { MongoClient } = require('mongodb');

async function run() {
  const url = "mongodb://34.71.187.5/studentdb"; 
  const client = new MongoClient(url);

  try {
    await client.connect();

    const db = client.db("studentdb");
    const collection = db.collection("students");

    const docs = [
      { student_id: 11111, student_name: "Bruce Lee", grade: 84 },
      { student_id: 22222, student_name: "Jackie Chen", grade: 93 },
      { student_id: 33333, student_name: "Jet Li", grade: 88 }
    ];

    const insertResult = await collection.insertMany(docs);
    console.log(`${insertResult.insertedCount} documents were inserted`);

    const result = await collection.findOne({ student_id: 11111 });
    console.log(result);
  } finally {
    await client.close();
  }
}

run().catch(console.dir);
```

## Step 2: Modify Student Server to Get Records from MongoDB and Deploy to GKE

### 1. Create `studentServer.js`
Create a Node.js server to retrieve student records from MongoDB and respond with JSON.
```javascript
const http = require('http');
const url = require('url');
const { MongoClient } = require('mongodb');
const { MONGO_URL, MONGO_DATABASE } = process.env;

const uri = `mongodb://${MONGO_URL}/${MONGO_DATABASE}`;
console.log(`MongoDB URI: ${uri}`);

const server = http.createServer(async (req, res) => {
  try {
    const parsedUrl = url.parse(req.url, true);
    const student_id = parseInt(parsedUrl.query.student_id);

    if (/^\/api\/score/.test(req.url) && student_id) {
      const client = new MongoClient(uri);
      await client.connect();
      const db = client.db(MONGO_DATABASE);

      try {
        const student = await db.collection("students").findOne({ "student_id": student_id });

        if (student) {
          const response = {
            student_id: student.student_id,
            student_name: student.student_name,
            student_score: student.grade
          };

          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(response));
        } else {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          res.end("Student Not Found\n");
        }
      } finally {
        await client.close();
      }
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end("Wrong URL, please try again\n");
    }
  } catch (err) {
    console.error(err);
    res.writeHead(500, { 'Content-Type': 'text/plain' });
    res.end("Internal Server Error\n");
  }
});

server.listen(8080, () => {
  console.log('Server is listening on port 8080');
});
```

### 2. Create Dockerfile
Define the Dockerfile to containerize the student server application.
```dockerfile
# Use a smaller base image
FROM node:alpine

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install mongodb

# Copy the rest of the application code
COPY . .

# Expose the port your app runs on
EXPOSE 8080

# Use CMD to run your application
CMD ["node", "studentServer.js"]
```

### 3. Build Docker Image
```bash
docker build -t student-server .
```
Build the Docker image for the student server.

### 4. Push Docker Image
```bash
docker push asdg124/mydbd:latest
```
Push the Docker image to Docker Hub.

## Step 3: Create Python Flask Bookshelf REST API and Deploy on GKE

### 1. Create `bookshelf.py`
Define a Flask application that provides a REST API for managing a bookshelf.
```python
from flask import Flask, request, jsonify
from flask_pymongo import PyMongo
from bson.objectid import ObjectId
import socket
import os

app = Flask(__name__)
app.config["MONGO_URI"] = "mongodb://" + os.getenv("MONGO_URL") + "/" + os.getenv("MONGO_DATABASE")
app.config['JSONIFY_PRETTYPRINT_REGULAR'] = True
mongo = PyMongo(app)
db = mongo.db

@app.route("/")
def index():
    hostname = socket.gethostname()
    return jsonify(
        message="Welcome to bookshelf app! I am running inside {} pod!".format(hostname)
    )

@app.route("/books")
def get_all_tasks():
    books = db.bookshelf.find()
    data = []
    for book in books:
        data.append({
            "id": str(book["_id"]),
            "Book Name": book["book_name"],
            "Book Author": book["book_author"],
            "ISBN": book["ISBN"]
        })
    return jsonify(data)

@app.route("/book", methods=["POST"])
def add_book():
    book = request.get_json(force=True)
    db.bookshelf.insert_one({
        "book_name": book["book_name"],
        "book_author": book["book_author"],
        "ISBN": book["isbn"]
    })
    return jsonify(message="Task saved successfully!")

@app.route("/book/<id>", methods=["PUT"])
def update_book(id):
    data = request.get_json(force=True)
    response = db.bookshelf.update_many(
        {"_id": ObjectId(id)},
        {"$set": {"book_name": data['book_name'], "book_author": data["book_author"], "ISBN": data["isbn"]}}
    )
    if response.matched_count:
        message = "Task updated successfully!"
    else:
        message

 = "No Book found!"
    return jsonify(message=message)

@app.route("/book/<id>", methods=["DELETE"])
def delete_book(id):
    response = db.bookshelf.delete_one({"_id": ObjectId(id)})
    if response.deleted_count:
        message = "Book deleted successfully!"
    else:
        message = "No book found!"
    return jsonify(message=message)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
```

### 2. Create Dockerfile
Define the Dockerfile to containerize the Flask application.
```dockerfile
FROM python:3.8-slim-buster

# Set the working directory
WORKDIR /app

# Copy the requirements file
COPY requirements.txt .

# Install dependencies
RUN pip install -r requirements.txt

# Copy the rest of the application code
COPY . .

# Expose the port your app runs on
EXPOSE 5000

# Use CMD to run your application
CMD ["python", "bookshelf.py"]
```

### 3. Create `requirements.txt`
Specify the required dependencies for the Flask application.
```plaintext
Flask==2.1.1
Flask-PyMongo==2.3.0
pymongo==4.2.0
```

### 4. Build Docker Image
```bash
docker build -t bookshelf-app .
```
Build the Docker image for the Flask application.

### 5. Push Docker Image
```bash
docker push asdg124/flask-mongodb:latest
```
Push the Docker image to Docker Hub.

## Step 4: Deploy Applications on Minikube

### 1. Start Minikube
```bash
minikube start
```
Start a Minikube cluster, which is a local Kubernetes environment for development and testing purposes.

### 2. Start Ingress
```bash
minikube addons enable ingress
```
Enable the Nginx ingress controller in Minikube.

### 3. Create YAML Files for Deployments and Services

#### `studentserver-deployment.yaml`
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: studentserver-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: studentserver
  template:
    metadata:
      labels:
        app: studentserver
    spec:
      containers:
      - name: studentserver
        image: asdg124/mydbd:latest
        ports:
        - containerPort: 8080
        env:
        - name: MONGO_URL
          value: "mongodb-service:27017"
        - name: MONGO_DATABASE
          value: "studentdb"
```

#### `studentserver-configmap.yaml`
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: studentserver-config
data:
  MONGO_URL: "mongodb-service:27017"
  MONGO_DATABASE: "studentdb"
```

#### `studentserver-service.yaml`
```yaml
apiVersion: v1
kind: Service
metadata:
  name: studentserver-service
spec:
  selector:
    app: studentserver
  ports:
    - protocol: TCP
      port: 8080
      targetPort: 8080
```

#### `bookshelf-deployment.yaml`
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: bookshelf-deployment
spec:
  replicas: 1
  selector:
    matchLabels:
      app: bookshelf
  template:
    metadata:
      labels:
        app: bookshelf
    spec:
      containers:
      - name: bookshelf-app
        image: asdg124/flask-mongodb:latest
        ports:
        - containerPort: 5000
        env:
        - name: MONGO_URL
          value: "mongodb-service:27017"
        - name: MONGO_DATABASE
          value: "studentdb"
```

#### `bookshelf-configmap.yaml`
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: bookshelf-config
data:
  MONGO_URL: "mongodb-service:27017"
  MONGO_DATABASE: "studentdb"
```

#### `bookshelf-service.yaml`
```yaml
apiVersion: v1
kind: Service
metadata:
  name: bookshelf-service
spec:
  type: LoadBalancer
  ports:
    - port: 80
      targetPort: 5000
  selector:
    app: bookshelf
```

### 4. Apply Student Server Deployment and Service
```bash
kubectl apply -f studentserver-deployment.yaml
kubectl apply -f studentserver-configmap.yaml
kubectl apply -f studentserver-service.yaml
```

### 5. Apply Bookshelf Deployment and Service
```bash
kubectl apply -f bookshelf-deployment.yaml
kubectl apply -f bookshelf-configmap.yaml
kubectl apply -f bookshelf-service.yaml
```

### 6. Check Pods Status
```bash
kubectl get pods
```
Check the status of all pods in the Kubernetes cluster.

### 7. Create Ingress Configuration
`studentservermongoIngress.yaml`:
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: server
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /$2
spec:
  rules:
  - host: cs571.project.com
    http:
      paths:
      - path: /studentserver(/|$)(.*)
        pathType: ImplementationSpecific
        backend:
          service:
            name: studentserver-service
            port:
              number: 8080
      - path: /bookshelf(/|$)(.*)
        pathType: ImplementationSpecific
        backend:
          service:
            name: bookshelf-service
            port:
              number: 5000
```

### 8. Apply Ingress Configuration
```bash
kubectl apply -f studentservermongoIngress.yaml
```
Apply the ingress configuration to route traffic to the Student Server and Bookshelf services based on the URL path.

### 9. Check Ingress Status
```bash
kubectl get ingress
```
Check the status of the ingress resource.

### 10. Update /etc/hosts
```bash
minikube ip
```
Get the Minikube IP address.
```bash
sudo vi /etc/hosts
```
Add the line:
```plaintext
192.168.49.2 cs571.project.com
```
Map the ingress address to the domain name `cs571.project.com`.

### 11. Access the Applications
Use `curl` to test the endpoints of the Student Server and Bookshelf applications.
```bash
# Access Student Server
curl cs571.project.com/studentserver/api/score?student_id=11111

# List all books in Bookshelf
curl cs571.project.com/bookshelf/books

# Add a book
curl -X POST -d "{\"book_name\": \"cloud computing\",\"book_author\": \"unknown\", \"isbn\": \"123456\" }" http://cs571.project.com/bookshelf/book

# Update a book
curl -X PUT -H "Content-Type: application/json" -d '{"book_name": "Updated Book Name", "book_author": "Updated Author", "isbn": "Updated ISBN"}' http://cs571.project.com/bookshelf/book/66a87500f086ee9aa5b9bae1

# Delete a book
curl -X DELETE http://cs571.project.com/bookshelf/book/66a87500f086ee9aa5b9bae1
```
These commands test the functionality of the deployed applications by performing various CRUD operations via the REST API endpoints.


## 4. Screenshots of Execution Results

### Implementation Guide (Follow the pdf below)
[Implemenation and Testing with screenshots](https://github.com/ASD-Are/Cloud-Computing/blob/main/Signature%20Project%20MongoDB_PythonFlaskWebFramework_RESTAPI_GKE/CS571_week11_q5_20073_Aron_Dagniew.pdf)

## Appendix
[Google Slide](https://docs.google.com/presentation/d/1jHGIJ2TDku_-0syDa7dGuONlC2uSy89qjCjEzLeO-is/edit?usp=sharing)
