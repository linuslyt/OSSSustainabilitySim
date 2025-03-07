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

1. **Clone the github repo**  
2. **Change directory into the osssimbackend directory**  
3. Create a `.env` file in `backend/osssimbackend/osssimbackend/settings.py` and populate with the following:

    ```text
    DJANGO_SECRET_KEY='askDevsForKey'
    DEBUG=True
    ALLOWED_HOSTS=localhost,127.0.0.1
    ```

4. **Build the docker image - make sure the Dockerfile is in the directory** :

```sh
      docker build -t osssim-django-api . 
```

5. **Run the container**:

```sh
      docker run -p 8000:8000 osssim-django-api
```

6. **Go to `http://127.0.0.1:8000/api/schema/swagger-ui/` on your localhost to see the swagger-ui page**:

Repeat Steps 4-5 whenever changes are made.

Happy Coding!
