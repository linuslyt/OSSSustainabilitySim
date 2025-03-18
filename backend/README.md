# OSS Simulator OpenAPI Documentation

## Recommended setup

1. Clone the github repo
2. `cd backend/osssimbackend/`
3. Create a `.env` file in the directory and populate with the following:

    ```txt
    DJANGO_SECRET_KEY='askDevsForKey'
    DEBUG=True
    ALLOWED_HOSTS=localhost,127.0.0.1

    #Redis config 
    REDIS_HOST = 127.0.0.1
    REDIS_PORT = 6379
    REDIS_DB = 1
    ```

4. Build the docker image. **IMPORTANT: if you have an AArch64 machine (e.g. Apple Silicon Macs), ensure you specify the right dockerfile with the `-f` flag as below.**

    ```sh
    # x86 / Intel / Windows
    docker build -t osssim-api . --no-cache
    # AArch64 / ARM / Apple Silicon
    docker build -t osssim-api . --no-cache -f Dockerfile_ARM
    ```

5. Run the application using Docker Compose:

    ```sh
    docker-compose up
    ```

    This will start both the Django application and Redis services together. To run in detached mode (in the background):

    ```sh
    docker-compose up -d
    ```

6. Server is now running. To access the Swagger UI page for testing the API, visit `http://127.0.0.1:8000/api/schema/swagger-ui/`.

7. To stop the services:

    ```sh
    docker-compose down
    ```

**IMPORTANT: Rerun steps 4-5 whenever backend code changes are made.**

---

## Legacy setups

These setups may be broken. Instructions are kept here for posterity but you should be using the recommended setup above.

### Manual docker setup

#### Using Docker Run

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
docker run -p 8000:8000 osssim-api
```

#### Connecting to Redis

The project uses Redis for caching and other functionalities. When running with Docker Compose, Redis will be automatically configured and connected. The Redis service runs on the default port (6379).

To verify Redis is running:

```sh
docker ps
```

Look for a container with "redis" in the name.

### Manual setup (no Redis)

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

4. **Run the Django Server**

    Once the virtual environment is set up and dependencies are installed, start the Django development server:

    ```sh
    python manage.py runserver
    ```

    This will start the server at `http://127.0.0.1:8000/`

5. Server is now running. To access the Swagger UI page for testing the API, visit `http://127.0.0.1:8000/api/schema/swagger-ui/`.

    **Notes**:

    - Ensure that `drf-spectacular` is installed and configured in `settings.py`.
    - If any issues arise, check if all dependencies are installed correctly.
    - You can also generate and save the OpenAPI schema using:

      ```sh
      python manage.py spectacular --color --file openapi-schema.yaml
      ```
