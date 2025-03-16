# OSS Simulator OpenAPI Documentation

## Project Setup

Follow the steps below to set up and run the OSSSIM REST API documentation using **drf-spectacular**.

---

## **1. Setting Up the Virtual Environment**

1. **Create a Virtual Environment** (if not already created):

   ```sh
   python -m venv [preferred_name]
   ```

2. **Activate the Virtual Environment**:
   - **Windows:**

     ```sh
     [preferred_name]\\Scripts\\activate
     ```

   - **Mac/Linux:**

     ```sh
     source [preferred_name]/bin/activate
     ```

3. **Install Dependencies**:

   ```sh
   pip install -r requirements.txt
   ```

---

## **2. Running the Django Server**

Once the virtual environment is set up and dependencies are installed, start the Django development server:

```sh
python manage.py runserver
```

This will start the server at **<http://127.0.0.1:8000/>**.

---

## **3. Accessing the API Documentation**

After running the server, you can view the automatically generated **Swagger UI** for the API documentation by visiting:

👉 [Swagger UI](http://127.0.0.1:8000/api/schema/swagger-ui/)

---

## **Additional Notes**

- Ensure that `drf-spectacular` is installed and configured in `settings.py`.
- If any issues arise, check if all dependencies are installed correctly.
- You can also generate and save the OpenAPI schema using:

  ```sh
  python manage.py spectacular --color --file openapi-schema.yaml
  ```

## Get a Quick Setup With Docker

### Option 1: Using Docker Run

1. **Clone the github repo**  
2. **Change directory into the osssimbackend directory**  
3. Create a `.env` file in `backend/osssimbackend/` and populate with the following:

    ```text
    DJANGO_SECRET_KEY='askDevsForKey'
    DEBUG=True
    ALLOWED_HOSTS=localhost,127.0.0.1

    #Redis config 
    REDIS_HOST = 127.0.0.1
    REDIS_PORT = 6379
    REDIS_DB = 1
    ```

4. **Build the docker image - make sure the Dockerfile is in the directory** :

```sh
docker build -t osssim-api . 
```

5. **Run the container**:

```sh
docker run -p 8000:8000 osssim-django-api
```

### Option 2: Using Docker Compose - Includes redis caching (Recommended)

The Docker Compose option provides a more convenient way to run the application with Redis and any other services you might need.

1. **Clone the github repo**  
2. **Change directory into the osssimbackend directory**  
3. Create a `.env` file in the project root with the same contents as above
4. **Run the application using Docker Compose**:

```sh
docker-compose up
```

This will start both the Django application and Redis services together. To run in detached mode (in the background):

```sh
docker-compose up -d
```

5. To rebuild the images after making changes:

```sh
docker-compose up --build
```

6. To stop the services:

```sh
docker-compose down
```

7. **Access the application at `http://127.0.0.1:8000/api/schema/swagger-ui/`**

## Connecting to Redis

The project uses Redis for caching and other functionalities. When running with Docker Compose, Redis will be automatically configured and connected. The Redis service runs on the default port (6379).

To verify Redis is running:

```sh
docker ps
```

Look for a container with "redis" in the name.

Happy Coding!