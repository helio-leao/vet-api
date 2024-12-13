# Project Overview

This project is a Rest **express** API for vets and patients data management. It utilizes **bcrypt** for passwords cryptography, **jwt** for api token security and stores data to a **mongo** database.

---

## Branches

1. **main**

   - The main branch.

2. **cloudinary**

   - Implements cloudinary to store the pictures of the app.

---

## Installation

1. Clone the repository.
2. Navigate to the project directory.
3. Create a `.env` file in the root of the project. Add the following variables:  
   PORT={the port in which the api will be accessible}  
   ACCESS_TOKEN_SECRET={a secrect for access tokens}  
   REFRESH_TOKEN_SECRET={a secrect for refresh tokens}  
   DATABASE_URL={your mongodb url}  
   CLOUDINARY_CLOUD_NAME={your cloudinary account cloud name}  
   CLOUDINARY_API_KEY={your cloudinary account api key}  
   CLOUDINARY_SECRET_KEY={your cloudinary account api secret key}
4. Choose the branch you want to work on.
5. Run `npm install` to install the dependencies.
6. Run `npm run dev` to start the server.
