# Ecommerce Backend Project with Node.js

## Description

This is a Node.js backend project that provides all the necessary functionalities for an ecommerce platform, except for the payment part. To interact with the routes, you can use Postman. Additionally, here is the link to my repository of a basic frontend that uses some of the most important routes from this backend: https://github.com/Alenwuhl/Basic-frontend-ecommerce.git

In case you do not want to open and download the frontend, here is a brief YouTube video showing my frontend: https://youtu.be/8S7xaPgIndk

The project uses MongoDB and can be configured to work with both a factory approach and a repository model.

## Usage

To start using the application, you need to register and log in, as detailed below. The application is designed for ease of use, providing a secure and personalized experience for each user.
If you register through the frontend, you will register with the role "user". If you do it through Postman, you can include a "role" either "user", "admin", or "premium". The latter two have authorizations that the normal user does not have.

It is important to note at this point that all Postman routes can be tested either through localhost or https://finished-backend-project.onrender.com as the backend is deployed accordingly.

## Registration and Login

To register and log in to the application, follow these steps:

1. Go to the endpoint /api/users/register using a tool like Postman.
2. Submit your personal information in the request body, including first_name, last_name,     email, age, and password.
3. To register with admin permissions, make sure to include the role admin in your            registration data. Similarly, you can register as a premium user by specifying the         premium role.

After registering, log in as follows:

1. Go to the endpoint /api/users/login.
2. Enter your registered email and password.
3. If the login is successful, your session will remain active for a limited time, during which you can access all the application's functionalities.


## User Routes (/api/users)

- **GET `/`** - Retrieves all users.
- **GET `/current`** - Returns a DTO with relevant data of the active user.
- **POST `/process-to-reset-password`** - Initiates the process (via email) to reset the password if necessary.
- **POST `/resetPassword/:token`** - Changes the password after initiating the process with the previous route. The token is valid for one hour.
- **POST `/register`** - Registers a new user.
- **POST `/login`** - Logs in a user.
- **POST `/premium/:uid`** - Allows a user or premium user to change their role to premium or vice versa by passing the user ID in the parameters and the new role in the request body. You must add the required documents.
- **DELETE `/deleteInactiveUsers`** -Deletes users with no activity in the last 48 hours.
- **DELETE `/user/:uid`** - Deletes a user by their ID.


## Product and Cart Routes

### `/api/carts`:

- **POST `/:cid/purchase`** - Completes the purchase in a specific cart.
- **GET `/`** - Retrieves the carts.
- **GET `/:cid`** - Retrieves a specific cart.
- **POST `/`**, `authorization (["user", "premium"])` - Adds products to the cart. For premium users, this is valid as long as they are not the owners of the product.
- **POST `/cart/:cartId/product`** - Adds a product to an existing cart.
- **DELETE `/cart/:cartId/product/:productId`** - Removes a product from the cart.
- **DELETE `/cart/:cartId`** - Deletes a cart.

### `/api/products`:

- **GET `/`** - Retrieves all products.
- **GET `/:pID`** - Retrieves a specific product by ID.
- **POST `/`**, `authorization (['admin', 'premium'])` - Creates a new product.
- **PUT `/:pid`**, `authorization('admin')` - Allows the admin to update a product.
- **DELETE `/:pid`**, `authorization (['admin', 'premium'])` - Allows the admin and premium user to delete a product. A user with a premium role can only delete products they own.

## Deployment

For now, this project can be deployed on local servers. You can also test basic functionalities through the deployment link provided in the description.

## Built With

- **Node.js** - JavaScript runtime environment.
- **Express** - Web application framework.
- **MongoDB** - Database system.

## Authors

- **Alen Wuhl**

## Note

You can test specific functionalities for users with certain roles, such as user, premium, or admin, by logging in with the following credentials:

### Basic user functionalities:

- **Email**: `"user@example.com"`
- **Password**: `"User123"`

### Premium user functionalities:

- **Email**: `"premium@example.com"`
- **Password**: `"premium123"`

### Admin functionalities:

- **Email**: `"admin@example.com"`
- **Password**: `"Admin123"`
