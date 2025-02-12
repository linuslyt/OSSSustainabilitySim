<<<<<<< HEAD
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

This will start the server at **http://127.0.0.1:8000/**.

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

Happy Coding

=======
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

This will start the server at **http://127.0.0.1:8000/**.

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

Happy Coding

>>>>>>> c36892885fc85ac260ae0f51a404826f32133b0d
