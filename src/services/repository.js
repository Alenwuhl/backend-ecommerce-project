import UserServiceDao from "../daos/mongo/users.service";
import ProductServiceDao from "../daos/mongo/products.service";
import CartServiceDao from "../daos/mongo/carts.service";

import UserRepository from "../services/repository/users.repository.js"
import ProductRepository from "../services/repository/products.repository.js"
import CartRepository from "../services/repository/carts.repository.js"

//Instances of Dao Classes
const userDao = new UserServiceDao()
const productDao = new ProductServiceDao()
const cartDao = new CartServiceDao()

export const userService = UserRepository(userDao)
export const productService = ProductRepository(productDao)
export const cartService = CartRepository(cartDao)