### Project: Deploying a Machine Learning Model using Docker, Kubernetes, and Flask
---

### Set Up the Environment

1. **Install Google Cloud SDK**
   - Follow the instructions [here](https://cloud.google.com/sdk/docs/install) to install the Google Cloud SDK.

2. **Install Docker**
   - Follow the instructions [here](https://docs.docker.com/get-docker/) to install Docker on your machine.

3. **Install Kubernetes CLI (kubectl)**
   - Follow the instructions [here](https://kubernetes.io/docs/tasks/tools/install-kubectl/) to install kubectl.

4. **Install Minikube (for local Kubernetes cluster)**
   - Follow the instructions [here](https://minikube.sigs.k8s.io/docs/start/) to install Minikube.

---

### Download Programs and Related Documentation

1. **Clone the Repository**
   - Clone the project repository from GitHub:
     ```sh
     git clone https://github.com/ASD-Are/Cloud-Computing.git
     cd Cloud-Computing/ML/ML-in-Kubernetes
     ```

2. **Download Pre-trained Model**
   - Ensure you have the pre-trained model (`logreg.pkl`) in the project directory. If not, follow the instructions in the repository to train and save the model.

---

### Process of Program Execution

#### Step 1: Create a Kubernetes Cluster

- **Command:**
  ```sh
  gcloud container clusters create kubia --num-nodes=1 --machine-type=e2-micro --region=us-west1
  ```
- This sets up a Kubernetes cluster named 'kubia' with one node.

#### Step 2: Verify the Cluster and Nodes

- **Commands:**
  ```sh
  gcloud container clusters list
  minikube start
  ```

#### Step 3: Train a Machine Learning Model

- Train the logistic regression model on the Iris dataset as shown in the implementation section of the project.

#### Step 4: Save and Export the Model

- Use libraries like pickle to save the trained model for future use.

#### Step 5: Create a Flask App

- Create a Flask application to serve the model predictions. Example code is provided in the implementation section.

#### Step 6: Create a Dockerfile

- Example Dockerfile:
  ```
  FROM python:3.8-slim
  WORKDIR /app
  COPY . /app
  RUN pip install --no-cache-dir -r requirements.txt
  EXPOSE 5000
  CMD ["python", "flask_api.py"]
  ```

#### Step 7: Create the Requirements File

- Example requirements.txt:
  ```
  flask==1.1.1
  gunicorn==19.9.0
  itsdangerous==1.1.0
  Jinja2==2.10.1
  MarkupSafe==1.1.1
  Werkzeug==0.15.5
  numpy>=1.9.2
  scipy>=0.15.1
  scikit-learn==0.22.1
  matplotlib>=1.4.3
  pandas>=0.19
  flasgger==0.9.4
  ```

#### Step 8: Upload the Necessary Files

- Ensure all necessary files, including `flask_api.py`, `requirements.txt`, and `logreg.pkl`, are in the project directory.

#### Step 9: Build and Run the Docker Container

- **Build the Docker Image:**
  ```sh
  sudo docker build -t ml_app_docker .
  ```
- **Run the Docker Container:**
  ```sh
  sudo docker container run -p 5000:5000 ml_app_docker
  ```

#### Step 10: Access the Application

- **Preview on Port 5000:**
  - In the terminal, click the web preview option and select "Preview on port 5000". If the port is not set to 5000 by default, change it accordingly.
- **Swagger UI:**
  - Access the Swagger UI at `/apidocs/`.

---

### Screenshot of Execution Results

Include screenshots of the following:

1. **Swagger UI Interface**: [Refer here](https://github.com/ASD-Are/Cloud-Computing/blob/main/ML/ML%20in%20Kubernetes/CS571_week10_q2_20073_Aron_Dagniew.docx)

2. **Prediction Results**: [Refer here](https://github.com/ASD-Are/Cloud-Computing/blob/main/ML/ML%20in%20Kubernetes/CS571_week10_q2_20073_Aron_Dagniew.docx)

### Conclusion

This project successfully demonstrates the deployment of a machine learning model using Docker and Kubernetes. The approach ensures scalability, portability, and ease of management, making it a robust solution for deploying machine learning applications.

### Appendix
- [Google Slide Presentation](https://docs.google.com/presentation/d/1_-ibiRY6ws_aG1w6kekAqjcYE-JR6-Zte-8z2pHyxi0/edit?usp=sharing)
- [Kubernetes Documentation](https://kubernetes.io/docs/home/)
- [Docker Documentation](https://docs.docker.com/)
- [Flask Documentation](https://flask.palletsprojects.com/en/2.0.x/)
- [Google Cloud Documentation](https://cloud.google.com/docs)
